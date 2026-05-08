export function shouldShowAddQuestionFAB(sidebarOpen, view) {
  return !sidebarOpen && view === 'editor';
}
