/**
 * Publish/load helpers за public student-take линкови.
 *
 * Firestore структура:
 *   /artifacts/{APP_ID}/publishedTests/{code}
 *     ├── code:        "ABC123"
 *     ├── test:        TestSchema (валидиран)
 *     ├── ownerUid:    string | null   (author UID, ако е логиран)
 *     ├── createdAt:   serverTimestamp
 *     ├── expiresAt:   ISO8601 | null
 *     └── attempts:    int (counter, optional)
 *
 * Архитектонски правила:
 *   • Сите inputs се Zod-валидираат пред да отидат во Firestore.
 *   • Никаде не зависиме од текстуални Firestore patterns надвор од овој фајл.
 *   • Loader враќа `{ ok, data, error }` shape (нема throws за not-found).
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, APP_ID } from '../../lib/firebase';
import { parseTest } from '../../domain/schema';

const COLLECTION = 'publishedTests';
const RESUME_COLLECTION = 'publishedResumes';
const ATTACHMENT_SESSION_COLLECTION = 'publishedAttachmentSessions';
const ATTACHMENT_RECORD_COLLECTION = 'publishedQuestionAttachments';
const ATTEMPT_COLLECTION = 'publishedAttempts';

const CODE_RE = /^[A-Za-z0-9_-]{3,32}$/;
const RESUME_TOKEN_RE = /^[A-Za-z0-9_-]{6,64}$/;
const QUESTION_ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const VERIFICATION_ID_RE = /^[A-Za-z0-9_-]{6,80}$/;

function pathFor(code) {
  return `artifacts/${APP_ID}/${COLLECTION}/${code}`;
}

function resumePathFor(code, resumeToken) {
  return `artifacts/${APP_ID}/${RESUME_COLLECTION}/${code}__${resumeToken}`;
}

function attachmentSessionPathFor(code, questionId, verificationId) {
  return `artifacts/${APP_ID}/${ATTACHMENT_SESSION_COLLECTION}/${code}__${questionId}__${verificationId}`;
}

function attachmentRecordPathFor(code, questionId, verificationId) {
  return `artifacts/${APP_ID}/${ATTACHMENT_RECORD_COLLECTION}/${code}__${questionId}__${verificationId}`;
}

function attachmentRecordsCollectionPath() {
  return `artifacts/${APP_ID}/${ATTACHMENT_RECORD_COLLECTION}`;
}

function attemptsCollectionPath() {
  return `artifacts/${APP_ID}/${ATTEMPT_COLLECTION}`;
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isQuestionRefValid(questionId, verificationId) {
  return (
    QUESTION_ID_RE.test(String(questionId ?? '')) &&
    VERIFICATION_ID_RE.test(String(verificationId ?? ''))
  );
}

/**
 * Генерира 6-знаковен share-friendly код (без 0/O/1/I за читливост).
 */
export function generateCode(length = 6) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < length; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

/**
 * Генерира resume токен (за продолжување на друг уред).
 */
export function generateResumeToken(length = 12) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < length; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

/**
 * Објавува тест под даден код. Ако `code` е празно, генерира нов.
 * @param {object} test
 * @param {{ code?: string, ownerUid?: string|null, expiresAt?: string|null }} [opts]
 * @returns {Promise<{ ok: true, code: string } | { ok: false, error: string }>}
 */
export async function publishTest(test, opts = {}) {
  const parsed = parseTest(test);
  if (!parsed.success) {
    return { ok: false, error: 'Тестот не ја помина валидацијата.' };
  }
  const code = (opts.code ?? generateCode()).toString();
  if (!CODE_RE.test(code)) {
    return { ok: false, error: 'Невалиден формат на код.' };
  }
  try {
    await setDoc(doc(db, pathFor(code)), {
      code,
      test: parsed.data,
      ownerUid: opts.ownerUid ?? null,
      createdAt: serverTimestamp(),
      expiresAt: opts.expiresAt ?? null,
    });
    return { ok: true, code };
  } catch (err) {
    return { ok: false, error: err?.message ?? 'Firestore запис пропадна.' };
  }
}

/**
 * Вчитува објавен тест по код.
 * @param {string} code
 * @returns {Promise<{ ok: true, data: { code: string, test: object } } | { ok: false, error: string, status?: 'not-found' | 'invalid' | 'network' }>}
 */
export async function loadPublishedTest(code) {
  if (!CODE_RE.test(String(code ?? ''))) {
    return { ok: false, error: 'Невалиден код.', status: 'invalid' };
  }
  try {
    const snap = await getDoc(doc(db, pathFor(code)));
    if (!snap.exists()) {
      return { ok: false, error: 'Тестот не постои или е истечен.', status: 'not-found' };
    }
    const raw = snap.data();
    const parsed = parseTest(raw?.test);
    if (!parsed.success) {
      return { ok: false, error: 'Зачуваниот тест е оштетен.', status: 'invalid' };
    }
    return { ok: true, data: { code: raw.code ?? code, test: parsed.data } };
  } catch (err) {
    return { ok: false, error: err?.message ?? 'Грешка при вчитување.', status: 'network' };
  }
}

/**
 * Зачувува student draft за cross-device resume.
 * @param {{ code: string, responses: Record<string, unknown>, resumeToken?: string|null }} input
 * @returns {Promise<{ ok: true, resumeToken: string } | { ok: false, error: string, status?: 'invalid' | 'network' }>}
 */
export async function saveResumeState(input) {
  const code = String(input?.code ?? '');
  if (!CODE_RE.test(code)) {
    return { ok: false, error: 'Невалиден код.', status: 'invalid' };
  }

  const responses = input?.responses;
  if (!isPlainObject(responses)) {
    return { ok: false, error: 'Невалиден draft одговор.', status: 'invalid' };
  }

  const resumeToken = String(input?.resumeToken ?? generateResumeToken());
  if (!RESUME_TOKEN_RE.test(resumeToken)) {
    return { ok: false, error: 'Невалиден resume токен.', status: 'invalid' };
  }

  try {
    await setDoc(doc(db, resumePathFor(code, resumeToken)), {
      code,
      resumeToken,
      responses,
      updatedAt: serverTimestamp(),
    });
    return { ok: true, resumeToken };
  } catch (err) {
    return { ok: false, error: err?.message ?? 'Грешка при зачувување.', status: 'network' };
  }
}

/**
 * Вчитува зачуван resume draft.
 * @param {{ code: string, resumeToken: string }} input
 * @returns {Promise<{ ok: true, data: { responses: Record<string, unknown> } } | { ok: false, error: string, status?: 'invalid' | 'not-found' | 'network' }>}
 */
export async function loadResumeState(input) {
  const code = String(input?.code ?? '');
  const resumeToken = String(input?.resumeToken ?? '');
  if (!CODE_RE.test(code) || !RESUME_TOKEN_RE.test(resumeToken)) {
    return { ok: false, error: 'Невалиден resume линк.', status: 'invalid' };
  }

  try {
    const snap = await getDoc(doc(db, resumePathFor(code, resumeToken)));
    if (!snap.exists()) {
      return { ok: false, error: 'Resume записот не постои.', status: 'not-found' };
    }
    const raw = snap.data();
    if (!isPlainObject(raw?.responses)) {
      return { ok: false, error: 'Resume записот е оштетен.', status: 'invalid' };
    }
    return { ok: true, data: { responses: raw.responses } };
  } catch (err) {
    return { ok: false, error: err?.message ?? 'Грешка при вчитување.', status: 'network' };
  }
}

export async function createAttachmentSession(input) {
  const code = String(input?.code ?? '');
  const questionId = String(input?.questionId ?? '');
  const verificationId = String(input?.verificationId ?? '');
  if (!CODE_RE.test(code) || !isQuestionRefValid(questionId, verificationId)) {
    return { ok: false, error: 'Невалиден attachment session.', status: 'invalid' };
  }

  try {
    await setDoc(doc(db, attachmentSessionPathFor(code, questionId, verificationId)), {
      code,
      questionId,
      verificationId,
      questionText: input?.questionText ?? '',
      payload: input?.payload ?? null,
      signature: input?.signature ?? null,
      signedBy: input?.signedBy ?? 'unknown',
      createdAt: serverTimestamp(),
      scannedAt: null,
      uploadStatus: 'pending',
    });
    return { ok: true, verificationId };
  } catch (err) {
    return {
      ok: false,
      error: err?.message ?? 'Грешка при креирање upload сесија.',
      status: 'network',
    };
  }
}

export async function activateAttachmentSession(input) {
  const code = String(input?.code ?? '');
  const questionId = String(input?.questionId ?? '');
  const verificationId = String(input?.verificationId ?? '');
  if (!CODE_RE.test(code) || !isQuestionRefValid(questionId, verificationId)) {
    return { ok: false, error: 'Невалидна attachment активација.', status: 'invalid' };
  }

  try {
    await setDoc(
      doc(db, attachmentSessionPathFor(code, questionId, verificationId)),
      {
        code,
        questionId,
        verificationId,
        scannedAt: serverTimestamp(),
        uploadStatus: 'ready',
      },
      { merge: true }
    );
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err?.message ?? 'Грешка при активација на upload сесија.',
      status: 'network',
    };
  }
}

export async function loadAttachmentSession(input) {
  const code = String(input?.code ?? '');
  const questionId = String(input?.questionId ?? '');
  const verificationId = String(input?.verificationId ?? '');
  if (!CODE_RE.test(code) || !isQuestionRefValid(questionId, verificationId)) {
    return { ok: false, error: 'Невалидна attachment сесија.', status: 'invalid' };
  }

  try {
    const snap = await getDoc(doc(db, attachmentSessionPathFor(code, questionId, verificationId)));
    if (!snap.exists()) {
      return { ok: false, error: 'Upload сесијата не постои.', status: 'not-found' };
    }
    return { ok: true, data: snap.data() };
  } catch (err) {
    return {
      ok: false,
      error: err?.message ?? 'Грешка при вчитување upload сесија.',
      status: 'network',
    };
  }
}

export async function saveQuestionAttachmentRecord(input) {
  const code = String(input?.code ?? '');
  const questionId = String(input?.questionId ?? '');
  const verificationId = String(input?.verificationId ?? '');
  if (!CODE_RE.test(code) || !isQuestionRefValid(questionId, verificationId)) {
    return { ok: false, error: 'Невалиден attachment запис.', status: 'invalid' };
  }

  if (!isPlainObject(input?.attachment)) {
    return { ok: false, error: 'Невалиден attachment payload.', status: 'invalid' };
  }

  try {
    await setDoc(doc(db, attachmentRecordPathFor(code, questionId, verificationId)), {
      code,
      questionId,
      verificationId,
      attachment: input.attachment,
      questionText: input?.questionText ?? '',
      payload: input?.payload ?? null,
      signature: input?.signature ?? null,
      signedBy: input?.signedBy ?? 'unknown',
      uploadedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err?.message ?? 'Грешка при зачувување attachment запис.',
      status: 'network',
    };
  }
}

export function subscribeQuestionAttachments(code, onData, onError) {
  if (!CODE_RE.test(String(code ?? ''))) {
    onError?.({ ok: false, error: 'Невалиден код.', status: 'invalid' });
    return () => {};
  }

  const q = query(collection(db, attachmentRecordsCollectionPath()), where('code', '==', code));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((item) => item.data());
      const byQuestion = items.reduce((acc, item) => {
        acc[item.questionId] = item;
        return acc;
      }, {});
      onData?.(byQuestion, items);
    },
    (err) => {
      onError?.({
        ok: false,
        error: err?.message ?? 'Грешка при следење attachment записи.',
        status: 'network',
      });
    }
  );
}

export async function listQuestionAttachments(code) {
  if (!CODE_RE.test(String(code ?? ''))) {
    return { ok: false, error: 'Невалиден код.', status: 'invalid' };
  }

  try {
    const q = query(collection(db, attachmentRecordsCollectionPath()), where('code', '==', code));
    const snap = await getDocs(q);
    return { ok: true, data: snap.docs.map((item) => item.data()) };
  } catch (err) {
    return {
      ok: false,
      error: err?.message ?? 'Грешка при вчитување attachment записи.',
      status: 'network',
    };
  }
}

export async function savePublishedAttempt(input) {
  const code = String(input?.code ?? '');
  if (!CODE_RE.test(code)) {
    return { ok: false, error: 'Невалиден код.', status: 'invalid' };
  }
  if (!isPlainObject(input?.responses) || !isPlainObject(input?.submissionProof)) {
    return { ok: false, error: 'Невалиден attempt payload.', status: 'invalid' };
  }

  const attemptId = String(input?.attemptId ?? generateResumeToken(14));
  try {
    await setDoc(doc(db, `${attemptsCollectionPath()}/${code}__${attemptId}`), {
      code,
      attemptId,
      responses: input.responses,
      submissionProof: input.submissionProof,
      attachments: input.attachments ?? {},
      createdAt: serverTimestamp(),
    });
    return { ok: true, attemptId };
  } catch (err) {
    return {
      ok: false,
      error: err?.message ?? 'Грешка при зачувување attempt.',
      status: 'network',
    };
  }
}

export async function listPublishedAttempts(code) {
  if (!CODE_RE.test(String(code ?? ''))) {
    return { ok: false, error: 'Невалиден код.', status: 'invalid' };
  }

  try {
    const q = query(collection(db, attemptsCollectionPath()), where('code', '==', code));
    const snap = await getDocs(q);
    return { ok: true, data: snap.docs.map((item) => item.data()) };
  } catch (err) {
    return {
      ok: false,
      error: err?.message ?? 'Грешка при вчитување attempts.',
      status: 'network',
    };
  }
}
