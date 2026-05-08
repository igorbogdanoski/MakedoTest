import { describe, expect, it } from 'vitest';
import { getSectionGridClass, getSectionItemSpanClass } from './sectionGrid.js';

describe('sectionGrid helpers', () => {
  it('returns double-column grid classes for double layout', () => {
    expect(getSectionGridClass('double')).toBe('grid gap-x-12 gap-y-20 grid-cols-2 mt-20');
  });

  it('returns single-column grid classes for non-double layouts', () => {
    expect(getSectionGridClass('single')).toBe('grid gap-x-12 gap-y-20 grid-cols-1 mt-20');
  });

  it('returns col-span-2 only for full-width items in double layout', () => {
    expect(getSectionItemSpanClass('double', true)).toBe('col-span-2');
    expect(getSectionItemSpanClass('double', false)).toBe('');
    expect(getSectionItemSpanClass('single', true)).toBe('');
  });
});
