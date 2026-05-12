import { describe, expect, it } from 'vitest';
import { applyQuestionBloom, applyQuestionRagFeedback } from './questionMeta.js';

describe('questionMeta helpers', () => {
  it('applyQuestionBloom updates bloomLevel for matching id only', () => {
    const questions = [
      { id: 1, text: 'Q1' },
      { id: 2, text: 'Q2', bloomLevel: 'remember' },
    ];
    const next = applyQuestionBloom(questions, 2, 'analyze');
    expect(next[0]).toEqual({ id: 1, text: 'Q1' });
    expect(next[1]).toEqual({ id: 2, text: 'Q2', bloomLevel: 'analyze' });
  });

  it('applyQuestionBloom returns unchanged list when no match', () => {
    const questions = [{ id: 1, text: 'Q1' }];
    const next = applyQuestionBloom(questions, 999, 'analyze');
    expect(next).toEqual(questions);
  });

  it('applyQuestionBloom returns empty array for non-array input', () => {
    expect(applyQuestionBloom(null, 1, 'analyze')).toEqual([]);
  });

  it('applyQuestionRagFeedback updates ragFeedback for matching id only', () => {
    const questions = [
      { id: 1, text: 'Q1' },
      { id: 2, text: 'Q2' },
    ];
    const next = applyQuestionRagFeedback(questions, 1, 'positive');
    expect(next[0]).toEqual({ id: 1, text: 'Q1', ragFeedback: 'positive' });
    expect(next[1]).toEqual({ id: 2, text: 'Q2' });
  });

  it('applyQuestionRagFeedback returns empty array for non-array input', () => {
    expect(applyQuestionRagFeedback(undefined, 1, 'x')).toEqual([]);
  });
});
