import { describe, it, expect } from 'vitest';
import {
  analyzeAttempts,
  classifyDifficulty,
  classifyDiscrimination,
  attemptFromGradeResult,
} from './itemAnalysis';

const mkAttempt = (id, items) => ({
  studentId: id,
  items: items.map(([qid, earned, max]) => ({ qid, earned, max })),
});

describe('classifyDifficulty', () => {
  it('thresholds', () => {
    expect(classifyDifficulty(0.95)).toBe('easy');
    expect(classifyDifficulty(0.6)).toBe('medium');
    expect(classifyDifficulty(0.2)).toBe('hard');
  });
});

describe('classifyDiscrimination', () => {
  it('thresholds', () => {
    expect(classifyDiscrimination(0.5)).toBe('excellent');
    expect(classifyDiscrimination(0.35)).toBe('good');
    expect(classifyDiscrimination(0.25)).toBe('acceptable');
    expect(classifyDiscrimination(0.1)).toBe('poor');
    expect(classifyDiscrimination(-0.1)).toBe('reverse');
  });
});

describe('analyzeAttempts', () => {
  it('returns empty stats for no attempts', () => {
    const r = analyzeAttempts([]);
    expect(r.itemStats).toEqual([]);
    expect(r.cohort.n).toBe(0);
    expect(r.cohort.distribution).toHaveLength(10);
  });

  it('computes p-value as proportion correct', () => {
    const r = analyzeAttempts([
      mkAttempt('a', [['q1', 1, 1]]),
      mkAttempt('b', [['q1', 1, 1]]),
      mkAttempt('c', [['q1', 0, 1]]),
      mkAttempt('d', [['q1', 0, 1]]),
    ]);
    const q1 = r.itemStats.find((s) => s.qid === 'q1');
    expect(q1.pValue).toBe(0.5);
    expect(q1.attempts).toBe(4);
    expect(q1.difficulty).toBe('medium');
  });

  it('computes positive discrimination for items aligned with totals', () => {
    // Strong learner gets all right; weak learner gets all wrong.
    const r = analyzeAttempts([
      mkAttempt('strong', [
        ['q1', 1, 1],
        ['q2', 1, 1],
        ['q3', 1, 1],
      ]),
      mkAttempt('weak', [
        ['q1', 0, 1],
        ['q2', 0, 1],
        ['q3', 0, 1],
      ]),
      mkAttempt('mid', [
        ['q1', 1, 1],
        ['q2', 0, 1],
        ['q3', 1, 1],
      ]),
    ]);
    const q1 = r.itemStats.find((s) => s.qid === 'q1');
    expect(q1.discrimination).toBeGreaterThan(0.5);
    expect(['excellent', 'good']).toContain(q1.discriminationLabel);
  });

  it('detects reverse discrimination', () => {
    // Strong students miss q1; weak students get it. Totals differ.
    const r = analyzeAttempts([
      mkAttempt('strong', [
        ['q1', 0, 1],
        ['q2', 1, 1],
        ['q3', 1, 1],
      ]),
      mkAttempt('weak', [
        ['q1', 1, 1],
        ['q2', 0, 1],
        ['q3', 0, 1],
      ]),
    ]);
    const q1 = r.itemStats.find((s) => s.qid === 'q1');
    expect(q1.discrimination).toBeLessThan(0);
    expect(q1.discriminationLabel).toBe('reverse');
  });

  it('cohort summary computes correctly', () => {
    const r = analyzeAttempts([
      mkAttempt('a', [['q1', 1, 1]]),
      mkAttempt('b', [['q1', 0, 1]]),
      mkAttempt('c', [['q1', 1, 1]]),
    ]);
    expect(r.cohort.n).toBe(3);
    expect(r.cohort.mean).toBeCloseTo(66.67, 1);
    expect(r.cohort.distribution.reduce((s, x) => s + x, 0)).toBe(3);
  });

  it('preserves question order from first attempt', () => {
    const r = analyzeAttempts([
      mkAttempt('a', [
        ['q3', 1, 1],
        ['q1', 1, 1],
        ['q2', 0, 1],
      ]),
    ]);
    expect(r.itemStats.map((s) => s.qid)).toEqual(['q3', 'q1', 'q2']);
  });

  it('skips items with zero max', () => {
    const r = analyzeAttempts([
      mkAttempt('a', [
        ['q1', 0, 0],
        ['q2', 1, 1],
      ]),
    ]);
    const q1 = r.itemStats.find((s) => s.qid === 'q1');
    expect(q1.attempts).toBe(0);
  });
});

describe('attemptFromGradeResult', () => {
  it('maps grading shape into attempt shape', () => {
    const a = attemptFromGradeResult('s1', {
      earned: 8,
      max: 10,
      items: [
        { id: 'q1', earned: 4, max: 5 },
        { id: 'q2', earned: 4, max: 5 },
      ],
    });
    expect(a.studentId).toBe('s1');
    expect(a.totalScore).toBe(8);
    expect(a.maxScore).toBe(10);
    expect(a.items).toEqual([
      { qid: 'q1', earned: 4, max: 5 },
      { qid: 'q2', earned: 4, max: 5 },
    ]);
  });
});
