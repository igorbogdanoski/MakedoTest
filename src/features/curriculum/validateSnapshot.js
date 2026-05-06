import { TRACKS, parseCurriculumSnapshot } from './snapshotSchema.js';

const EXPECTED_LEVELS = {
  primary: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  gymnasium: [10, 11, 12, 13],
  gymnasium_elective: [11, 12, 13],
  vocational4: [10, 11, 12, 13],
  vocational3: [10, 11, 12],
  vocational2: [10, 11],
};

export function validateCurriculumSnapshot(input) {
  const parsed = parseCurriculumSnapshot(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: ['Snapshot schema validation failed.'],
      issues: parsed.error.issues,
      report: null,
    };
  }

  const snapshot = parsed.data;
  const errors = [];
  const warnings = [];
  const conceptIds = new Set();
  const duplicateConceptIds = new Set();
  const trackCoverage = {};

  for (const requiredTrack of TRACKS) {
    if (!snapshot.tracks.some((t) => t.track === requiredTrack)) {
      errors.push(`Missing required track: ${requiredTrack}`);
    }
  }

  for (const track of snapshot.tracks) {
    const levels = track.grades.map((g) => g.level).sort((a, b) => a - b);
    const uniqueLevels = [...new Set(levels)];
    trackCoverage[track.track] = uniqueLevels;

    const expectedLevels = EXPECTED_LEVELS[track.track] || [];
    const missingLevels = expectedLevels.filter((lvl) => !uniqueLevels.includes(lvl));
    if (missingLevels.length > 0) {
      warnings.push(`Track ${track.track} missing levels: ${missingLevels.join(', ')}`);
    }

    for (const grade of track.grades) {
      for (const topic of grade.topics) {
        if (topic.concepts.length === 0) {
          errors.push(`Empty concepts list in grade ${grade.level}, topic ${topic.id}`);
        }

        for (const concept of topic.concepts) {
          if (conceptIds.has(concept.id)) {
            duplicateConceptIds.add(concept.id);
          }
          conceptIds.add(concept.id);

          if (!concept.assessmentStandards || concept.assessmentStandards.length === 0) {
            warnings.push(`Concept ${concept.id} has no assessment standards.`);
          }
        }
      }
    }
  }

  if (duplicateConceptIds.size > 0) {
    errors.push(
      `Duplicate concept IDs found: ${Array.from(duplicateConceptIds).sort().join(', ')}`
    );
  }

  const report = {
    source: snapshot.source,
    totalTracks: snapshot.tracks.length,
    totalGrades: snapshot.tracks.reduce((sum, t) => sum + t.grades.length, 0),
    totalConcepts: conceptIds.size,
    trackCoverage,
    errorsCount: errors.length,
    warningsCount: warnings.length,
  };

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    issues: [],
    report,
  };
}
