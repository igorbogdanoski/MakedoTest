import { isValidElement } from 'react';
import { describe, expect, it } from 'vitest';
import { buildQuestionTypes, QUESTION_TYPE_DEFINITIONS } from './questionTypeConfig.js';

describe('questionTypeConfig', () => {
  it('exports all expected question type ids in stable order', () => {
    expect(QUESTION_TYPE_DEFINITIONS.map((q) => q.id)).toEqual([
      'multiple',
      'true-false',
      'fill-blanks',
      'selection',
      'multi-match',
      'short-answer',
      'essay',
      'matching',
      'ordering',
      'list',
      'table',
      'multi-part',
      'section',
      'diagram',
      'statements',
      'checklist',
    ]);
  });

  it('builds renderable icon nodes for all question types', () => {
    const types = buildQuestionTypes();
    expect(types).toHaveLength(16);
    types.forEach((type) => {
      expect(isValidElement(type.icon)).toBe(true);
    });
  });

  it('keeps metadata fields required by filtering/sorting logic', () => {
    buildQuestionTypes().forEach((type) => {
      expect(type).toMatchObject({
        id: expect.any(String),
        label: expect.any(String),
        cat: expect.any(String),
        subjects: expect.any(Array),
        priority: expect.any(Number),
      });
      expect(type.subjects.length).toBeGreaterThan(0);
    });
  });
});
