export const DEFAULT_UNDO_LIMIT = 40;

export function cloneEditorState(state) {
  if (typeof structuredClone === 'function') {
    return structuredClone(state);
  }
  return JSON.parse(JSON.stringify(state));
}

export function createEditorSnapshot({ testInfo, questions, activeTestId }) {
  return {
    testInfo: cloneEditorState(testInfo),
    questions: cloneEditorState(questions),
    activeTestId: activeTestId || null,
  };
}

export function pushUndoSnapshot(undoStack, snapshot, limit = DEFAULT_UNDO_LIMIT) {
  const next = [...undoStack, snapshot];
  if (next.length <= limit) return next;
  return next.slice(next.length - limit);
}

export function snapshotHash({ testInfo, questions, activeTestId }) {
  return JSON.stringify({
    testInfo,
    questions,
    activeTestId: activeTestId || null,
  });
}
