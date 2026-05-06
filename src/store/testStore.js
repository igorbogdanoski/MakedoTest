/**
 * Главен Zustand store за editor state.
 *
 * Архитектура:
 *   • Чист domain state (нема UI references, нема Firebase calls).
 *   • Сите мутации поминуваат низ actions (никогаш direct setState од компоненти).
 *   • Selectors треба да се користат за да се избегне прекумерен re-render.
 *   • Persistence (localStorage / Firestore sync) се закачи во посебен middleware,
 *     не во самиот store — види `subscribeWithSelector` опции по потреба.
 */

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { QuestionSchema, parseQuestionList } from '../domain/schema';

/** Креира скелет за нова празна задача од даден тип. */
export function createBlankQuestion(type) {
  const base = { id: nanoid(8), type, text: '', points: 1, difficulty: 'medium' };
  switch (type) {
    case 'multiple':
      return { ...base, options: ['', '', '', ''], correct: 0 };
    case 'checklist':
      return { ...base, options: ['', '', '', ''], corrects: [] };
    case 'true-false':
      return { ...base, correct: 0 };
    case 'matching':
      return { ...base, pairs: [{ left: '', right: '' }] };
    case 'list':
      return { ...base, items: ['', '', ''] };
    case 'multi-part':
      return { ...base, parts: ['', ''] };
    case 'ordering':
      return { ...base, items: ['', '', ''] };
    case 'statements':
      return { ...base, items: [{ s: '', correct: 0 }] };
    case 'multi-match':
      return { ...base, matches: [{ s: '', a: '' }] };
    case 'table':
      return { ...base, tableData: { rows: 2, cols: 2, data: {} } };
    case 'section':
      return { ...base, points: 0, text: 'НОВ ДЕЛ' };
    default:
      return base;
  }
}

const initial = {
  test: {
    id: null,
    title: '',
    subject: '',
    grade: '',
    language: 'mk',
    questions: [],
  },
};

export const useTestStore = create((set, get) => ({
  ...initial,

  // ---------- Selectors as actions ----------
  getQuestion: (id) => get().test.questions.find((q) => q.id === id),
  totalPoints: () => get().test.questions.reduce((sum, q) => sum + (q.points ?? 0), 0),

  // ---------- Test-level actions ----------
  setTitle: (title) => set((s) => ({ test: { ...s.test, title } })),

  setLanguage: (language) => set((s) => ({ test: { ...s.test, language } })),

  loadTest: (test) =>
    set(() => ({
      test: {
        ...initial.test,
        ...test,
        questions: (test?.questions ?? []).map((q) => ({ id: q.id ?? nanoid(8), ...q })),
      },
    })),

  reset: () => set(() => ({ ...initial })),

  // ---------- Question CRUD ----------
  addQuestion: (typeOrQuestion) => {
    const q =
      typeof typeOrQuestion === 'string'
        ? createBlankQuestion(typeOrQuestion)
        : { id: nanoid(8), ...typeOrQuestion };
    set((s) => ({ test: { ...s.test, questions: [...s.test.questions, q] } }));
    return q.id;
  },

  updateQuestion: (id, patch) =>
    set((s) => ({
      test: {
        ...s.test,
        questions: s.test.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)),
      },
    })),

  removeQuestion: (id) =>
    set((s) => ({
      test: { ...s.test, questions: s.test.questions.filter((q) => q.id !== id) },
    })),

  duplicateQuestion: (id) => {
    const q = get().getQuestion(id);
    if (!q) return null;
    const copy = { ...q, id: nanoid(8) };
    set((s) => {
      const idx = s.test.questions.findIndex((x) => x.id === id);
      const next = [...s.test.questions];
      next.splice(idx + 1, 0, copy);
      return { test: { ...s.test, questions: next } };
    });
    return copy.id;
  },

  moveQuestion: (id, direction) => {
    const qs = get().test.questions;
    const idx = qs.findIndex((q) => q.id === id);
    if (idx < 0) return;
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= qs.length) return;
    const next = [...qs];
    [next[idx], next[target]] = [next[target], next[idx]];
    set((s) => ({ test: { ...s.test, questions: next } }));
  },

  shuffleQuestions: () => {
    set((s) => {
      const arr = [...s.test.questions];
      for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return { test: { ...s.test, questions: arr } };
    });
  },

  // ---------- Bulk import ----------
  /**
   * Прифаќа AI/JSON низа од прашања. Враќа `{ ok, count, error }`.
   * НЕ touches state ако валидацијата падне.
   */
  importQuestions: (raw, { append = false } = {}) => {
    const res = parseQuestionList(raw);
    if (!res.success) return { ok: false, count: 0, error: res.error };
    const normalized = res.data.map((q) => ({ id: q.id ?? nanoid(8), ...q }));
    set((s) => ({
      test: {
        ...s.test,
        questions: append ? [...s.test.questions, ...normalized] : normalized,
      },
    }));
    return { ok: true, count: normalized.length, error: null };
  },

  /** Валидација на едно прашање (за inline UI feedback). */
  validateQuestion: (q) => QuestionSchema.safeParse(q),
}));
