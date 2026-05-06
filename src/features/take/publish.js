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

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, APP_ID } from '../../lib/firebase';
import { parseTest } from '../../domain/schema';

const COLLECTION = 'publishedTests';
const RESUME_COLLECTION = 'publishedResumes';

const CODE_RE = /^[A-Za-z0-9_-]{3,32}$/;
const RESUME_TOKEN_RE = /^[A-Za-z0-9_-]{6,64}$/;

function pathFor(code) {
  return `artifacts/${APP_ID}/${COLLECTION}/${code}`;
}

function resumePathFor(code, resumeToken) {
  return `artifacts/${APP_ID}/${RESUME_COLLECTION}/${code}__${resumeToken}`;
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
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
