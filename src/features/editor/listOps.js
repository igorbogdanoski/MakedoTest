export function shuffleQuestions(questions, randomFn = Math.random) {
  if (!Array.isArray(questions)) return [];
  return [...questions].sort(() => randomFn() - 0.5);
}

export function shuffleQuestionOptions(questions, questionId, randomFn = Math.random) {
  if (!Array.isArray(questions)) return [];
  return questions.map((q) => {
    if (q?.id === questionId && Array.isArray(q?.options)) {
      const shuffledOptions = [...q.options].sort(() => randomFn() - 0.5);
      return { ...q, options: shuffledOptions };
    }
    return q;
  });
}

export function reorderQuestions(questions, idx, dir) {
  if (!Array.isArray(questions)) return [];
  const target = idx + dir;
  if (target < 0 || target >= questions.length) return questions;
  const next = [...questions];
  [next[idx], next[target]] = [next[target], next[idx]];
  return next;
}
