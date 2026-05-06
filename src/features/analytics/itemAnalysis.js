/**
 * Item analysis & cohort statistics — Phase 3.1.
 *
 * PURE функции (без I/O, без React). Влез: низа од scored attempts; излез:
 * стандардни психометриски метрики кои директно ги користи Teacher Dashboard.
 *
 * Терминологија:
 *   • Attempt: { studentId, totalScore, maxScore, items: [{ qid, earned, max }] }
 *   • Item difficulty (p-value): средна точност 0..1 (поголемо = полесно).
 *   • Discrimination (D): корелација помеѓу item-резултат и тотал-резултат.
 *     Користиме point-biserial (Pearson) — стандард во classical test theory.
 *   • Distribution: histogram on percentage buckets (deciles).
 */

const round = (n, d = 3) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

function mean(xs) {
  if (xs.length === 0) return 0;
  let s = 0;
  for (let i = 0; i < xs.length; i += 1) s += xs[i];
  return s / xs.length;
}

function stddev(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  let s = 0;
  for (let i = 0; i < xs.length; i += 1) s += (xs[i] - m) ** 2;
  return Math.sqrt(s / (xs.length - 1));
}

function pearson(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let dx2 = 0;
  let dy2 = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : num / denom;
}

/**
 * Класифицира difficulty/discrimination по конвенциите од Crocker & Algina.
 */
export function classifyDifficulty(p) {
  if (p >= 0.85) return 'easy';
  if (p >= 0.4) return 'medium';
  return 'hard';
}

export function classifyDiscrimination(d) {
  if (d >= 0.4) return 'excellent';
  if (d >= 0.3) return 'good';
  if (d >= 0.2) return 'acceptable';
  if (d >= 0) return 'poor';
  return 'reverse';
}

/**
 * Главна функција: прави per-item статистика од attempts.
 * @param {Array<{ studentId: string, totalScore?: number, maxScore?: number, items: Array<{ qid: string, earned: number, max: number }> }>} attempts
 * @returns {{
 *   itemStats: Array<{
 *     qid: string,
 *     attempts: number,
 *     mean: number,
 *     stddev: number,
 *     pValue: number,
 *     discrimination: number,
 *     difficulty: string,
 *     discriminationLabel: string,
 *   }>,
 *   cohort: {
 *     n: number,
 *     mean: number,
 *     stddev: number,
 *     min: number,
 *     max: number,
 *     median: number,
 *     distribution: number[],
 *   }
 * }}
 */
export function analyzeAttempts(attempts) {
  const safe = Array.isArray(attempts) ? attempts : [];
  if (safe.length === 0) {
    return {
      itemStats: [],
      cohort: {
        n: 0,
        mean: 0,
        stddev: 0,
        min: 0,
        max: 0,
        median: 0,
        distribution: new Array(10).fill(0),
      },
    };
  }

  // Tотал-резултати по студент (нормализирани во 0..1).
  const totals = safe.map((a) => {
    const total = Number.isFinite(a.totalScore)
      ? a.totalScore
      : a.items.reduce((s, it) => s + (it.earned ?? 0), 0);
    const max = Number.isFinite(a.maxScore)
      ? a.maxScore
      : a.items.reduce((s, it) => s + (it.max ?? 0), 0);
    return max > 0 ? total / max : 0;
  });

  // Сите уникатни qid-ови (стабилен ред = ред од прв attempt).
  const order = [];
  const seen = new Set();
  safe.forEach((a) =>
    a.items.forEach((it) => {
      if (!seen.has(it.qid)) {
        seen.add(it.qid);
        order.push(it.qid);
      }
    })
  );

  const itemStats = order.map((qid) => {
    const ratios = [];
    const pairedTotals = [];
    safe.forEach((a, idx) => {
      const it = a.items.find((x) => x.qid === qid);
      if (!it || !Number.isFinite(it.max) || it.max <= 0) return;
      ratios.push(it.earned / it.max);
      pairedTotals.push(totals[idx]);
    });
    const m = mean(ratios);
    const sd = stddev(ratios);
    const disc = pearson(ratios, pairedTotals);
    return {
      qid,
      attempts: ratios.length,
      mean: round(m),
      stddev: round(sd),
      pValue: round(m),
      discrimination: round(disc),
      difficulty: classifyDifficulty(m),
      discriminationLabel: classifyDiscrimination(disc),
    };
  });

  // Cohort summary (на скала 0..100%).
  const pct = totals.map((t) => t * 100).sort((a, b) => a - b);
  const cohortMean = mean(pct);
  const cohortSd = stddev(pct);
  const median =
    pct.length % 2 === 1
      ? pct[(pct.length - 1) / 2]
      : (pct[pct.length / 2 - 1] + pct[pct.length / 2]) / 2;

  const distribution = new Array(10).fill(0);
  pct.forEach((p) => {
    const bucket = Math.min(9, Math.floor(p / 10));
    distribution[bucket] += 1;
  });

  return {
    itemStats,
    cohort: {
      n: safe.length,
      mean: round(cohortMean, 2),
      stddev: round(cohortSd, 2),
      min: round(pct[0] ?? 0, 2),
      max: round(pct[pct.length - 1] ?? 0, 2),
      median: round(median, 2),
      distribution,
    },
  };
}

/**
 * Конвертира резултат од `gradeTest` + студент-id во attempt shape.
 * Корисно за стрим од Firestore submissions.
 */
export function attemptFromGradeResult(studentId, gradeResult) {
  return {
    studentId,
    totalScore: gradeResult.earned,
    maxScore: gradeResult.max,
    items: (gradeResult.items ?? []).map((it) => ({
      qid: it.id,
      earned: it.earned,
      max: it.max,
    })),
  };
}
