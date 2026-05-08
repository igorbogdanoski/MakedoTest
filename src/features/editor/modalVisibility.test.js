import { describe, expect, it } from 'vitest';
import { shouldShowPasteModal, shouldShowTutorialModal } from './modalVisibility.js';

describe('modalVisibility helpers', () => {
  it('shows paste modal only when showPasteModal is truthy', () => {
    expect(shouldShowPasteModal(true)).toBe(true);
    expect(shouldShowPasteModal(false)).toBe(false);
  });

  it('returns false for null and undefined values in paste modal', () => {
    expect(shouldShowPasteModal(null)).toBe(false);
    expect(shouldShowPasteModal(undefined)).toBe(false);
  });

  it('shows tutorial modal only when showTutorial is truthy', () => {
    expect(shouldShowTutorialModal(true)).toBe(true);
    expect(shouldShowTutorialModal(false)).toBe(false);
  });

  it('returns false for null and undefined values in tutorial modal', () => {
    expect(shouldShowTutorialModal(null)).toBe(false);
    expect(shouldShowTutorialModal(undefined)).toBe(false);
  });
});
