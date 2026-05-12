export function normalizeQuestionText(text) {
  if (typeof text !== 'string') return '';
  return text.trim().toLowerCase();
}

export function findDuplicateQuestionTexts(questions, minLength = 5) {
  if (!Array.isArray(questions)) return [];
  const texts = questions
    .map((q) => normalizeQuestionText(q?.text))
    .filter((t) => t.length > minLength);
  return texts.filter((item, index) => texts.indexOf(item) !== index);
}
