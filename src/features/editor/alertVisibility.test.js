import { describe, expect, it } from 'vitest';
import {
  shouldShowDuplicateAlert,
  shouldShowLastEditBadge,
  shouldShowConflictHint,
} from './alertVisibility.js';

describe('alertVisibility helpers', () => {
  it('shows duplicate alert only when duplicateAlert is truthy', () => {
    expect(shouldShowDuplicateAlert('Test error message')).toBe(true);
    expect(shouldShowDuplicateAlert(null)).toBe(false);
    expect(shouldShowDuplicateAlert('')).toBe(false);
    expect(shouldShowDuplicateAlert(undefined)).toBe(false);
  });

  it('shows last edit badge only when lastRemoteEdit is truthy', () => {
    expect(shouldShowLastEditBadge({ userId: '123', timestamp: 1000 })).toBe(true);
    expect(shouldShowLastEditBadge(null)).toBe(false);
    expect(shouldShowLastEditBadge(undefined)).toBe(false);
  });

  it('shows conflict hint only when conflictHint is truthy', () => {
    expect(shouldShowConflictHint('Conflict detected')).toBe(true);
    expect(shouldShowConflictHint(null)).toBe(false);
    expect(shouldShowConflictHint('')).toBe(false);
    expect(shouldShowConflictHint(undefined)).toBe(false);
  });
});
