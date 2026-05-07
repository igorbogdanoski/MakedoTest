import { useEffect, useMemo, useState } from 'react';
import RenderContent from '../../components/RenderContent';
import { uploadHandwrittenAttachment } from './attachments';
import {
  activateAttachmentSession,
  loadAttachmentSession,
  loadPublishedTest,
  saveQuestionAttachmentRecord,
} from './publish';
import { requestProofVerification } from './proofClient';

export default function AttachmentUploadRoute({
  code,
  questionId,
  verificationId,
  signature,
  payloadHash,
  submittedAt,
}) {
  const [state, setState] = useState({ status: 'loading', error: '', test: null, session: null });
  const [verifyState, setVerifyState] = useState({ loading: false, valid: null, error: '' });
  const [uploadState, setUploadState] = useState({ loading: false, success: '', error: '' });

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      loadPublishedTest(code),
      verificationId
        ? loadAttachmentSession({ code, questionId, verificationId })
        : Promise.resolve(null),
    ]).then(async ([testRes, sessionRes]) => {
      if (cancelled) return;
      if (!testRes.ok) {
        setState({
          status: 'error',
          error: testRes.error || 'Тестот не може да се вчита.',
          test: null,
          session: null,
        });
        return;
      }

      if (sessionRes?.ok) {
        await activateAttachmentSession({ code, questionId, verificationId });
      }

      setState({
        status: 'ready',
        error:
          sessionRes && !sessionRes.ok && sessionRes.status !== 'not-found' ? sessionRes.error : '',
        test: testRes.data.test,
        session: sessionRes?.ok ? sessionRes.data : null,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [code, questionId, verificationId]);

  const question = useMemo(
    () => state.test?.questions?.find((item) => String(item.id) === String(questionId)) || null,
    [state.test, questionId]
  );

  const proofPayload = state.session?.payload || {
    v: 1,
    scope: 'question-upload',
    testId: state.test?.id || null,
    questionId,
    code,
    submittedAt: submittedAt || Date.now(),
    payloadHash: payloadHash || null,
    attachmentCount: 0,
  };
  const proofSignature = state.session?.signature || signature || null;

  const handleVerify = async () => {
    if (!proofSignature || !proofPayload?.payloadHash) {
      setVerifyState({ loading: false, valid: null, error: 'Недостига QR потпис или payload.' });
      return;
    }

    setVerifyState({ loading: true, valid: null, error: '' });
    try {
      const result = await requestProofVerification(proofPayload, proofSignature);
      setVerifyState({ loading: false, valid: !!result.valid, error: '' });
    } catch (err) {
      setVerifyState({ loading: false, valid: null, error: err?.message || 'Неуспешна проверка.' });
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadState({ loading: true, success: '', error: '' });
    try {
      const uploaded = await uploadHandwrittenAttachment(file, {
        code,
        questionId,
        verificationId: verificationId || state.session?.verificationId || 'LOCALUPLOAD',
      });

      const save = await saveQuestionAttachmentRecord({
        code,
        questionId,
        verificationId: verificationId || state.session?.verificationId || 'LOCALUPLOAD',
        questionText: question?.text || state.session?.questionText || '',
        payload: proofPayload,
        signature: proofSignature,
        signedBy: state.session?.signedBy || 'companion-upload',
        attachment: uploaded,
      });

      if (!save.ok) {
        throw new Error(save.error || 'Attachment metadata save failed');
      }

      setUploadState({ loading: false, success: `Успешно прикачено: ${uploaded.name}`, error: '' });
    } catch (err) {
      setUploadState({
        loading: false,
        success: '',
        error: err?.message || 'Прикачувањето не успеа.',
      });
    }
  };

  if (state.status === 'loading') {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <div className="card p-6 text-center">Се вчитува QR upload сесијата...</div>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <div className="card p-6 text-center text-rose-700">{state.error}</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <section className="card p-6 space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">
          Companion upload
        </p>
        <h1 className="text-2xl font-black text-slate-900">Прикачи ракописно решение</h1>
        <p className="text-sm text-slate-500">
          Код: {code} • Прашање: {questionId}
        </p>
        {question && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <RenderContent text={question.text} />
          </div>
        )}
      </section>

      <section className="card p-6 space-y-3">
        <button
          type="button"
          onClick={handleVerify}
          className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-black text-indigo-700"
        >
          {verifyState.loading ? 'Се проверува QR токенот...' : 'Провери QR токен'}
        </button>
        {verifyState.valid === true && (
          <p className="text-sm text-emerald-700">QR токенот е валиден.</p>
        )}
        {verifyState.valid === false && (
          <p className="text-sm text-rose-700">QR токенот не е валиден.</p>
        )}
        {verifyState.error && <p className="text-sm text-rose-700">{verifyState.error}</p>}
      </section>

      <section className="card p-6 space-y-3">
        <label className="inline-flex cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
          Избери слика или PDF
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleUpload} />
        </label>
        {uploadState.loading && <p className="text-sm text-slate-500">Прикачување...</p>}
        {uploadState.success && <p className="text-sm text-emerald-700">{uploadState.success}</p>}
        {uploadState.error && <p className="text-sm text-rose-700">{uploadState.error}</p>}
      </section>
    </main>
  );
}
