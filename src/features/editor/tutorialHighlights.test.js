import { describe, expect, it } from 'vitest';
import { getTutorialStepHighlightClass } from './tutorialHighlights.js';

describe('getTutorialStepHighlightClass', () => {
  it('returns active class when tutorial is shown and step matches', () => {
    const result = getTutorialStepHighlightClass(true, 2, 2, 'ring-4 bg-indigo-50');
    expect(result).toBe('ring-4 bg-indigo-50');
  });

  it('returns empty string when tutorial is hidden', () => {
    const result = getTutorialStepHighlightClass(false, 2, 2, 'ring-4 bg-indigo-50');
    expect(result).toBe('');
  });

  it('returns empty string when step does not match', () => {
    const result = getTutorialStepHighlightClass(true, 1, 2, 'ring-4 bg-indigo-50');
    expect(result).toBe('');
  });
});
