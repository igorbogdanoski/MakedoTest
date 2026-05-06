import { describe, it, expect } from 'vitest';
import { analyzeCohorts } from './cohortAnalysis';

describe('analyzeCohorts', () => {
  it('returns empty report for empty input', () => {
    const r = analyzeCohorts([]);
    expect(r.rows).toEqual([]);
    expect(r.strongest).toBeNull();
    expect(r.weakest).toBeNull();
    expect(r.semesterDeltaByGrade).toEqual([]);
  });

  it('groups by grade and semester with computed stats', () => {
    const attempts = [
      { totalScore: 80, maxScore: 100, gradeLevel: 8, semester: 'S1' },
      { totalScore: 60, maxScore: 100, gradeLevel: 8, semester: 'S1' },
      { totalScore: 90, maxScore: 100, gradeLevel: 8, semester: 'S2' },
      { totalScore: 70, maxScore: 100, gradeLevel: 9, semester: 'S1' },
    ];

    const r = analyzeCohorts(attempts);
    expect(r.rows).toHaveLength(3);

    const g8s1 = r.rows.find((x) => x.grade === '8' && x.semester === 'S1');
    expect(g8s1.n).toBe(2);
    expect(g8s1.mean).toBe(70);

    expect(r.strongest.grade).toBe('8');
    expect(r.strongest.semester).toBe('S2');
    expect(r.weakest.grade).toBe('8');
    expect(r.weakest.semester).toBe('S1');
  });

  it('calculates S2-S1 semester delta per grade', () => {
    const attempts = [
      { totalScore: 50, maxScore: 100, gradeLevel: 7, semester: 'S1' },
      { totalScore: 70, maxScore: 100, gradeLevel: 7, semester: 'S2' },
      { totalScore: 65, maxScore: 100, gradeLevel: 8, semester: 'S1' },
      { totalScore: 60, maxScore: 100, gradeLevel: 8, semester: 'S2' },
    ];

    const r = analyzeCohorts(attempts);
    expect(r.semesterDeltaByGrade).toEqual([
      { grade: '7', s1Mean: 50, s2Mean: 70, delta: 20 },
      { grade: '8', s1Mean: 65, s2Mean: 60, delta: -5 },
    ]);
  });
});
