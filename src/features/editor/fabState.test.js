import { describe, expect, it } from 'vitest';
import { shouldShowAddQuestionFAB } from './fabState.js';

describe('fabState helpers', () => {
  it('shows FAB only when sidebar is closed and view is editor', () => {
    expect(shouldShowAddQuestionFAB(false, 'editor')).toBe(true);
    expect(shouldShowAddQuestionFAB(true, 'editor')).toBe(false);
    expect(shouldShowAddQuestionFAB(false, 'preview')).toBe(false);
    expect(shouldShowAddQuestionFAB(true, 'preview')).toBe(false);
  });

  it('returns false for all combinations except closed sidebar and editor view', () => {
    const combinations = [
      [true, 'editor'],
      [true, 'preview'],
      [true, 'answerKey'],
      [false, 'preview'],
      [false, 'answerKey'],
      [false, 'analytics'],
    ];
    combinations.forEach(([open, view]) => {
      expect(shouldShowAddQuestionFAB(open, view)).toBe(false);
    });
  });
});
