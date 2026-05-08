import { describe, expect, it } from 'vitest';
import {
  getCollabToggleButtonClass,
  getLanguageToggleButtonClass,
  getSaveButtonClass,
} from './actionButtons.js';

describe('actionButtons helpers', () => {
  it('builds language toggle classes for active and inactive states', () => {
    expect(getLanguageToggleButtonClass(true)).toContain('bg-white text-indigo-600');
    expect(getLanguageToggleButtonClass(false)).toContain('text-slate-400 hover:text-slate-600');
  });

  it('builds save button classes for saving and idle states', () => {
    expect(getSaveButtonClass(true)).toContain('bg-slate-100 text-slate-400');
    expect(getSaveButtonClass(false)).toContain('border-indigo-200 text-indigo-600');
  });

  it('builds collab toggle button classes for enabled and disabled states', () => {
    expect(getCollabToggleButtonClass(true)).toContain('bg-emerald-600 text-white');
    expect(getCollabToggleButtonClass(false)).toContain('border-slate-200 text-slate-500');
  });
});
