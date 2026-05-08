import { describe, expect, it } from 'vitest';
import {
  getCollabToggleButtonClass,
  getLanguageToggleButtonClass,
  getSaveButtonClass,
  getSaveButtonIconClass,
  getSaveButtonLabel,
  getVisionImportButtonClass,
  getVisionImportButtonLabel,
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

  it('builds save icon class for saving and idle states', () => {
    expect(getSaveButtonIconClass(true)).toBe('animate-bounce');
    expect(getSaveButtonIconClass(false)).toBe('');
  });

  it('builds save label for saving and idle states with translator', () => {
    const t = (key) => `tx:${key}`;
    expect(getSaveButtonLabel(true, t)).toBe('tx:saving');
    expect(getSaveButtonLabel(false, t)).toBe('tx:saveTest');
  });

  it('falls back to keys when save label translator is missing', () => {
    expect(getSaveButtonLabel(true)).toBe('saving');
    expect(getSaveButtonLabel(false)).toBe('saveTest');
  });

  it('builds vision import button classes for busy and idle states', () => {
    expect(getVisionImportButtonClass(true)).toContain('text-slate-300 bg-slate-50');
    expect(getVisionImportButtonClass(false)).toContain('text-slate-400 hover:bg-white');
  });

  it('builds vision import button labels for busy and idle states', () => {
    expect(getVisionImportButtonLabel(true)).toBe('OCR...');
    expect(getVisionImportButtonLabel(false)).toBe('Vision');
  });

  it('builds collab toggle button classes for enabled and disabled states', () => {
    expect(getCollabToggleButtonClass(true)).toContain('bg-emerald-600 text-white');
    expect(getCollabToggleButtonClass(false)).toContain('border-slate-200 text-slate-500');
  });
});
