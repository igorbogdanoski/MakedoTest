import { describe, expect, it } from 'vitest';
import { reorderQuestions, shuffleQuestionOptions, shuffleQuestions } from './listOps.js';

describe('listOps helpers', () => {
  it('shuffleQuestions returns same items for non-array input', () => {
    expect(shuffleQuestions(null)).toEqual([]);
  });

  it('shuffleQuestions preserves all items', () => {
    const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const out = shuffleQuestions(input);
    expect(out).toHaveLength(3);
    expect(out.map((q) => q.id).sort()).toEqual([1, 2, 3]);
  });

  it('shuffleQuestions returns a new array (does not mutate input)', () => {
    const input = [{ id: 1 }, { id: 2 }];
    const out = shuffleQuestions(input);
    expect(out).not.toBe(input);
  });

  it('shuffleQuestionOptions reorders options for matching id only', () => {
    const questions = [
      { id: 1, options: ['a', 'b', 'c'] },
      { id: 2, options: ['x', 'y'] },
    ];
    const out = shuffleQuestionOptions(questions, 1, () => 0.5);
    expect(out[0].options).toHaveLength(3);
    expect(out[1]).toBe(questions[1]);
  });

  it('shuffleQuestionOptions ignores questions without options', () => {
    const questions = [{ id: 1, text: 'q1' }];
    const out = shuffleQuestionOptions(questions, 1);
    expect(out[0]).toEqual({ id: 1, text: 'q1' });
  });

  it('shuffleQuestionOptions handles non-array input', () => {
    expect(shuffleQuestionOptions(null, 1)).toEqual([]);
  });

  it('reorderQuestions swaps adjacent items', () => {
    const input = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(reorderQuestions(input, 0, 1)).toEqual([{ id: 2 }, { id: 1 }, { id: 3 }]);
    expect(reorderQuestions(input, 2, -1)).toEqual([{ id: 1 }, { id: 3 }, { id: 2 }]);
  });

  it('reorderQuestions returns unchanged list for out-of-bounds direction', () => {
    const input = [{ id: 1 }, { id: 2 }];
    expect(reorderQuestions(input, 0, -1)).toBe(input);
    expect(reorderQuestions(input, 1, 1)).toBe(input);
  });

  it('reorderQuestions handles non-array input', () => {
    expect(reorderQuestions(null, 0, 1)).toEqual([]);
  });
});
