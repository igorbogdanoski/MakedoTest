function mean(xs) {
  if (!xs.length) return 0;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

function stddev(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const variance = xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

function round(n, digits = 2) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function toPercentScore(attempt) {
  const total = Number.isFinite(attempt.totalScore)
    ? attempt.totalScore
    : (attempt.items || []).reduce((s, it) => s + Number(it.earned || 0), 0);
  const max = Number.isFinite(attempt.maxScore)
    ? attempt.maxScore
    : (attempt.items || []).reduce((s, it) => s + Number(it.max || 0), 0);
  if (max <= 0) return 0;
  return (total / max) * 100;
}

function getGrade(attempt) {
  const raw = attempt.gradeLevel ?? attempt.grade ?? attempt.metadata?.gradeLevel;
  if (raw === null || raw === undefined || raw === '') return 'N/A';
  return String(raw);
}

function getSemester(attempt) {
  const raw = attempt.semester ?? attempt.metadata?.semester;
  if (raw === null || raw === undefined || raw === '') return 'N/A';
  return String(raw).toUpperCase();
}

function parseGradeOrder(grade) {
  const n = Number.parseInt(grade, 10);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

function parseSemesterOrder(semester) {
  const m = /([12])/.exec(String(semester));
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

export function analyzeCohorts(attempts = []) {
  const safe = Array.isArray(attempts) ? attempts : [];
  if (!safe.length) {
    return {
      rows: [],
      strongest: null,
      weakest: null,
      semesterDeltaByGrade: [],
    };
  }

  const groups = new Map();
  safe.forEach((attempt) => {
    const grade = getGrade(attempt);
    const semester = getSemester(attempt);
    const key = `${grade}__${semester}`;
    const score = toPercentScore(attempt);
    if (!groups.has(key)) {
      groups.set(key, { grade, semester, scores: [] });
    }
    groups.get(key).scores.push(score);
  });

  const rows = Array.from(groups.values())
    .map((g) => ({
      grade: g.grade,
      semester: g.semester,
      n: g.scores.length,
      mean: round(mean(g.scores)),
      stddev: round(stddev(g.scores)),
      min: round(Math.min(...g.scores)),
      max: round(Math.max(...g.scores)),
    }))
    .sort((a, b) => {
      const gradeOrder = parseGradeOrder(a.grade) - parseGradeOrder(b.grade);
      if (gradeOrder !== 0) return gradeOrder;
      return parseSemesterOrder(a.semester) - parseSemesterOrder(b.semester);
    });

  const strongest = rows.reduce((best, row) => (!best || row.mean > best.mean ? row : best), null);
  const weakest = rows.reduce(
    (worst, row) => (!worst || row.mean < worst.mean ? row : worst),
    null
  );

  const byGrade = new Map();
  rows.forEach((row) => {
    if (!byGrade.has(row.grade)) byGrade.set(row.grade, []);
    byGrade.get(row.grade).push(row);
  });

  const semesterDeltaByGrade = Array.from(byGrade.entries())
    .map(([grade, gradeRows]) => {
      const s1 = gradeRows.find((r) => parseSemesterOrder(r.semester) === 1);
      const s2 = gradeRows.find((r) => parseSemesterOrder(r.semester) === 2);
      if (!s1 || !s2) return null;
      return {
        grade,
        s1Mean: s1.mean,
        s2Mean: s2.mean,
        delta: round(s2.mean - s1.mean),
      };
    })
    .filter(Boolean)
    .sort((a, b) => parseGradeOrder(a.grade) - parseGradeOrder(b.grade));

  return {
    rows,
    strongest,
    weakest,
    semesterDeltaByGrade,
  };
}
