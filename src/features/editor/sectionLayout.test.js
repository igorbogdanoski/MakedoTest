import { describe, expect, it } from 'vitest';
import { buildQuestionSections } from './sectionLayout.js';

describe('buildQuestionSections', () => {
  it('builds a single default section when no section headers exist', () => {
    const questions = [
      { id: 'q1', type: 'multiple' },
      { id: 'q2', type: 'essay' },
    ];

    const sections = buildQuestionSections(questions, 'single');

    expect(sections).toHaveLength(1);
    expect(sections[0].layout).toBe('single');
    expect(sections[0].questions.map((entry) => entry.q.id)).toEqual(['q1', 'q2']);
  });

  it('splits sections and applies section layout override from headers', () => {
    const questions = [
      { id: 'q1', type: 'multiple' },
      { id: 's1', type: 'section', sectionLayout: 'double' },
      { id: 'q2', type: 'essay' },
    ];

    const sections = buildQuestionSections(questions, 'single');

    expect(sections[0].layout).toBe('single');
    expect(sections[0].questions.map((entry) => entry.q.id)).toEqual(['q1']);

    expect(sections[1]).toMatchObject({ isHeader: true, idx: 1 });
    expect(sections[1].q.id).toBe('s1');

    expect(sections[2].layout).toBe('double');
    expect(sections[2].questions.map((entry) => entry.q.id)).toEqual(['q2']);
  });

  it('keeps trailing empty section when the last question is a section header', () => {
    const questions = [{ id: 's1', type: 'section' }];

    const sections = buildQuestionSections(questions, 'single');

    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({ isHeader: true, idx: 0 });
    expect(sections[1]).toMatchObject({ layout: 'single' });
    expect(sections[1].questions).toEqual([]);
  });
});
