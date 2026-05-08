import { describe, expect, it } from 'vitest';
import { buildToolboxSections } from './toolboxSections.js';

describe('buildToolboxSections', () => {
  const ORDER = ['базични', 'напредни', 'geometry'];

  const TYPES = [
    { id: 'a', cat: 'базични', subjects: ['all'] },
    { id: 'b', cat: 'напредни', subjects: ['stem'] },
    { id: 'c', cat: 'напредни', subjects: ['geometry', 'stem'] },
    { id: 'd', cat: 'логички', subjects: ['geometry'] },
  ];

  it('returns sections only when there are items in that category', () => {
    const sections = buildToolboxSections(TYPES, ORDER);
    expect(sections.map((section) => section.category)).toEqual([
      'базични',
      'напредни',
      'geometry',
    ]);
  });

  it('deduplicates geometry-tagged items from advanced category', () => {
    const sections = buildToolboxSections(TYPES, ORDER);
    const advanced = sections.find((section) => section.category === 'напредни');

    expect(advanced.items.map((item) => item.id)).toEqual(['b']);
  });

  it('keeps geometry items in geometry section regardless of original category', () => {
    const sections = buildToolboxSections(TYPES, ORDER);
    const geometry = sections.find((section) => section.category === 'geometry');

    expect(geometry.items.map((item) => item.id)).toEqual(['c', 'd']);
  });
});
