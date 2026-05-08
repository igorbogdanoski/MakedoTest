import { describe, expect, it } from 'vitest';
import { getSubjectIndicatorClass, shouldShowSubjectIndicator } from './toolboxIndicators.js';

describe('toolboxIndicators helpers', () => {
  it('shows subject indicator for stem and languages subjects', () => {
    expect(shouldShowSubjectIndicator(['stem'])).toBe(true);
    expect(shouldShowSubjectIndicator(['languages'])).toBe(true);
    expect(shouldShowSubjectIndicator(['math', 'languages'])).toBe(true);
  });

  it('hides subject indicator for other subject sets', () => {
    expect(shouldShowSubjectIndicator(['social'])).toBe(false);
    expect(shouldShowSubjectIndicator([])).toBe(false);
    expect(shouldShowSubjectIndicator(null)).toBe(false);
  });

  it('returns stem class when stem subject exists', () => {
    expect(getSubjectIndicatorClass(['stem'])).toBe('bg-indigo-400');
    expect(getSubjectIndicatorClass(['stem', 'languages'])).toBe('bg-indigo-400');
  });

  it('returns language class when stem subject is absent', () => {
    expect(getSubjectIndicatorClass(['languages'])).toBe('bg-blue-400');
    expect(getSubjectIndicatorClass(['other'])).toBe('bg-blue-400');
    expect(getSubjectIndicatorClass(null)).toBe('bg-blue-400');
  });
});
