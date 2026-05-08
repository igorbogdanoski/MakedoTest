import { describe, expect, it } from 'vitest';
import { getNavViewButtonClass, getNavViewLabel, NAV_VIEW_TABS } from './navViewTabs.js';

describe('navViewTabs helpers', () => {
  it('exports the expected nav tab order', () => {
    expect(NAV_VIEW_TABS).toEqual([
      'editor',
      'preview',
      'answerKey',
      'answerSheet',
      'analytics',
      'verify',
    ]);
  });

  it('returns labels for known views and fallback for unknown', () => {
    expect(getNavViewLabel('editor')).toBe('Уреди');
    expect(getNavViewLabel('analytics')).toBe('Аналитика');
    expect(getNavViewLabel('unknown')).toBe('Verify');
  });

  it('builds active and inactive nav button classes', () => {
    expect(getNavViewButtonClass(true)).toContain('bg-white text-indigo-600');
    expect(getNavViewButtonClass(false)).toContain('text-slate-500 hover:text-slate-900');
  });
});
