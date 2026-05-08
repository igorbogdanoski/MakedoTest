import { describe, expect, it } from 'vitest';
import { buildFilteredQuestionTypes } from './filterTypes.js';

const QUESTION_TYPES = [
  {
    id: 'stem-a',
    label: 'Алгебра',
    subjects: ['stem'],
    priority: 5,
  },
  {
    id: 'lang-a',
    label: 'Граматика',
    subjects: ['languages'],
    priority: 10,
  },
  {
    id: 'geo-a',
    label: 'Геометриски Проблем',
    subjects: ['geometry'],
    priority: 6,
  },
  {
    id: 'all-a',
    label: 'Општо Прашање',
    subjects: ['all'],
    priority: 7,
  },
];

describe('buildFilteredQuestionTypes', () => {
  it('applies case-insensitive search filtering', () => {
    const result = buildFilteredQuestionTypes({
      questionTypes: QUESTION_TYPES,
      typeSearch: 'гРАм',
      subject: '',
      activeCategory: 'all',
    });

    expect(result.map((item) => item.id)).toEqual(['lang-a']);
  });

  it('prioritizes STEM-relevant types for STEM subjects', () => {
    const result = buildFilteredQuestionTypes({
      questionTypes: QUESTION_TYPES,
      typeSearch: '',
      subject: 'Математика',
      activeCategory: 'all',
    });

    expect(result[0].id).toBe('stem-a');
  });

  it('applies category filtering with all-subject fallback', () => {
    const result = buildFilteredQuestionTypes({
      questionTypes: QUESTION_TYPES,
      typeSearch: '',
      subject: '',
      activeCategory: 'languages',
    });

    expect(result.map((item) => item.id)).toEqual(['lang-a', 'all-a']);
  });
});
