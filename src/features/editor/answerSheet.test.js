import { describe, expect, it } from 'vitest';
import { getAnswerSheetOptionLabels, shouldRenderAnswerSheetOptions } from './answerSheet.js';

describe('answerSheet helpers', () => {
  it('renders options only for multiple/checklist/true-false types', () => {
    expect(shouldRenderAnswerSheetOptions('multiple')).toBe(true);
    expect(shouldRenderAnswerSheetOptions('checklist')).toBe(true);
    expect(shouldRenderAnswerSheetOptions('true-false')).toBe(true);
    expect(shouldRenderAnswerSheetOptions('essay')).toBe(false);
  });

  it('returns Macedonian true-false labels', () => {
    const labels = getAnswerSheetOptionLabels({ type: 'true-false' });
    expect(labels).toEqual(['Т', 'Н']);
  });

  it('returns alphabetic labels for options-based questions', () => {
    const labels = getAnswerSheetOptionLabels({
      type: 'multiple',
      options: ['a', 'b', 'c', 'd'],
    });
    expect(labels).toEqual(['A', 'B', 'C', 'D']);
  });
});
