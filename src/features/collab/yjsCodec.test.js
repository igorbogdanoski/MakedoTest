import { describe, it, expect } from 'vitest';
import { encodeEditorStateAsYjsUpdate, decodeEditorStateFromYjsUpdate } from './yjsCodec';

describe('yjsCodec', () => {
  it('encodes and decodes editor state', () => {
    const state = {
      testInfo: { title: 'T1', subject: 'Math' },
      questions: [{ id: 1, type: 'essay', text: 'A' }],
      activeTestId: 'abc',
    };

    const update = encodeEditorStateAsYjsUpdate(state);
    const decoded = decodeEditorStateFromYjsUpdate(update);

    expect(decoded.testInfo.title).toBe('T1');
    expect(decoded.questions).toHaveLength(1);
    expect(decoded.activeTestId).toBe('abc');
  });

  it('decodes to defaults for empty update', () => {
    const decoded = decodeEditorStateFromYjsUpdate([]);
    expect(decoded.testInfo).toEqual({});
    expect(decoded.questions).toEqual([]);
    expect(decoded.activeTestId).toBeNull();
  });
});
