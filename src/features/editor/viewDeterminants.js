export function isEditorView(view) {
  return view === 'editor';
}

export function shouldShowTestFormFields(view) {
  return view === 'editor';
}

export function shouldShowStudentLineFields(view) {
  return view !== 'answerKey' && view !== 'answerSheet' && view !== 'analytics';
}

export function isAnalyticsView(paperContentView) {
  return paperContentView === 'analytics';
}
