import { describe, expect, it } from 'vitest';
import {
  getAdvancedToggleButtonClass,
  getLayoutToggleLabel,
  getNextLayout,
} from './advancedSettings.js';

describe('advancedSettings helpers', () => {
  it('builds active and inactive toggle classes', () => {
    expect(getAdvancedToggleButtonClass(true)).toContain('bg-indigo-600');
    expect(getAdvancedToggleButtonClass(false)).toContain('bg-slate-50');
  });

  it('computes next layout value', () => {
    expect(getNextLayout('single')).toBe('double');
    expect(getNextLayout('double')).toBe('single');
  });

  it('returns layout toggle labels', () => {
    expect(getLayoutToggleLabel('single')).toBe('2 Колони');
    expect(getLayoutToggleLabel('double')).toBe('1 Колона');
  });
});
