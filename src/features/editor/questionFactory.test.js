import { describe, expect, it } from 'vitest';
import { createQuestion } from './questionFactory.js';

describe('createQuestion factory', () => {
  it('creates a base multiple question with options and 2 columns', () => {
    const q = createQuestion('multiple', { id: 1 });
    expect(q.type).toBe('multiple');
    expect(q.columns).toBe(2);
    expect(q.options).toEqual(['', '', '']);
    expect(q.correct).toBe(0);
    expect(q.corrects).toEqual([]);
    expect(q.points).toBe(5);
    expect(q.difficulty).toBe('medium');
  });

  it('creates an essay question with default response config', () => {
    const q = createQuestion('essay', { id: 99 });
    expect(q.responseConfig).toEqual({
      allowMathEditor: true,
      allowHandwrittenUpload: false,
      requireQrForAttachment: true,
    });
  });

  it('creates checklist with 2 columns and options', () => {
    const q = createQuestion('checklist', { id: 2 });
    expect(q.columns).toBe(2);
    expect(q.options).toHaveLength(3);
  });

  it('creates true-false with horizontal layout', () => {
    const q = createQuestion('true-false', { id: 3 });
    expect(q.correct).toBe(0);
    expect(q.layout).toBe('horizontal');
  });

  it('creates matching with two empty pairs', () => {
    const q = createQuestion('matching', { id: 4 });
    expect(q.matches).toEqual([
      { s: '', a: '' },
      { s: '', a: '' },
    ]);
  });

  it('creates multi-match with two empty pairs', () => {
    const q = createQuestion('multi-match', { id: 5 });
    expect(q.matches).toHaveLength(2);
  });

  it('creates table with default 3x3 grid', () => {
    const q = createQuestion('table', { id: 6 });
    expect(q.tableData).toEqual({ rows: 3, cols: 3, data: {} });
  });

  it('creates selection with example text', () => {
    const q = createQuestion('selection', { id: 7 });
    expect(q.text).toContain('{точен|погрешно}');
  });

  it('creates section with fullWidth, 0 points and inherited layout', () => {
    const q = createQuestion('section', { id: 8, sectionLayout: 'double' });
    expect(q.points).toBe(0);
    expect(q.fullWidth).toBe(true);
    expect(q.text).toBe('НОВА СЕКЦИЈА');
    expect(q.sectionLayout).toBe('double');
  });

  it('creates list/ordering with items array', () => {
    expect(createQuestion('list', { id: 9 }).items).toEqual(['', '', '']);
    expect(createQuestion('ordering', { id: 10 }).items).toHaveLength(3);
  });

  it('creates statements with two empty entries', () => {
    const q = createQuestion('statements', { id: 11 });
    expect(q.items).toEqual([
      { s: '', correct: 0 },
      { s: '', correct: 0 },
    ]);
  });

  it('creates multi-part with two empty parts', () => {
    const q = createQuestion('multi-part', { id: 12 });
    expect(q.parts).toEqual(['', '']);
  });

  it('creates diagram with default embed fields', () => {
    const q = createQuestion('diagram', { id: 13 });
    expect(q.embedType).toBe('image');
    expect(q.embedUrl).toBe('');
    expect(q.imageUrl).toBe('');
  });

  it('uses Date.now() id when not provided', () => {
    const q = createQuestion('multiple');
    expect(typeof q.id).toBe('number');
    expect(q.id).toBeGreaterThan(0);
  });
});
