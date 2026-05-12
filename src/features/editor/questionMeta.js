export function applyQuestionBloom(questions, questionId, bloomLevel) {
  if (!Array.isArray(questions)) return [];
  return questions.map((q) => (q?.id === questionId ? { ...q, bloomLevel } : q));
}

export function applyQuestionRagFeedback(questions, questionId, ragFeedback) {
  if (!Array.isArray(questions)) return [];
  return questions.map((q) => (q?.id === questionId ? { ...q, ragFeedback } : q));
}
