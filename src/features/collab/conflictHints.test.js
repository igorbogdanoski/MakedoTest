import { describe, it, expect } from 'vitest';
import { buildConflictHint, formatLastEditAgeMs } from './conflictHints';

describe('buildConflictHint', () => {
  it('returns neutral hint when no local divergence', () => {
    const msg = buildConflictHint({ hadLocalDivergence: false, remoteDisplayName: 'Ana' });
    expect(msg).toMatch(/Ana/);
    expect(msg).toMatch(/промени/);
  });

  it('returns conflict-aware hint when local divergence exists', () => {
    const msg = buildConflictHint({ hadLocalDivergence: true, remoteDisplayName: 'Marko' });
    expect(msg).toMatch(/локални измени/);
    expect(msg).toMatch(/Undo/);
  });
});

describe('formatLastEditAgeMs', () => {
  it('formats recent time as now', () => {
    expect(formatLastEditAgeMs(1000)).toBe('токму сега');
  });

  it('formats seconds', () => {
    expect(formatLastEditAgeMs(13000)).toBe('пред 13s');
  });

  it('formats minutes', () => {
    expect(formatLastEditAgeMs(121000)).toBe('пред 2m');
  });
});
