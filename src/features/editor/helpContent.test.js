import { describe, expect, it } from 'vitest';
import { HELP_CONTENT } from './helpContent.js';

describe('HELP_CONTENT', () => {
  it('contains all expected question type keys', () => {
    expect(Object.keys(HELP_CONTENT).sort()).toEqual(
      [
        'multiple',
        'true-false',
        'fill-blanks',
        'selection',
        'multi-match',
        'table',
        'checklist',
        'ordering',
        'short-answer',
        'essay',
        'matching',
        'multi-part',
        'diagram',
      ].sort()
    );
  });

  it('stores complete help shape for every entry', () => {
    Object.values(HELP_CONTENT).forEach((entry) => {
      expect(entry).toMatchObject({
        desc: expect.any(String),
        use: expect.any(String),
        example: expect.any(String),
        tip: expect.any(String),
      });
      expect(entry.desc.length).toBeGreaterThan(0);
      expect(entry.use.length).toBeGreaterThan(0);
      expect(entry.example.length).toBeGreaterThan(0);
      expect(entry.tip.length).toBeGreaterThan(0);
    });
  });

  it('keeps legacy copy for multiple choice title text', () => {
    expect(HELP_CONTENT.multiple.desc).toContain('Најчест формат');
  });
});
