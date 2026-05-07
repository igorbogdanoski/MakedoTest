/**
 * StudentTake — UI за студентско решавање на тест.
 *
 * MVP опсег (Phase 2.1):
 *   • Прифаќа `test` (валидиран преку `domain/schema`) и опционо `code`.
 *   • Auto-save во localStorage по `code` (offline draft).
 *   • Auto-grading на крајот со breakdown по прашање.
 *   • Подржува multiple, true-false, checklist, ordering, statements, multi-match,
 *     matching, multi-part. Manual типови покажуваат „рачно оценување“.
 *   • a11y: правилна semantika (radiogroup, fieldset/legend), keyboard navigation.
 *
 * Идно (Phase 2.2+): per-question timer, lockdown mode, resume token, PWA offline.
 */

import { useEffect, useMemo, useState } from 'react';
import { gradeTest, percentageToGrade } from '../grading/grade';
import RenderContent from '../../components/RenderContent';
import { readDraftIndexedDb, removeDraftIndexedDb, writeDraftIndexedDb } from './draftStorage';

const STORAGE_PREFIX = 'makedo:take:';
const OPEN_RESPONSE_TYPES = new Set(['short-answer', 'fill-blanks', 'essay']);

const MATH_INSERT_TOOLS = [
  { label: 'sqrt', cmd: '$\\sqrt{}$' },
  { label: 'frac', cmd: '$\\frac{}{}$' },
  { label: 'pi', cmd: '$\\pi$' },
  { label: 'x^2', cmd: '$x^2$' },
  { label: 'x_n', cmd: '$x_n$' },
  { label: 'theta', cmd: '$\\theta$' },
];

function fallbackHash(input) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

async function sha256Hex(input) {
  try {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return fallbackHash(input);
  }
}

async function buildSubmissionProof({ test, code, responses, attachmentByQuestion }) {
  const submittedAt = Date.now();
  const attachmentList = Object.entries(attachmentByQuestion || {}).map(([questionId, meta]) => ({
    questionId,
    name: meta?.name || '',
    size: Number(meta?.size || 0),
    type: meta?.type || 'application/octet-stream',
    fileHash: meta?.fileHash || '',
  }));

  const canonicalPayload = JSON.stringify({
    testId: test?.id || null,
    code: code || null,
    submittedAt,
    responses,
    attachments: attachmentList,
  });

  const payloadHash = await sha256Hex(canonicalPayload);
  const verificationId = payloadHash.slice(0, 12).toUpperCase();
  const qrPayload = {
    v: 1,
    verificationId,
    payloadHash,
    submittedAt,
    testId: test?.id || null,
    code: code || null,
  };

  const qrText = JSON.stringify(qrPayload);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrText)}`;

  return {
    verificationId,
    payloadHash,
    submittedAt,
    qrPayload,
    qrUrl,
    attachments: attachmentList,
  };
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function useDraft(code, initialResponses = null) {
  const canHydrateFromIndexedDb = import.meta.env.MODE !== 'test';
  const key = code ? `${STORAGE_PREFIX}${code}` : null;
  const [isHydratedFromInitial, setIsHydratedFromInitial] = useState(false);
  const [isHydratedFromIdb, setIsHydratedFromIdb] = useState(false);
  const [responses, setResponses] = useState(() => {
    if (!key) return {};
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (isHydratedFromInitial) return;
    if (!isPlainObject(initialResponses)) {
      setIsHydratedFromInitial(true);
      return;
    }
    setResponses((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      return initialResponses;
    });
    setIsHydratedFromInitial(true);
  }, [initialResponses, isHydratedFromInitial]);

  useEffect(() => {
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(responses));
    } catch {
      // quota exceeded — тивко продолжуваме
    }

    writeDraftIndexedDb(key, responses);
  }, [key, responses]);

  useEffect(() => {
    if (!key || isHydratedFromIdb || !canHydrateFromIndexedDb) {
      if (!isHydratedFromIdb) setIsHydratedFromIdb(true);
      return;
    }

    let cancelled = false;
    readDraftIndexedDb(key).then((value) => {
      if (cancelled) return;

      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.keys(responses).length === 0
      ) {
        setResponses(value);
      }
      setIsHydratedFromIdb(true);
    });

    return () => {
      cancelled = true;
    };
  }, [key, isHydratedFromIdb, responses, canHydrateFromIndexedDb]);

  const clear = () => {
    if (key) localStorage.removeItem(key);
    if (key) removeDraftIndexedDb(key);
    setResponses({});
  };

  return [responses, setResponses, clear];
}

function MultipleInput({ q, value, onChange }) {
  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">Опции</legend>
      {q.options.map((opt, i) => (
        <label
          key={i}
          className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3 hover:bg-brand-50"
        >
          <input
            type="radio"
            name={`q-${q.id}`}
            checked={value === i}
            onChange={() => onChange(i)}
            className="mt-1"
          />
          <RenderContent text={opt} />
        </label>
      ))}
    </fieldset>
  );
}

function TrueFalseInput({ q, value, onChange }) {
  return (
    <fieldset className="flex gap-3">
      <legend className="sr-only">Точно или Неточно</legend>
      {[
        { v: 0, label: 'Точно' },
        { v: 1, label: 'Неточно' },
      ].map((o) => (
        <label
          key={o.v}
          className={`flex-1 cursor-pointer rounded-md border p-3 text-center ${
            value === o.v ? 'border-brand-500 bg-brand-50' : 'border-slate-200'
          }`}
        >
          <input
            type="radio"
            name={`q-${q.id}`}
            checked={value === o.v}
            onChange={() => onChange(o.v)}
            className="sr-only"
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}

function ChecklistInput({ q, value, onChange }) {
  const set = new Set(Array.isArray(value) ? value : []);
  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">Избери ги точните</legend>
      {q.options.map((opt, i) => (
        <label
          key={i}
          className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3 hover:bg-brand-50"
        >
          <input
            type="checkbox"
            checked={set.has(i)}
            onChange={(e) => {
              const next = new Set(set);
              if (e.target.checked) next.add(i);
              else next.delete(i);
              onChange([...next].sort((a, b) => a - b));
            }}
            className="mt-1"
          />
          <RenderContent text={opt} />
        </label>
      ))}
    </fieldset>
  );
}

function ManualInput({ value, onChange, kind, attachment, onAttachmentChange }) {
  const [mathOpen, setMathOpen] = useState(false);

  const insertMath = (token) => {
    const current = String(value ?? '');
    onChange(`${current}${token}`);
  };

  if (kind === 'long') {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMathOpen((v) => !v)}
            className="rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-xs text-brand-700"
          >
            {mathOpen ? 'Скриј мат алатки' : 'Математички едитор'}
          </button>
          <label className="cursor-pointer rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700">
            Прикачи ракопис
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                const fingerprint = `${file.name}:${file.size}:${file.type}:${file.lastModified}`;
                const fileHash = await sha256Hex(fingerprint);
                onAttachmentChange?.({
                  name: file.name,
                  size: file.size,
                  type: file.type || 'application/octet-stream',
                  lastModified: file.lastModified,
                  fileHash,
                });
              }}
            />
          </label>
          {attachment?.name && (
            <span className="text-xs text-ink-muted">Прикачено: {attachment.name}</span>
          )}
        </div>
        {mathOpen && (
          <div className="flex flex-wrap gap-2 rounded-md border border-brand-100 bg-brand-50/40 p-2">
            {MATH_INSERT_TOOLS.map((tool) => (
              <button
                key={tool.label}
                type="button"
                onClick={() => insertMath(tool.cmd)}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
              >
                {tool.label}
              </button>
            ))}
          </div>
        )}
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="w-full rounded-md border border-slate-300 p-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          placeholder="Твојот одговор..."
        />
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMathOpen((v) => !v)}
          className="rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-xs text-brand-700"
        >
          {mathOpen ? 'Скриј мат алатки' : 'Математички едитор'}
        </button>
        <label className="cursor-pointer rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700">
          Прикачи ракопис
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              const fingerprint = `${file.name}:${file.size}:${file.type}:${file.lastModified}`;
              const fileHash = await sha256Hex(fingerprint);
              onAttachmentChange?.({
                name: file.name,
                size: file.size,
                type: file.type || 'application/octet-stream',
                lastModified: file.lastModified,
                fileHash,
              });
            }}
          />
        </label>
        {attachment?.name && (
          <span className="text-xs text-ink-muted">Прикачено: {attachment.name}</span>
        )}
      </div>
      {mathOpen && (
        <div className="flex flex-wrap gap-2 rounded-md border border-brand-100 bg-brand-50/40 p-2">
          {MATH_INSERT_TOOLS.map((tool) => (
            <button
              key={tool.label}
              type="button"
              onClick={() => insertMath(tool.cmd)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
            >
              {tool.label}
            </button>
          ))}
        </div>
      )}
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 p-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        placeholder="Твојот одговор..."
      />
    </div>
  );
}

function QuestionView({ q, index, value, onChange, attachment, onAttachmentChange }) {
  if (q.type === 'section') {
    return (
      <h2 className="mt-6 border-l-4 border-brand-500 pl-3 text-xl font-semibold text-ink">
        <RenderContent text={q.text} />
      </h2>
    );
  }

  return (
    <article className="card p-4">
      <header className="mb-3 flex items-baseline justify-between">
        <h3 className="text-lg font-medium text-ink">
          <span className="mr-2 text-ink-subtle">{index + 1}.</span>
          <RenderContent text={q.text} />
        </h3>
        {q.points != null && <span className="text-sm text-ink-muted">{q.points} поени</span>}
      </header>

      {q.type === 'multiple' && <MultipleInput q={q} value={value} onChange={onChange} />}
      {q.type === 'true-false' && <TrueFalseInput q={q} value={value} onChange={onChange} />}
      {q.type === 'checklist' && <ChecklistInput q={q} value={value} onChange={onChange} />}
      {(q.type === 'short-answer' || q.type === 'fill-blanks') && (
        <ManualInput
          q={q}
          value={value}
          onChange={onChange}
          kind="short"
          attachment={attachment}
          onAttachmentChange={onAttachmentChange}
        />
      )}
      {q.type === 'essay' && (
        <ManualInput
          q={q}
          value={value}
          onChange={onChange}
          kind="long"
          attachment={attachment}
          onAttachmentChange={onAttachmentChange}
        />
      )}
      {!['multiple', 'true-false', 'checklist', 'short-answer', 'fill-blanks', 'essay'].includes(
        q.type
      ) && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Овој тип задача (<code>{q.type}</code>) е поддржан во полна верзија. MVP примерок
          прикажува само рачно поле.
          <ManualInput
            q={q}
            value={value}
            onChange={onChange}
            kind="long"
            attachment={attachment}
            onAttachmentChange={onAttachmentChange}
          />
        </p>
      )}
    </article>
  );
}

export default function StudentTake({
  test,
  code = null,
  onSubmit,
  initialResponses = null,
  initialResumeToken = null,
  resumeWarning = null,
  onSaveResume,
}) {
  const [responses, setResponses, clearDraft] = useDraft(code, initialResponses);
  const [attachmentByQuestion, setAttachmentByQuestion] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submissionProof, setSubmissionProof] = useState(null);
  const [resumeToken, setResumeToken] = useState(initialResumeToken);
  const [resumeMessage, setResumeMessage] = useState(null);

  useEffect(() => {
    setResumeToken(initialResumeToken ?? null);
  }, [initialResumeToken]);

  const result = useMemo(
    () => (submitted ? gradeTest(test, responses) : null),
    [submitted, test, responses]
  );

  const answered = useMemo(
    () =>
      test.questions.filter(
        (q) =>
          q.type !== 'section' &&
          ((responses[q.id] != null && responses[q.id] !== '') ||
            (OPEN_RESPONSE_TYPES.has(q.type) && !!attachmentByQuestion[q.id]))
      ).length,
    [test, responses, attachmentByQuestion]
  );
  const total = test.questions.filter((q) => q.type !== 'section').length;
  const progress = total === 0 ? 0 : Math.round((answered / total) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultNow = gradeTest(test, responses);
    const proof = await buildSubmissionProof({
      test,
      code,
      responses,
      attachmentByQuestion,
    });
    setSubmissionProof(proof);
    setSubmitted(true);
    if (onSubmit) {
      onSubmit({
        responses,
        result: resultNow,
        attachments: attachmentByQuestion,
        submissionProof: proof,
      });
    }
  };

  const handleSaveResume = async () => {
    if (!onSaveResume) return;
    setResumeMessage('Се зачувува токен за продолжување...');
    const save = await onSaveResume(responses, resumeToken);
    if (save?.ok) {
      setResumeToken(save.resumeToken);
      setResumeMessage(`Resume токен: ${save.resumeToken}`);
      return;
    }
    setResumeMessage(save?.error ?? 'Неуспешно зачувување на resume токен.');
  };

  if (submitted && result) {
    const grade = percentageToGrade(result.percentage);
    return (
      <section className="mx-auto max-w-3xl p-6">
        <div className="card p-6 text-center">
          <h1 className="text-2xl font-semibold text-ink">Тестот е завршен</h1>
          <p className="mt-2 text-ink-muted">{test.title}</p>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold text-brand-600">{result.earned}</div>
              <div className="text-sm text-ink-muted">/ {result.max} поени</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand-600">{result.percentage}%</div>
              <div className="text-sm text-ink-muted">успех</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">{grade.grade}</div>
              <div className="text-sm text-ink-muted">{grade.label}</div>
            </div>
          </div>
          {result.requiresManual && (
            <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              Дел од прашањата бараат рачно оценување од наставник.
            </p>
          )}
          {submissionProof && (
            <div className="mt-4 rounded-md border border-slate-200 bg-white p-3 text-left">
              <p className="text-xs text-ink-muted">QR верификација</p>
              <p className="text-sm font-semibold text-ink">
                Verification ID: {submissionProof.verificationId}
              </p>
              <p className="text-xs break-all text-ink-muted">
                Hash: {submissionProof.payloadHash}
              </p>
              <img
                src={submissionProof.qrUrl}
                alt="QR код за верификација на предадениот одговор"
                className="mt-3 h-36 w-36 rounded border border-slate-200"
              />
              {submissionProof.attachments.length > 0 && (
                <p className="mt-2 text-xs text-ink-muted">
                  Прикачени прилози: {submissionProof.attachments.length}
                </p>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              clearDraft();
              setSubmitted(false);
              setSubmissionProof(null);
            }}
            className="btn-ghost mt-6"
          >
            Започни одново
          </button>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-4 p-6">
      <header className="card p-4">
        <h1 className="text-xl font-semibold text-ink">{test.title || 'Тест'}</h1>
        {test.subject && <p className="text-sm text-ink-muted">{test.subject}</p>}
        {resumeWarning && (
          <p className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-800">{resumeWarning}</p>
        )}
        <div className="mt-3" aria-label={`Напредок: ${progress}%`}>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            {answered} / {total} одговорени
          </p>
        </div>
        {onSaveResume && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleSaveResume} className="btn-ghost">
              Зачувај продолжување
            </button>
            {resumeMessage && <p className="text-xs text-ink-muted">{resumeMessage}</p>}
          </div>
        )}
      </header>

      {test.questions.map((q, i) => (
        <QuestionView
          key={q.id}
          q={q}
          index={i}
          value={responses[q.id]}
          onChange={(v) => setResponses((r) => ({ ...r, [q.id]: v }))}
          attachment={attachmentByQuestion[q.id] || null}
          onAttachmentChange={(meta) =>
            setAttachmentByQuestion((prev) => ({
              ...prev,
              [q.id]: meta,
            }))
          }
        />
      ))}

      <div className="sticky bottom-4 flex justify-end">
        <button type="submit" className="btn-primary shadow-elev">
          Заврши и испрати
        </button>
      </div>
    </form>
  );
}
