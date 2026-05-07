export function buildDemoAttemptsFromQuestions(questions = [], count = 24) {
  const scored = (questions || []).filter((q) => q.type !== 'section');
  if (scored.length === 0) return [];

  return Array.from({ length: count }).map((_, idx) => {
    const items = scored.map((q) => {
      const max = Number.isFinite(q.points) ? q.points : 1;
      const base = q.difficulty === 'hard' ? 0.5 : q.difficulty === 'easy' ? 0.82 : 0.68;
      const noise = ((idx * 37 + (q.id?.length || 1) * 13) % 100) / 100;
      const ratio = Math.max(0, Math.min(1, base * 0.7 + noise * 0.3));
      const earned = Math.round(ratio * max * 100) / 100;
      return { qid: q.id || `q-${idx}`, earned, max };
    });

    const totalScore = items.reduce((s, it) => s + it.earned, 0);
    const maxScore = items.reduce((s, it) => s + it.max, 0);

    return {
      studentId: `demo-${idx + 1}`,
      totalScore,
      maxScore,
      items,
      gradeLevel: 7 + (idx % 3),
      semester: idx % 2 === 0 ? 'S1' : 'S2',
    };
  });
}
