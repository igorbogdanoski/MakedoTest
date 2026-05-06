import { describe, expect, it } from 'vitest';
import { validateCurriculumSnapshot } from './validateSnapshot';

function makeConcept(id, standards = ['Std 1']) {
  return {
    id,
    title: `Concept ${id}`,
    assessmentStandards: standards,
  };
}

function makeTopic(id, conceptIds) {
  return {
    id,
    title: `Topic ${id}`,
    concepts: conceptIds.map((cid) => makeConcept(cid)),
  };
}

function makeGrade(level, track, topicId, conceptId) {
  return {
    id: `${track}-${level}`,
    level,
    title: `${track} ${level}`,
    ...(track !== 'primary' ? { secondaryTrack: track } : {}),
    topics: [makeTopic(topicId, [conceptId])],
  };
}

function validSnapshot() {
  return {
    version: '2026-05-06',
    source: {
      repository: 'igorbogdanoski/math-curriculum-ai-navigator',
      commitSha: 'abcdef1234567',
      extractedAt: '2026-05-06T00:00:00Z',
    },
    tracks: [
      {
        track: 'primary',
        grades: [
          makeGrade(1, 'primary', 't-p-1', 'p-1'),
          makeGrade(2, 'primary', 't-p-2', 'p-2'),
          makeGrade(3, 'primary', 't-p-3', 'p-3'),
          makeGrade(4, 'primary', 't-p-4', 'p-4'),
          makeGrade(5, 'primary', 't-p-5', 'p-5'),
          makeGrade(6, 'primary', 't-p-6', 'p-6'),
          makeGrade(7, 'primary', 't-p-7', 'p-7'),
          makeGrade(8, 'primary', 't-p-8', 'p-8'),
          makeGrade(9, 'primary', 't-p-9', 'p-9'),
        ],
      },
      {
        track: 'gymnasium',
        grades: [
          makeGrade(10, 'gymnasium', 't-g-10', 'g-10'),
          makeGrade(11, 'gymnasium', 't-g-11', 'g-11'),
          makeGrade(12, 'gymnasium', 't-g-12', 'g-12'),
          makeGrade(13, 'gymnasium', 't-g-13', 'g-13'),
        ],
      },
      {
        track: 'gymnasium_elective',
        grades: [
          makeGrade(11, 'gymnasium_elective', 't-ge-11', 'ge-11'),
          makeGrade(12, 'gymnasium_elective', 't-ge-12', 'ge-12'),
          makeGrade(13, 'gymnasium_elective', 't-ge-13', 'ge-13'),
        ],
      },
      {
        track: 'vocational4',
        grades: [
          makeGrade(10, 'vocational4', 't-v4-10', 'v4-10'),
          makeGrade(11, 'vocational4', 't-v4-11', 'v4-11'),
          makeGrade(12, 'vocational4', 't-v4-12', 'v4-12'),
          makeGrade(13, 'vocational4', 't-v4-13', 'v4-13'),
        ],
      },
      {
        track: 'vocational3',
        grades: [
          makeGrade(10, 'vocational3', 't-v3-10', 'v3-10'),
          makeGrade(11, 'vocational3', 't-v3-11', 'v3-11'),
          makeGrade(12, 'vocational3', 't-v3-12', 'v3-12'),
        ],
      },
      {
        track: 'vocational2',
        grades: [
          makeGrade(10, 'vocational2', 't-v2-10', 'v2-10'),
          makeGrade(11, 'vocational2', 't-v2-11', 'v2-11'),
        ],
      },
    ],
  };
}

describe('validateCurriculumSnapshot', () => {
  it('returns ok=true for full valid snapshot', () => {
    const res = validateCurriculumSnapshot(validSnapshot());
    expect(res.ok).toBe(true);
    expect(res.errors).toEqual([]);
    expect(res.report.totalTracks).toBe(6);
  });

  it('returns schema issues for invalid payload', () => {
    const res = validateCurriculumSnapshot({ bad: true });
    expect(res.ok).toBe(false);
    expect(res.issues.length).toBeGreaterThan(0);
  });

  it('fails when concept IDs are duplicated', () => {
    const data = validSnapshot();
    data.tracks[1].grades[0].topics[0].concepts[0].id = 'p-1';

    const res = validateCurriculumSnapshot(data);
    expect(res.ok).toBe(false);
    expect(res.errors.some((e) => e.includes('Duplicate concept IDs found'))).toBe(true);
  });

  it('warns when a concept has no assessment standards', () => {
    const data = validSnapshot();
    data.tracks[0].grades[0].topics[0].concepts[0] = makeConcept('p-1', []);

    const res = validateCurriculumSnapshot(data);
    expect(res.ok).toBe(true);
    expect(res.warnings.some((w) => w.includes('has no assessment standards'))).toBe(true);
  });
});
