/**
 * Auto-grading engine.
 *
 * Архитектонски правила:
 *   • PURE функции — без global state, без I/O.
 *   • Едниствено внатре `gradeQuestion(question, response)` решава скоринг.
 *   • Партијален кредит за `checklist`, `matching`, `ordering`, `multi-match`,
 *     `statements`, `multi-part`, `selection` (по точно решена ставка).
 *   • Manual rubric за `essay`, `short-answer`, `fill-blanks`, `list`, `diagram`,
 *     `table`, `section` — враќа `{ requiresManual: true }` без поени.
 *   • Resoult shape е стабилен: { earned, max, correct, requiresManual, details }.
 */

const clamp01 = (n) => Math.max(0, Math.min(1, n));

/**
 * Нормализира низа од индекси (за checklist споредба).
 * @param {unknown} v
 */
const toIndexSet = (v) => {
  if (!Array.isArray(v)) return new Set();
  return new Set(v.filter((x) => Number.isInteger(x) && x >= 0));
};

/**
 * Скорира едно прашање според студентскиот одговор.
 *
 * @param {object} q  - валидно `Question` од `domain/schema`
 * @param {*} response - студентски одговор (формата зависи од типот)
 * @returns {{
 *   earned: number,
 *   max: number,
 *   correct: boolean,
 *   requiresManual: boolean,
 *   details?: object
 * }}
 */
export function gradeQuestion(q, response) {
  const max = Number.isFinite(q.points) ? q.points : 1;
  const empty = (extra = {}) => ({
    earned: 0,
    max,
    correct: false,
    requiresManual: false,
    ...extra,
  });
  const manual = (extra = {}) => ({
    earned: 0,
    max,
    correct: false,
    requiresManual: true,
    ...extra,
  });

  switch (q.type) {
    case 'multiple': {
      const correct = Number(response) === Number(q.correct);
      return { earned: correct ? max : 0, max, correct, requiresManual: false };
    }

    case 'true-false': {
      const correct = Number(response) === Number(q.correct);
      return { earned: correct ? max : 0, max, correct, requiresManual: false };
    }

    case 'checklist': {
      const expected = toIndexSet(q.corrects);
      const got = toIndexSet(response);
      if (expected.size === 0) return empty();
      let hits = 0;
      let wrong = 0;
      got.forEach((i) => (expected.has(i) ? (hits += 1) : (wrong += 1)));
      // Скоринг: пропорција точни минус казна за погрешни (clamped).
      const ratio = clamp01((hits - wrong) / expected.size);
      const earned = Math.round(ratio * max * 100) / 100;
      return {
        earned,
        max,
        correct: hits === expected.size && wrong === 0,
        requiresManual: false,
        details: { hits, wrong, expected: expected.size },
      };
    }

    case 'matching': {
      // response: [{ left, right }] од студентот; q.pairs: точни парови
      if (!Array.isArray(q.pairs) || q.pairs.length === 0) return empty();
      const truth = new Map(q.pairs.map((p) => [p.left, p.right]));
      const given = Array.isArray(response) ? response : [];
      let hits = 0;
      given.forEach((p) => {
        if (truth.get(p.left) === p.right) hits += 1;
      });
      const ratio = clamp01(hits / truth.size);
      return {
        earned: Math.round(ratio * max * 100) / 100,
        max,
        correct: hits === truth.size,
        requiresManual: false,
        details: { hits, total: truth.size },
      };
    }

    case 'ordering': {
      const expected = Array.isArray(q.items) ? q.items : [];
      const got = Array.isArray(response) ? response : [];
      if (expected.length === 0) return empty();
      let hits = 0;
      expected.forEach((item, i) => {
        if (got[i] === item) hits += 1;
      });
      const ratio = clamp01(hits / expected.length);
      return {
        earned: Math.round(ratio * max * 100) / 100,
        max,
        correct: hits === expected.length,
        requiresManual: false,
        details: { hits, total: expected.length },
      };
    }

    case 'statements': {
      const items = Array.isArray(q.items) ? q.items : [];
      const got = Array.isArray(response) ? response : [];
      if (items.length === 0) return empty();
      let hits = 0;
      items.forEach((it, i) => {
        if (Number(got[i]) === Number(it.correct)) hits += 1;
      });
      const ratio = clamp01(hits / items.length);
      return {
        earned: Math.round(ratio * max * 100) / 100,
        max,
        correct: hits === items.length,
        requiresManual: false,
        details: { hits, total: items.length },
      };
    }

    case 'multi-match': {
      const truth = Array.isArray(q.matches) ? q.matches : [];
      const got = Array.isArray(response) ? response : [];
      if (truth.length === 0) return empty();
      let hits = 0;
      truth.forEach((m, i) => {
        if (got[i] === m.a) hits += 1;
      });
      const ratio = clamp01(hits / truth.length);
      return {
        earned: Math.round(ratio * max * 100) / 100,
        max,
        correct: hits === truth.length,
        requiresManual: false,
        details: { hits, total: truth.length },
      };
    }

    case 'selection': {
      // Текст со {точен|погрешен} — одговор е низа од 0/1 индекси по choice.
      // q.text е canonical; ние тука сме schema-validated, но не парсираме повторно
      // за чистота. Скоринг се врши од викнувачот ако дава `details.totalChoices`.
      const total = response && typeof response === 'object' ? (response.totalChoices ?? 0) : 0;
      const correct = response && typeof response === 'object' ? (response.correctChoices ?? 0) : 0;
      if (total === 0) return manual();
      const ratio = clamp01(correct / total);
      return {
        earned: Math.round(ratio * max * 100) / 100,
        max,
        correct: correct === total,
        requiresManual: false,
        details: { correct, total },
      };
    }

    case 'multi-part': {
      // Студентот добива поени по точно решен дел; викнувачот dava per-part scores.
      const totalParts = Array.isArray(q.parts) ? q.parts.length : 0;
      if (totalParts === 0) return empty();
      const parts = Array.isArray(response) ? response : [];
      const correctParts = parts.filter(Boolean).length;
      const ratio = clamp01(correctParts / totalParts);
      return {
        earned: Math.round(ratio * max * 100) / 100,
        max,
        correct: correctParts === totalParts,
        requiresManual: false,
        details: { correctParts, totalParts },
      };
    }

    // ---------- Manual ----------
    case 'essay':
    case 'short-answer':
    case 'fill-blanks':
    case 'list':
    case 'diagram':
    case 'table':
      return manual();

    case 'section':
      return { earned: 0, max: 0, correct: true, requiresManual: false };

    default:
      return empty();
  }
}

/**
 * Скорира цел тест.
 * @param {{ questions: object[] }} test
 * @param {Record<string, unknown>} responses - id → response
 */
export function gradeTest(test, responses = {}) {
  const items = (test?.questions ?? []).map((q) => {
    const result = gradeQuestion(q, responses[q.id]);
    return { id: q.id, type: q.type, ...result };
  });
  const earned = items.reduce((s, i) => s + (i.requiresManual ? 0 : i.earned), 0);
  const max = items.reduce((s, i) => s + i.max, 0);
  const requiresManual = items.some((i) => i.requiresManual);
  return {
    earned: Math.round(earned * 100) / 100,
    max,
    percentage: max > 0 ? Math.round((earned / max) * 1000) / 10 : 0,
    requiresManual,
    items,
  };
}

/**
 * Македонска стандардна скала (1–5) од процент. Прилагодлива по училиште.
 */
export const DEFAULT_GRADING_SCALE = [
  { min: 90, grade: 5, label: 'Одличен' },
  { min: 75, grade: 4, label: 'Многу добар' },
  { min: 60, grade: 3, label: 'Добар' },
  { min: 50, grade: 2, label: 'Доволен' },
  { min: 0, grade: 1, label: 'Недоволен' },
];

export function percentageToGrade(pct, scale = DEFAULT_GRADING_SCALE) {
  for (const tier of scale) if (pct >= tier.min) return tier;
  return scale[scale.length - 1];
}
