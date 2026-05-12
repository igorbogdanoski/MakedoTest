import { describe, expect, it } from 'vitest';
import { computeEstimatedMinutes, computeTotalPoints, estimateQuestionMinutes } from './metrics.js';

describe('editor metrics helpers', () => {
  it('computeTotalPoints sums numeric points across questions', () => {
    expect(computeTotalPoints([{ points: 3 }, { points: 5 }, { points: 2 }])).toBe(10);
  });

  it('computeTotalPoints treats missing/invalid points as 0', () => {
    expect(computeTotalPoints([{ points: 4 }, {}, { points: null }, { points: '6' }])).toBe(10);
  });

  it('computeTotalPoints returns 0 for non-array inputs', () => {
    expect(computeTotalPoints(null)).toBe(0);
    expect(computeTotalPoints(undefined)).toBe(0);
  });

  it('estimateQuestionMinutes defaults to 2 minutes for medium difficulty', () => {
    expect(estimateQuestionMinutes({ type: 'multiple', difficulty: 'medium' })).toBe(2);
  });

  it('estimateQuestionMinutes uses 1 for easy and 5 for hard difficulties', () => {
    expect(estimateQuestionMinutes({ type: 'multiple', difficulty: 'easy' })).toBe(1);
    expect(estimateQuestionMinutes({ type: 'multiple', difficulty: 'hard' })).toBe(5);
  });

  it('estimateQuestionMinutes adds 5 minutes for essay and multi-part types', () => {
    expect(estimateQuestionMinutes({ type: 'essay', difficulty: 'medium' })).toBe(7);
    expect(estimateQuestionMinutes({ type: 'multi-part', difficulty: 'easy' })).toBe(6);
  });

  it('estimateQuestionMinutes adds 2 minutes for table and diagram types', () => {
    expect(estimateQuestionMinutes({ type: 'table', difficulty: 'medium' })).toBe(4);
    expect(estimateQuestionMinutes({ type: 'diagram', difficulty: 'hard' })).toBe(7);
  });

  it('computeEstimatedMinutes sums per-question estimates', () => {
    const questions = [
      { type: 'multiple', difficulty: 'easy' },
      { type: 'essay', difficulty: 'hard' },
      { type: 'table', difficulty: 'medium' },
    ];
    expect(computeEstimatedMinutes(questions)).toBe(1 + 10 + 4);
  });

  it('computeEstimatedMinutes returns 0 for non-array inputs', () => {
    expect(computeEstimatedMinutes(null)).toBe(0);
  });
});
