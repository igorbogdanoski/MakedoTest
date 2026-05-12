export function computeTotalPoints(questions) {
  if (!Array.isArray(questions)) return 0;
  return questions.reduce((acc, q) => acc + Number(q?.points || 0), 0);
}

export function estimateQuestionMinutes(question) {
  if (!question) return 2;
  let mins = 2;
  if (question.difficulty === 'easy') mins = 1;
  if (question.difficulty === 'hard') mins = 5;
  if (['essay', 'multi-part'].includes(question.type)) mins += 5;
  if (['table', 'diagram'].includes(question.type)) mins += 2;
  return mins;
}

export function computeEstimatedMinutes(questions) {
  if (!Array.isArray(questions)) return 0;
  return questions.reduce((acc, q) => acc + estimateQuestionMinutes(q), 0);
}
