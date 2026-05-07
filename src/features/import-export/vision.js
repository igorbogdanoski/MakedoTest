/**
 * Vision import pipeline (Phase 4.3).
 *
 * Flow:
 *  1) Try backend Vision endpoint (GPT-4o or server-side OCR) via multipart upload.
 *  2) If backend parsing fails, fallback to client OCR via tesseract.js.
 *  3) Convert OCR text -> normalized question array.
 *  4) Validate with domain schema before returning.
 */

import { parseQuestionList } from '../../domain/schema';
import { importQuestionsFromJson } from './json';

const VISION_BASE_URL = (
  import.meta.env.VITE_VISION_API_BASE_URL ||
  import.meta.env.VITE_RAG_API_BASE_URL ||
  '/api'
).replace(/\/$/, '');

function normalizeQuestion(q) {
  const type = q?.type || 'short-answer';
  return {
    ...q,
    type,
    text: q?.text || '',
    points: q?.points ?? 5,
    difficulty: q?.difficulty || 'medium',
  };
}

function validateQuestionList(list) {
  const normalized = list.map(normalizeQuestion);
  const parsed = parseQuestionList(normalized);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Vision import не помина валидација на прашања.',
      issues: parsed.error.issues,
    };
  }
  return { ok: true, data: parsed.data };
}

function isOptionLine(line) {
  return /^[A-Za-z]\s*[).:-]\s+/.test(line);
}

function stripOptionPrefix(line) {
  return line.replace(/^[A-Za-z]\s*[).:-]\s+/, '').trim();
}

function isQuestionStart(line) {
  return /^\d+\s*[).:-]\s+/.test(line) || line.endsWith('?');
}

function stripQuestionPrefix(line) {
  return line.replace(/^\d+\s*[).:-]\s+/, '').trim();
}

function finalizeQuestion(current) {
  if (!current || !current.text) return null;
  if (current.options.length >= 2) {
    return {
      type: 'multiple',
      text: current.text,
      options: current.options,
      correct: 0,
    };
  }
  return {
    type: 'short-answer',
    text: current.text,
  };
}

/**
 * Convert plain OCR text into question objects.
 *
 * @param {string} text
 * @returns {{ ok: true, data: object[] } | { ok: false, error: string, issues?: object[] }}
 */
export function parseQuestionsFromVisionText(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { ok: false, error: 'Vision OCR не врати читлив текст.' };
  }

  const questions = [];
  let current = null;

  for (const line of lines) {
    if (isQuestionStart(line)) {
      const done = finalizeQuestion(current);
      if (done) questions.push(done);
      current = {
        text: stripQuestionPrefix(line),
        options: [],
      };
      continue;
    }

    if (current && isOptionLine(line)) {
      current.options.push(stripOptionPrefix(line));
      continue;
    }

    if (!current) {
      current = { text: line, options: [] };
      continue;
    }

    current.text = `${current.text} ${line}`.trim();
  }

  const last = finalizeQuestion(current);
  if (last) questions.push(last);

  if (!questions.length) {
    return { ok: false, error: 'Не успеав да реконструирам прашања од OCR текст.' };
  }

  return validateQuestionList(questions);
}

/**
 * Parse backend vision payload into validated question list.
 *
 * Accepted payload shapes:
 *  - { questions: [...] }
 *  - { json: "[...]" }
 *  - { text: "..." }
 *  - [...]
 */
export function parseVisionPayload(payload) {
  const directList = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.questions)
      ? payload.questions
      : null;

  if (directList) return validateQuestionList(directList);

  if (typeof payload?.json === 'string') {
    return importQuestionsFromJson(payload.json);
  }

  if (typeof payload?.text === 'string') {
    return parseQuestionsFromVisionText(payload.text);
  }

  return {
    ok: false,
    error: 'Vision API врати неподдржан формат. Очекувам questions/json/text.',
  };
}

/**
 * Calls backend vision endpoint.
 * @param {File|Blob} file
 * @param {typeof fetch} fetchImpl
 */
export async function requestVisionApi(file, fetchImpl = fetch) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetchImpl(`${VISION_BASE_URL}/vision/parse`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Vision API HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Fallback OCR using client-side tesseract.js.
 * @param {File|Blob} file
 */
export async function runTesseractFallback(file) {
  const { recognize } = await import('tesseract.js');
  const result = await recognize(file, 'eng');
  return result?.data?.text || '';
}

/**
 * Main import function for image-based test digitization.
 * @param {File|Blob} file
 * @param {{ fetchImpl?: typeof fetch }} options
 */
export async function importQuestionsFromVisionFile(file, options = {}) {
  if (!file) {
    return { ok: false, error: 'Нема избрана слика за Vision import.' };
  }

  const fetchImpl = options.fetchImpl || fetch;

  try {
    const payload = await requestVisionApi(file, fetchImpl);
    const parsed = parseVisionPayload(payload);
    if (parsed.ok) {
      return { ...parsed, source: 'api' };
    }
  } catch {
    // Continue with fallback OCR.
  }

  try {
    const text = await runTesseractFallback(file);
    const parsed = parseQuestionsFromVisionText(text);
    if (!parsed.ok) {
      return parsed;
    }
    return { ...parsed, source: 'tesseract', extractedText: text };
  } catch (e) {
    return {
      ok: false,
      error: `Vision import не успеа (API + Tesseract fallback): ${e.message}`,
    };
  }
}
