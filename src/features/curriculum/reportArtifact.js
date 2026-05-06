/**
 * Phase A.3 - Curriculum Report Artifact
 *
 * Generates a structured, serialisable audit artifact from a raw snapshot
 * input. The artifact is JSON-serialisable (no Maps/Sets) so it can be stored
 * in Firestore, shipped to the frontend, or ingested by the RAG metadata layer.
 */

import { parseCurriculumSnapshot } from './snapshotSchema.js';
import { validateCurriculumSnapshot } from './validateSnapshot.js';
import { adaptSnapshot } from './importAdapter.js';

export const ARTIFACT_SCHEMA_VERSION = '1';

/**
 * Build a CurriculumReportArtifact from raw (unparsed) snapshot input.
 *
 * @param {unknown} rawSnapshot
 * @param {{ generatedAt?: string }} [opts]
 * @returns {import('./reportArtifact.js').CurriculumReportArtifact}
 */
export function buildReportArtifact(rawSnapshot, opts = {}) {
  const generatedAt = opts.generatedAt ?? new Date().toISOString();

  const baseFields = {
    type: 'curriculum-report',
    schemaVersion: ARTIFACT_SCHEMA_VERSION,
    generatedAt,
    snapshotVersion: rawSnapshot?.version ?? 'unknown',
    commitSha: rawSnapshot?.source?.commitSha ?? 'unknown',
    repository: rawSnapshot?.source?.repository ?? 'unknown',
    extractedAt: rawSnapshot?.source?.extractedAt ?? 'unknown',
  };

  const validation = validateCurriculumSnapshot(rawSnapshot);

  if (!validation.ok || !validation.report) {
    return {
      ...baseFields,
      valid: false,
      totalTracks: 0,
      totalGrades: 0,
      totalConcepts: 0,
      trackCoverage: [],
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  // Re-parse to get typed snapshot for adaptSnapshot (pure, cheap on valid data).
  const parsed = parseCurriculumSnapshot(rawSnapshot);
  const { conceptIndex } = adaptSnapshot(parsed.data);

  /** @type {Map<string, number>} */
  const conceptsByTrack = new Map();
  for (const entry of conceptIndex) {
    conceptsByTrack.set(entry.track, (conceptsByTrack.get(entry.track) ?? 0) + 1);
  }

  const trackCoverage = Object.entries(validation.report.trackCoverage).map(
    ([track, presentLevels]) => ({
      track,
      presentLevels,
      gradeCount: presentLevels.length,
      conceptCount: conceptsByTrack.get(track) ?? 0,
    })
  );

  return {
    ...baseFields,
    valid: true,
    totalTracks: validation.report.totalTracks,
    totalGrades: validation.report.totalGrades,
    totalConcepts: validation.report.totalConcepts,
    trackCoverage,
    errors: validation.errors,
    warnings: validation.warnings,
  };
}
