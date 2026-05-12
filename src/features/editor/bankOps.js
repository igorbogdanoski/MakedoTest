export function appendQuestionFromBank(questions, bankQuestion, idGenerator = Date.now) {
  if (!Array.isArray(questions)) return [];
  if (!bankQuestion || typeof bankQuestion !== 'object') return [...questions];
  const id = typeof idGenerator === 'function' ? idGenerator() : idGenerator;
  return [...questions, { ...bankQuestion, id }];
}
