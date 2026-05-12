import { describe, it, expect } from 'vitest';
import { FAB_QUICK_TYPES, getFabQuickTypeMeta } from './fabConfig';

describe('FAB_QUICK_TYPES', () => {
  it('содржи 4 quick-add типа', () => {
    expect(FAB_QUICK_TYPES).toEqual(['multiple', 'true-false', 'short-answer', 'section']);
  });
});

describe('getFabQuickTypeMeta', () => {
  const types = [
    { id: 'multiple', icon: 'icon-m', label: 'Повеќе' },
    { id: 'section', icon: 'icon-s', label: 'Секција' },
  ];

  it('враќа meta за пронајден тип', () => {
    expect(getFabQuickTypeMeta('section', types)).toEqual({
      id: 'section',
      icon: 'icon-s',
      label: 'Секција',
    });
  });

  it('враќа fallback meta за непознат тип', () => {
    const out = getFabQuickTypeMeta('unknown', types);
    expect(out).toEqual({ id: 'unknown', icon: null, label: '' });
  });

  it('non-array враќа null', () => {
    expect(getFabQuickTypeMeta('multiple', null)).toBeNull();
  });
});
