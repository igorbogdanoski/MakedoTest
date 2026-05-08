import { describe, expect, it } from 'vitest';
import {
  GRADING_SCALE_GRADES,
  getGradingScaleGradesForDisplay,
  getGradingScaleThresholds,
} from './gradingScale.js';

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

  it('builds thresholds from total points', () => {
    expect(getGradingScaleThresholds(100)).toEqual({ 5: 90, 4: 75, 3: 60, 2: 45 });
  });

  it('rounds thresholds up for fractional totals', () => {
    expect(getGradingScaleThresholds(17)).toEqual({ 5: 16, 4: 13, 3: 11, 2: 8 });
  });
});
