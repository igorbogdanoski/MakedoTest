import { describe, expect, it } from 'vitest';
import { BLOOM_LEVELS, inferBloomLevel, summarizeBloomCoverage } from './bloom';

describe('inferBloomLevel', () => {
  it('returns explicit bloomLevel when already set', () => {
    expect(inferBloomLevel({ bloomLevel: 'create', text: 'anything', type: 'multiple' })).toBe(
      'create'
    );
  });

  it('uses verb clues from text', () => {
    expect(inferBloomLevel({ text: 'Analyze and compare these results', type: 'multiple' })).toBe(
      'analyze'
    );
    expect(inferBloomLevel({ text: 'Design a new experiment', type: 'multiple' })).toBe('create');
  });

  it('falls back to type prior when text has no signals', () => {
    expect(inferBloomLevel({ text: 'Q', type: 'true-false' })).toBe('remember');
    expect(inferBloomLevel({ text: 'Q', type: 'essay' })).toBe('evaluate');
  });
});

describe('summarizeBloomCoverage', () => {
  it('summarizes counts and percentages excluding sections', () => {
    const report = summarizeBloomCoverage([
      { type: 'section', text: 'I' },
      { type: 'multiple', text: 'Define atom' },
      { type: 'essay', text: 'Evaluate policy' },
      { type: 'multiple', text: 'Solve equation' },
    ]);

    expect(report.total).toBe(3);
    expect(report.counts.remember).toBe(1);
    expect(report.counts.evaluate).toBe(1);
    expect(report.counts.apply).toBe(1);
    const total =
      report.percentages.remember + report.percentages.evaluate + report.percentages.apply;
    expect(total).toBeGreaterThanOrEqual(99);
    expect(total).toBeLessThanOrEqual(100);
  });

  it('returns zeroed report for empty input', () => {
    const report = summarizeBloomCoverage([]);
    expect(report.total).toBe(0);
    BLOOM_LEVELS.forEach((level) => {
      expect(report.counts[level]).toBe(0);
      expect(report.percentages[level]).toBe(0);
    });
  });
});
