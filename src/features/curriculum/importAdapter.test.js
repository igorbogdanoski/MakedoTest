import { describe, it, expect } from 'vitest';
import { adaptSnapshot } from './importAdapter.js';
import { parseCurriculumSnapshot } from './snapshotSchema.js';

// Minimal valid snapshot factory
function makeSnapshot(overrides = {}) {
  return parseCurriculumSnapshot({
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
          {
            id: 'grade-1',
            level: 1,
            title: 'I Одделение',
            weeklyHours: 3,
            topics: [
              {
                id: 'g1-t1',
                title: 'Геометрија',
                concepts: [
                  {
                    id: 'g1-c1',
                    title: 'Прости форми',
                    assessmentStandards: ['Препознава форми'],
                  },
                  {
                    id: 'g1-c2',
                    title: 'Бројување',
                    assessmentStandards: [],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        track: 'gymnasium',
        grades: [
          {
            id: 'grade-10',
            level: 10,
            title: 'I Гимназија',
            weeklyHours: 4,
            topics: [
              {
                id: 'g10-t1',
                title: 'Алгебра',
                concepts: [
                  {
                    id: 'g10-c1',
                    title: 'Множества',
                    assessmentStandards: ['Дефинира множество'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    ...overrides,
  }).data;
}

describe('adaptSnapshot', () => {
  it('builds gradeMap with correct level keys', () => {
    const snapshot = makeSnapshot();
    const { gradeMap } = adaptSnapshot(snapshot);

    expect(gradeMap.has(1)).toBe(true);
    expect(gradeMap.has(10)).toBe(true);

    const grade1Entries = gradeMap.get(1);
    expect(grade1Entries).toHaveLength(1);
    expect(grade1Entries[0].track).toBe('primary');
    expect(grade1Entries[0].gradeId).toBe('grade-1');
    expect(grade1Entries[0].level).toBe(1);
  });

  it('builds conceptIndex as flat list with all required fields', () => {
    const snapshot = makeSnapshot();
    const { conceptIndex } = adaptSnapshot(snapshot);

    // 2 concepts in primary grade 1 + 1 in gymnasium grade 10
    expect(conceptIndex).toHaveLength(3);

    const c1 = conceptIndex.find((c) => c.id === 'g1-c1');
    expect(c1).toBeDefined();
    expect(c1.title).toBe('Прости форми');
    expect(c1.description).toBe('Прости форми'); // alias
    expect(c1.assessmentStandards).toEqual(['Препознава форми']);
    expect(c1.topicId).toBe('g1-t1');
    expect(c1.gradeLevel).toBe(1);
    expect(c1.track).toBe('primary');
  });

  it('builds trackIndex with sorted grade labels per track', () => {
    const snapshot = makeSnapshot();
    const { trackIndex } = adaptSnapshot(snapshot);

    expect(trackIndex.get('primary')).toEqual(['Grade 1']);
    expect(trackIndex.get('gymnasium')).toEqual(['Grade 10']);
  });

  it('handles a concept with no assessmentStandards gracefully', () => {
    const snapshot = makeSnapshot();
    const { conceptIndex } = adaptSnapshot(snapshot);

    const c2 = conceptIndex.find((c) => c.id === 'g1-c2');
    expect(c2).toBeDefined();
    expect(c2.assessmentStandards).toEqual([]);
  });

  it('deduplicates grade levels within the same track', () => {
    const result = parseCurriculumSnapshot({
      version: '1',
      source: { repository: 'r', commitSha: 'abcdef1', extractedAt: '2026-01-01T00:00:00Z' },
      tracks: [
        {
          track: 'primary',
          grades: [
            {
              id: 'g1a',
              level: 1,
              title: 'G1a',
              topics: [{ id: 't1', title: 'T1', concepts: [{ id: 'c1', title: 'C1' }] }],
            },
            {
              id: 'g1b',
              level: 1,
              title: 'G1b',
              topics: [{ id: 't2', title: 'T2', concepts: [{ id: 'c2', title: 'C2' }] }],
            },
          ],
        },
      ],
    });
    const { gradeMap, trackIndex } = adaptSnapshot(result.data);

    // Both grade entries at level 1 should be present
    expect(gradeMap.get(1)).toHaveLength(2);
    // trackIndex should deduplicate — "Grade 1" should appear only once
    expect(trackIndex.get('primary')).toEqual(['Grade 1']);
  });
});
