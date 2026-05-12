import { describe, it, expect } from 'vitest';
import { toggleTestInfoFlag, setTestInfoField, applyNextLayout } from './testInfoOps';

describe('toggleTestInfoFlag', () => {
  it('флипа boolean флаг', () => {
    expect(toggleTestInfoFlag({ zipGrade: false }, 'zipGrade')).toEqual({ zipGrade: true });
    expect(toggleTestInfoFlag({ zipGrade: true }, 'zipGrade')).toEqual({ zipGrade: false });
  });

  it('зачувува други полиња', () => {
    const out = toggleTestInfoFlag({ subject: 'X', showScale: false }, 'showScale');
    expect(out).toEqual({ subject: 'X', showScale: true });
  });

  it('non-object/empty key враќа input', () => {
    expect(toggleTestInfoFlag(null, 'x')).toBeNull();
    expect(toggleTestInfoFlag({ a: 1 }, '')).toEqual({ a: 1 });
  });
});

describe('setTestInfoField', () => {
  it('сетира field', () => {
    expect(setTestInfoField({ a: 1 }, 'b', 'val')).toEqual({ a: 1, b: 'val' });
  });

  it('презапишува постоечко поле', () => {
    expect(setTestInfoField({ subject: 'X' }, 'subject', 'Y')).toEqual({ subject: 'Y' });
  });

  it('non-object/empty key враќа input', () => {
    expect(setTestInfoField(null, 'x', 1)).toBeNull();
    expect(setTestInfoField({ a: 1 }, '', 2)).toEqual({ a: 1 });
  });
});

describe('applyNextLayout', () => {
  it('применува getNextLayout врз тековно layout', () => {
    const fn = (l) => (l === 'single' ? 'double' : 'single');
    expect(applyNextLayout({ layout: 'single', subject: 'X' }, fn)).toEqual({
      layout: 'double',
      subject: 'X',
    });
  });

  it('non-function/non-object враќа input', () => {
    expect(applyNextLayout({ layout: 'a' }, null)).toEqual({ layout: 'a' });
    expect(applyNextLayout(null, () => 'x')).toBeNull();
  });
});
