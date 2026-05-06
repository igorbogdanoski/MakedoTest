import { describe, expect, it } from 'vitest';
import { buildRagQualityRecords, summarizeRagQuality } from './ragQuality';

describe('ragQuality', () => {
  it('builds records from question list and skips sections', () => {
    const records = buildRagQualityRecords([
      { id: 'sec', type: 'section' },
      { id: 'q1', type: 'multiple', text: 'Реши задача', difficulty: 'easy' },
      {
        id: 'q2',
        type: 'essay',
        text: 'Напиши анализа',
        ragFeedback: 'flagged',
      },
    ]);

    expect(records).toHaveLength(2);
    expect(records[0].questionId).toBe('q1');
    expect(records[1].hallucinationFlag).toBe(true);
  });

  it('summarizes latency, coverage and feedback', () => {
    const summary = summarizeRagQuality([
      {
        questionId: 'q1',
        type: 'multiple',
        latencyMs: 500,
        citationsRetrieved: 4,
        citationsUsed: 2,
        hallucinationFlag: false,
        feedback: 'helpful',
      },
      {
        questionId: 'q2',
        type: 'essay',
        latencyMs: 900,
        citationsRetrieved: 2,
        citationsUsed: 0,
        hallucinationFlag: true,
        feedback: 'flagged',
      },
    ]);

    expect(summary.totalQueries).toBe(2);
    expect(summary.avgLatencyMs).toBe(700);
    expect(summary.p95LatencyMs).toBe(500);
    expect(summary.citationCoveragePct).toBe(33);
    expect(summary.hallucinationRatePct).toBe(50);
    expect(summary.feedbackCounts.helpful).toBe(1);
    expect(summary.feedbackCounts.flagged).toBe(1);
    expect(summary.flaggedSamples).toHaveLength(1);
  });

  it('returns zeroed summary for empty list', () => {
    const summary = summarizeRagQuality([]);
    expect(summary.totalQueries).toBe(0);
    expect(summary.avgLatencyMs).toBe(0);
    expect(summary.flaggedSamples).toEqual([]);
  });
});
