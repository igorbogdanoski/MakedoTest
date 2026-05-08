export function shouldRenderAnswerSheetOptions(type) {
  return type === 'multiple' || type === 'checklist' || type === 'true-false';
}

export function getAnswerSheetOptionLabels(question) {
  if (question.type === 'true-false') {
    return ['Т', 'Н'];
  }

  return question.options.map((_, index) => String.fromCharCode(65 + index));
}
