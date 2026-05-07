import { useState } from 'react';
import { listPublishedAttempts, listQuestionAttachments, loadPublishedTest } from './publish';
import { requestProofVerification } from './proofClient';

function VerifyCard({ title, payload, signature, metaLines = [], actionLabel = 'Verify' }) {
  const [state, setState] = useState({ status: 'idle', error: '', valid: null });

  const handleVerify = async () => {
    if (!payload || !signature) {
      setState({ status: 'error', error: 'Недостига payload или signature.', valid: null });
      return;
    }

    setState({ status: 'loading', error: '', valid: null });
    try {
      const result = await requestProofVerification(payload, signature);
      setState({ status: 'done', error: '', valid: !!result.valid });
    } catch (err) {
      setState({ status: 'error', error: err?.message || 'Неуспешна верификација.', valid: null });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-black text-slate-800">{title}</h3>
        {state.valid === true && <span className="text-xs font-bold text-emerald-700">VALID</span>}
        {state.valid === false && <span className="text-xs font-bold text-rose-700">INVALID</span>}
      </div>
      <div className="space-y-1 text-xs text-slate-500">
        {metaLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleVerify}
          className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700"
        >
          {state.status === 'loading' ? 'Се проверува...' : actionLabel}
        </button>
        {state.error && <p className="text-xs text-rose-600">{state.error}</p>}
      </div>
    </div>
  );
}

export default function TeacherVerifyPanel() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '' });
  const [result, setResult] = useState({ test: null, attempts: [], attachments: [] });

  const handleLoad = async () => {
    const safeCode = code.trim();
    if (!safeCode) {
      setStatus({ loading: false, error: 'Внесете код на тест.' });
      return;
    }

    setStatus({ loading: true, error: '' });
    const [testRes, attemptsRes, attachmentsRes] = await Promise.all([
      loadPublishedTest(safeCode),
      listPublishedAttempts(safeCode),
      listQuestionAttachments(safeCode),
    ]);

    if (!testRes.ok) {
      setStatus({ loading: false, error: testRes.error || 'Тестот не може да се вчита.' });
      return;
    }

    setResult({
      test: testRes.data,
      attempts: attemptsRes.ok ? attemptsRes.data : [],
      attachments: attachmentsRes.ok ? attachmentsRes.data : [],
    });
    setStatus({
      loading: false,
      error: attemptsRes.ok && attachmentsRes.ok ? '' : 'Дел од доказите не се вчитани.',
    });
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Teacher Verify Panel</h2>
        <p className="mt-2 text-sm text-slate-500">
          Вчитај код на објавен тест и верификувај server-signed submission и attachment докази.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Код на тест"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400"
          />
          <button
            type="button"
            onClick={handleLoad}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
          >
            {status.loading ? 'Се вчитува...' : 'Вчитај докази'}
          </button>
        </div>
        {status.error && <p className="mt-3 text-sm text-rose-600">{status.error}</p>}
      </div>

      {result.test && (
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Тест</p>
          <h3 className="mt-2 text-2xl font-black text-slate-900">{result.test.test.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Код: {result.test.code} • Прашања: {result.test.test.questions.length}
          </p>
        </div>
      )}

      {result.attempts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900">Submission proofs</h3>
          {result.attempts.map((attempt) => (
            <VerifyCard
              key={attempt.attemptId}
              title={`Attempt ${attempt.attemptId}`}
              payload={attempt.submissionProof?.qrPayload}
              signature={attempt.submissionProof?.signature}
              metaLines={[
                `Verification ID: ${attempt.submissionProof?.verificationId || 'n/a'}`,
                `Signed by: ${attempt.submissionProof?.signedBy || 'unknown'}`,
                `Attachments: ${Object.keys(attempt.attachments || {}).length}`,
              ]}
            />
          ))}
        </div>
      )}

      {result.attachments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900">Question attachments</h3>
          {result.attachments.map((attachment) => (
            <div
              key={`${attachment.questionId}-${attachment.verificationId}`}
              className="space-y-3"
            >
              <VerifyCard
                title={`Прашање ${attachment.questionId}`}
                payload={attachment.payload}
                signature={attachment.signature}
                metaLines={[
                  `Verification ID: ${attachment.verificationId}`,
                  `Signed by: ${attachment.signedBy || 'unknown'}`,
                  attachment.questionText ? `Текст: ${attachment.questionText}` : 'Текст: n/a',
                ]}
                actionLabel="Провери upload token"
              />
              {attachment.attachment?.downloadUrl && (
                <a
                  href={attachment.attachment.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                >
                  Отвори прилог: {attachment.attachment.name || 'attachment'}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
