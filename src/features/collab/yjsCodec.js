import * as Y from 'yjs';

function writeState(doc, { testInfo, questions, activeTestId }) {
  const root = doc.getMap('editor');
  root.set('testInfo', JSON.stringify(testInfo || {}));
  root.set('questions', JSON.stringify(questions || []));
  root.set('activeTestId', activeTestId || '');
}

function readState(doc) {
  const root = doc.getMap('editor');
  return {
    testInfo: JSON.parse(root.get('testInfo') || '{}'),
    questions: JSON.parse(root.get('questions') || '[]'),
    activeTestId: root.get('activeTestId') || null,
  };
}

export function encodeEditorStateAsYjsUpdate(state) {
  const doc = new Y.Doc();
  writeState(doc, state);
  return Array.from(Y.encodeStateAsUpdate(doc));
}

export function decodeEditorStateFromYjsUpdate(updateArray) {
  if (!Array.isArray(updateArray) || updateArray.length === 0) {
    return {
      testInfo: {},
      questions: [],
      activeTestId: null,
    };
  }

  const doc = new Y.Doc();
  const update = Uint8Array.from(updateArray);
  try {
    Y.applyUpdate(doc, update);
  } catch {
    return {
      testInfo: {},
      questions: [],
      activeTestId: null,
    };
  }
  return readState(doc);
}
