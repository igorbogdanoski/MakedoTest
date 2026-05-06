import { describe, it, expect } from 'vitest';
import { buildAdminPdfReportHtml, buildParentPdfReportHtml } from './pdfReports';

const attempts = [
  {
    studentId: 's1',
    totalScore: 80,
    maxScore: 100,
    gradeLevel: 8,
    semester: 'S1',
    items: [
      { qid: 'q1', earned: 1, max: 1 },
      { qid: 'q2', earned: 0, max: 1 },
    ],
  },
  {
    studentId: 's2',
    totalScore: 90,
    maxScore: 100,
    gradeLevel: 8,
    semester: 'S2',
    items: [
      { qid: 'q1', earned: 1, max: 1 },
      { qid: 'q2', earned: 1, max: 1 },
    ],
  },
];

const questions = [
  { id: 'q1', type: 'multiple', text: 'Објасни поим', bloomLevel: 'understand' },
  { id: 'q2', type: 'essay', text: 'Креирај решение' },
];

describe('pdfReports', () => {
  it('buildParentPdfReportHtml includes key parent sections', () => {
    const html = buildParentPdfReportHtml({
      schoolName: 'Alpha <School>',
      testTitle: 'Math Midterm',
      attempts,
      questions,
    });

    expect(html).toContain('Parent Progress Report');
    expect(html).toContain('Average Score');
    expect(html).toContain('Learning Focus (Bloom)');
    expect(html).toContain('Alpha &lt;School&gt;');
  });

  it('buildAdminPdfReportHtml includes cohort and semester delta sections', () => {
    const html = buildAdminPdfReportHtml({
      schoolName: 'Beta School',
      testTitle: 'Science',
      attempts,
      questions,
    });

    expect(html).toContain('School Administration Report');
    expect(html).toContain('Cohort Breakdown (Grade x Semester)');
    expect(html).toContain('Semester Delta (S2 - S1)');
    expect(html).toContain('Bloom Coverage');
  });
});
