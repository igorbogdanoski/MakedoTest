import { describe, it, expect } from 'vitest';
import { buildReportArtifact, ARTIFACT_SCHEMA_VERSION } from './reportArtifact.js';

// Helper to build a single-grade track entry
function trackEntry(track, gradeId, level, conceptIds) {
  return {
    track,
    grades: [
      {
        id: gradeId,
        level,
        title: `Grade ${level}`,
        topics: [
          {
            id: `${gradeId}-t1`,
            title: 'Topic',
            concepts: conceptIds.map((id) => ({ id, title: `Concept ${id}` })),
          },
        ],
      },
    ],
  };
}

// Minimal valid snapshot that satisfies all-tracks requirement
const VALID_SNAPSHOT = {
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
                { id: 'g1-c1', title: 'Прости форми', assessmentStandards: ['Препознава'] },
                { id: 'g1-c2', title: 'Бројување' },
              ],
            },
          ],
        },
      ],
    },
    trackEntry('gymnasium', 'gym-10', 10, ['gym-c1']),
    trackEntry('gymnasium_elective', 'gymEl-11', 11, ['gymEl-c1']),
    trackEntry('vocational4', 'voc4-10', 10, ['voc4-c1']),
    trackEntry('vocational3', 'voc3-10', 10, ['voc3-c1']),
    trackEntry('vocational2', 'voc2-10', 10, ['voc2-c1']),
  ],
};

describe('buildReportArtifact', () => {
  it('returns a valid artifact with correct metadata from snapshot source', () => {
    const artifact = buildReportArtifact(VALID_SNAPSHOT, { generatedAt: '2026-05-06T12:00:00Z' });

    expect(artifact.type).toBe('curriculum-report');
    expect(artifact.schemaVersion).toBe(ARTIFACT_SCHEMA_VERSION);
    expect(artifact.generatedAt).toBe('2026-05-06T12:00:00Z');
    expect(artifact.snapshotVersion).toBe('2026-05-06');
    expect(artifact.commitSha).toBe('abcdef1234567');
    expect(artifact.repository).toBe('igorbogdanoski/math-curriculum-ai-navigator');
    expect(artifact.extractedAt).toBe('2026-05-06T00:00:00Z');
  });

  it('reports valid=true and correct counts for a valid snapshot', () => {
    const artifact = buildReportArtifact(VALID_SNAPSHOT);

    expect(artifact.valid).toBe(true);
    expect(artifact.totalTracks).toBe(6);
    expect(artifact.totalGrades).toBe(6);
    expect(artifact.totalConcepts).toBe(7); // 2 primary + 1 per each of 5 other tracks
    expect(artifact.errors).toHaveLength(0);
  });

  it('includes per-track coverage with concept counts', () => {
    const artifact = buildReportArtifact(VALID_SNAPSHOT);

    expect(artifact.trackCoverage).toHaveLength(6);
    const primary = artifact.trackCoverage.find((t) => t.track === 'primary');
    expect(primary).toBeDefined();
    expect(primary.presentLevels).toEqual([1]);
    expect(primary.gradeCount).toBe(1);
    expect(primary.conceptCount).toBe(2);
  });

  it('returns valid=false and falls back to unknown fields for invalid snapshot', () => {
    const artifact = buildReportArtifact({ not: 'a snapshot' });

    expect(artifact.valid).toBe(false);
    expect(artifact.errors.length).toBeGreaterThan(0);
    expect(artifact.totalTracks).toBe(0);
    expect(artifact.totalConcepts).toBe(0);
    expect(artifact.snapshotVersion).toBe('unknown');
    expect(artifact.commitSha).toBe('unknown');
  });

  it('returns valid=false for null input without throwing', () => {
    const artifact = buildReportArtifact(null);

    expect(artifact.valid).toBe(false);
    expect(artifact.errors.length).toBeGreaterThan(0);
    expect(artifact.snapshotVersion).toBe('unknown');
  });

  it('artifact is fully JSON-serialisable (no Maps/Sets)', () => {
    const artifact = buildReportArtifact(VALID_SNAPSHOT);
    expect(() => JSON.stringify(artifact)).not.toThrow();
    const roundTripped = JSON.parse(JSON.stringify(artifact));
    expect(roundTripped.type).toBe('curriculum-report');
    const primaryRt = roundTripped.trackCoverage.find((t) => t.track === 'primary');
    expect(primaryRt.conceptCount).toBe(2);
  });

  it('uses provided generatedAt over current date', () => {
    const fixed = '2000-01-01T00:00:00.000Z';
    const artifact = buildReportArtifact(VALID_SNAPSHOT, { generatedAt: fixed });
    expect(artifact.generatedAt).toBe(fixed);
  });
});
