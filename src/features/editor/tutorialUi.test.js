import { describe, expect, it } from 'vitest';
import {
  getTutorialNextButtonLabel,
  getTutorialProgressDotClass,
  shouldAdvanceTutorialStep,
} from './tutorialUi.js';

describe('tutorialUi helpers', () => {
  it('builds active and inactive dot classes', () => {
    expect(getTutorialProgressDotClass(1, 1)).toBe('w-10 bg-indigo-600');
    expect(getTutorialProgressDotClass(0, 1)).toBe('w-2 bg-slate-200');
  });

  it('determines if tutorial should advance', () => {
    expect(shouldAdvanceTutorialStep(0, 4)).toBe(true);
    expect(shouldAdvanceTutorialStep(2, 4)).toBe(true);
    expect(shouldAdvanceTutorialStep(3, 4)).toBe(false);
  });

  it('returns next label when more steps exist', () => {
    expect(getTutorialNextButtonLabel(0, 3)).toBe('Следно');
    expect(getTutorialNextButtonLabel(1, 3)).toBe('Следно');
  });

  it('returns start label on last step', () => {
    expect(getTutorialNextButtonLabel(2, 3)).toBe('Започни');
  });
});
