import { describe, expect, it } from 'vitest';
import { getCategoryButtonClass, getCategoryButtonLabel } from './categoryButtons.js';

describe('categoryButtons helpers', () => {
  it('returns active button class when isActive is true', () => {
    const result = getCategoryButtonClass(true);
    expect(result).toContain('bg-white');
    expect(result).toContain('text-indigo-600');
    expect(result).toContain('shadow-sm');
  });

  it('returns inactive button class when isActive is false', () => {
    const result = getCategoryButtonClass(false);
    expect(result).toContain('text-slate-400');
    expect(result).toContain('hover:text-slate-600');
    expect(result).not.toContain('bg-white');
  });

  it('extracts first word from category label', () => {
    expect(getCategoryButtonLabel('Multiple Choice')).toBe('Multiple');
    expect(getCategoryButtonLabel('True False')).toBe('True');
    expect(getCategoryButtonLabel('Short Answer')).toBe('Short');
  });

  it('handles single-word labels', () => {
    expect(getCategoryButtonLabel('Essay')).toBe('Essay');
  });

  it('returns label as-is for null or non-string input', () => {
    expect(getCategoryButtonLabel(null)).toBe(null);
    expect(getCategoryButtonLabel(undefined)).toBe(undefined);
  });
});
