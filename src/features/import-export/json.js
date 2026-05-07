/**
 * JSON import/export pipeline.
 *
 * Архитектонски правила:
 *   • Влез: arbitrary string или unknown — никогаш веруваме на shape без валидација.
 *   • Излез: pretty-printed JSON со стабилен ordering за дифабилни fajlovi.
 *   • Сите грешки враќаат користнички friendly message — без stack traces.
 */

import { parseQuestionList, parseTest } from '../../domain/schema';

/**
 * Парсира корисничка JSON стринг и валидира како низа од прашања.
 * @param {string} input
 * @returns {{ ok: true, data: import('zod').infer<typeof QuestionListSchema> }
 *         | { ok: false, error: string, issues?: import('zod').ZodIssue[] }}
 */
export function importQuestionsFromJson(input) {
  let raw;
  try {
    raw = JSON.parse(input);
  } catch (e) {
    return { ok: false, error: `Невалиден JSON: ${e.message}` };
  }
  const list = Array.isArray(raw) ? raw : raw?.questions;
  if (!Array.isArray(list)) {
    return {
      ok: false,
      error: 'JSON мора да е низа од прашања или објект со поле "questions".',
    };
  }
  const res = parseQuestionList(list);
  if (!res.success) {
    return {
      ok: false,
      error: 'Некои прашања не ја поминаа валидацијата.',
      issues: res.error.issues,
    };
  }
  return { ok: true, data: res.data };
}

/**
 * Парсира целосен Test JSON.
 * @param {string} input
 */
export function importTestFromJson(input) {
  let raw;
  try {
    raw = JSON.parse(input);
  } catch (e) {
    return { ok: false, error: `Невалиден JSON: ${e.message}` };
  }
  const res = parseTest(raw);
  if (!res.success) {
    return {
      ok: false,
      error: 'Тестот не ја помина валидацијата.',
      issues: res.error.issues,
    };
  }
  return { ok: true, data: res.data };
}

/**
 * Сериализира тест/прашања во pretty JSON стринг.
 * @param {unknown} data
 * @returns {string}
 */
export function exportToJson(data) {
  return JSON.stringify(data, null, 2);
}
