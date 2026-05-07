import { describe, it, expect } from 'vitest';
import {
  cloneEditorState,
  createEditorSnapshot,
  pushUndoSnapshot,
  snapshotHash,
} from './editorHistory';

describe('editorHistory', () => {
  it('creates deep cloned snapshot', () => {
    const state = {
      testInfo: { title: 'A' },
      questions: [{ id: 1, text: 'Q1' }],
      activeTestId: 't1',
    };

    const snap = createEditorSnapshot(state);
    expect(snap.testInfo.title).toBe('A');
    expect(snap.questions).toHaveLength(1);

    state.testInfo.title = 'B';
    state.questions[0].text = 'Q2';

    expect(snap.testInfo.title).toBe('A');
    expect(snap.questions[0].text).toBe('Q1');
  });

  it('pushes undo snapshots with max limit', () => {
    const stack = [{ i: 1 }, { i: 2 }];
    const next = pushUndoSnapshot(stack, { i: 3 }, 2);
    expect(next).toEqual([{ i: 2 }, { i: 3 }]);
  });

  it('hash changes when editor content changes', () => {
    const a = snapshotHash({ testInfo: { title: 'A' }, questions: [], activeTestId: null });
    const b = snapshotHash({ testInfo: { title: 'B' }, questions: [], activeTestId: null });
    expect(a).not.toBe(b);
  });

  it('cloneEditorState returns independent object', () => {
    const source = { arr: [{ x: 1 }] };
    const copy = cloneEditorState(source);
    source.arr[0].x = 9;
    expect(copy.arr[0].x).toBe(1);
  });
});
