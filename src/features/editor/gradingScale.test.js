import { describe, expect, it } from 'vitest';
import { getGradingScaleGradesForDisplay, GRADING_SCALE_GRADES } from './gradingScale.js';

describe('gradingScale helpers', () => {
  it('exports expected grade order', () => {
    expect(GRADING_SCALE_GRADES).toEqual([5, 4, 3, 2]);
  });

  it('returns a display list with same grade order', () => {
    expect(getGradingScaleGradesForDisplay()).toEqual([5, 4, 3, 2]);
  });

  it('returns a new array instance to avoid accidental mutation coupling', () => {
    const a = getGradingScaleGradesForDisplay();
    const b = getGradingScaleGradesForDisplay();
    expect(a).not.toBe(b);
  });
});
