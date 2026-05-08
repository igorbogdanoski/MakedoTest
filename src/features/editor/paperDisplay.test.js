import { describe, expect, it } from 'vitest';
import { shouldShowGradingScale, shouldShowSmartBadge, getSmartBadgeText } from './paperDisplay.js';

describe('paperDisplay helpers', () => {
  it('shows grading scale only when testInfo.showScale is true', () => {
    expect(shouldShowGradingScale({ showScale: true })).toBe(true);
    expect(shouldShowGradingScale({ showScale: false })).toBe(false);
    expect(shouldShowGradingScale({})).toBe(false);
    expect(shouldShowGradingScale(null)).toBe(false);
  });

  it('shows smart badge only when subject length is greater than 5', () => {
    expect(shouldShowSmartBadge('Physics')).toBe(true);
    expect(shouldShowSmartBadge('Math')).toBe(false);
    expect(shouldShowSmartBadge('Chemistry 101')).toBe(true);
    expect(shouldShowSmartBadge('')).toBe(false);
    expect(shouldShowSmartBadge(null)).toBe(false);
    expect(shouldShowSmartBadge(undefined)).toBe(false);
  });

  it('extracts first word from subject for smart badge text', () => {
    expect(getSmartBadgeText('Physics and Chemistry')).toBe('Physics');
    expect(getSmartBadgeText('Biology')).toBe('Biology');
    expect(getSmartBadgeText('Math')).toBe('');
    expect(getSmartBadgeText(null)).toBe('');
  });
});
