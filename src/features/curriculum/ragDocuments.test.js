import { describe, it, expect } from 'vitest';
import { buildCurriculumRagDocuments } from './ragDocuments.js';

describe('buildCurriculumRagDocuments', () => {
  it('converts concept entries into rag documents', () => {
    const docs = buildCurriculumRagDocuments([
      {
        id: 'c-1',
        title: 'Linear equations',
        description: 'Linear equations',
        assessmentStandards: ['Solves one-variable linear equations'],
        topicId: 't-1',
        topicTitle: 'Algebra',
        gradeId: 'g-8',
        gradeLevel: 8,
        track: 'primary',
      },
    ]);

    expect(docs).toHaveLength(1);
    expect(docs[0].id).toBe('c-1');
    expect(docs[0].text).toContain('Track: primary');
    expect(docs[0].text).toContain('Grade: 8');
    expect(docs[0].text).toContain('Concept: Linear equations');
    expect(docs[0].metadata).toMatchObject({
      source: 'curriculum-concept',
      conceptId: 'c-1',
      topicId: 't-1',
      gradeLevel: 8,
      track: 'primary',
    });
  });

  it('handles missing assessment standards', () => {
    const docs = buildCurriculumRagDocuments([
      {
        id: 'c-2',
        title: 'Geometry basics',
        description: 'Geometry basics',
        assessmentStandards: [],
        topicId: 't-2',
        topicTitle: 'Geometry',
        gradeId: 'g-5',
        gradeLevel: 5,
        track: 'primary',
      },
    ]);

    expect(docs[0].text).toContain('Assessment standards: none specified');
    expect(docs[0].metadata.assessmentStandards).toEqual([]);
  });

  it('throws on non-array input', () => {
    expect(() => buildCurriculumRagDocuments(null)).toThrow(
      'buildCurriculumRagDocuments expects an array'
    );
  });
});
