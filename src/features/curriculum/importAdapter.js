/**
 * Phase A.2 – Curriculum Snapshot Import Adapter
 *
 * Transforms a validated CurriculumSnapshot into three MakedoTest-internal
 * lookup structures used by the editor and the RAG ingestion pipeline.
 *
 * @typedef {Object} AdaptedCurriculum
 * @property {Map<number, GradeEntry[]>} gradeMap   – gradeLevel → list of entries
 *   (a grade may appear in multiple tracks)
 * @property {ConceptEntry[]}            conceptIndex – flat list; one entry per concept
 * @property {Map<string, string[]>}     trackIndex   – track → sorted grade-level labels
 */

/**
 * @typedef {Object} GradeEntry
 * @property {string}   track
 * @property {string}   gradeId
 * @property {string}   gradeTitle
 * @property {number}   level
 * @property {import('./snapshotSchema.js').TopicSchema[]} topics
 */

/**
 * @typedef {Object} ConceptEntry
 * @property {string}   id
 * @property {string}   title
 * @property {string}   description   – alias for title; kept for RAG chunking compat
 * @property {string[]} assessmentStandards
 * @property {string}   topicId
 * @property {string}   topicTitle
 * @property {string}   gradeId
 * @property {number}   gradeLevel
 * @property {string}   track
 */

/**
 * Convert a validated CurriculumSnapshot into MakedoTest-internal structures.
 *
 * @param {import('./snapshotSchema.js').CurriculumSnapshotSchema} snapshot
 *   Must be a successfully parsed snapshot (not the raw safeParse wrapper).
 * @returns {AdaptedCurriculum}
 */
export function adaptSnapshot(snapshot) {
  /** @type {Map<number, GradeEntry[]>} */
  const gradeMap = new Map();

  /** @type {ConceptEntry[]} */
  const conceptIndex = [];

  /** @type {Map<string, number[]>} */
  const trackLevels = new Map();

  for (const trackSnapshot of snapshot.tracks) {
    const { track, grades } = trackSnapshot;

    for (const grade of grades) {
      const { id: gradeId, level, title: gradeTitle, topics } = grade;

      // -- gradeMap ----------------------------------------------------------
      const entry = { track, gradeId, gradeTitle, level, topics };
      if (!gradeMap.has(level)) {
        gradeMap.set(level, []);
      }
      gradeMap.get(level).push(entry);

      // -- trackLevels (for trackIndex) --------------------------------------
      if (!trackLevels.has(track)) {
        trackLevels.set(track, []);
      }
      trackLevels.get(track).push(level);

      // -- conceptIndex ------------------------------------------------------
      for (const topic of topics) {
        for (const concept of topic.concepts) {
          conceptIndex.push({
            id: concept.id,
            title: concept.title,
            description: concept.title,
            assessmentStandards: concept.assessmentStandards ?? [],
            topicId: topic.id,
            topicTitle: topic.title,
            gradeId,
            gradeLevel: level,
            track,
          });
        }
      }
    }
  }

  // trackIndex: track → sorted unique grade-level labels ("Grade 1", …)
  /** @type {Map<string, string[]>} */
  const trackIndex = new Map();
  for (const [track, levels] of trackLevels.entries()) {
    const sorted = [...new Set(levels)].sort((a, b) => a - b);
    trackIndex.set(
      track,
      sorted.map((l) => `Grade ${l}`)
    );
  }

  return { gradeMap, conceptIndex, trackIndex };
}
