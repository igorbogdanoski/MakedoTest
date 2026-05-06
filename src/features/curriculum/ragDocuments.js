/**
 * Build RAG-ready documents from adapted curriculum concept entries.
 *
 * Input is the flat `conceptIndex` produced by `adaptSnapshot`.
 */

/**
 * @typedef {import('./importAdapter.js').ConceptEntry} ConceptEntry
 */

/**
 * @typedef {Object} RagDocument
 * @property {string} id
 * @property {string} text
 * @property {Record<string, unknown>} metadata
 */

/**
 * Convert concept entries to indexable RAG documents.
 *
 * @param {ConceptEntry[]} conceptIndex
 * @returns {RagDocument[]}
 */
export function buildCurriculumRagDocuments(conceptIndex) {
  if (!Array.isArray(conceptIndex)) {
    throw new Error('buildCurriculumRagDocuments expects an array');
  }

  return conceptIndex.map((concept) => {
    const standards = Array.isArray(concept.assessmentStandards)
      ? concept.assessmentStandards.filter(Boolean)
      : [];

    const standardsBlock =
      standards.length > 0
        ? `Assessment standards:\n- ${standards.join('\n- ')}`
        : 'Assessment standards: none specified';

    const text = [
      `Track: ${concept.track}`,
      `Grade: ${concept.gradeLevel}`,
      `Topic: ${concept.topicTitle}`,
      `Concept: ${concept.title}`,
      standardsBlock,
    ].join('\n');

    return {
      id: concept.id,
      text,
      metadata: {
        source: 'curriculum-concept',
        conceptId: concept.id,
        conceptTitle: concept.title,
        topicId: concept.topicId,
        topicTitle: concept.topicTitle,
        gradeId: concept.gradeId,
        gradeLevel: concept.gradeLevel,
        track: concept.track,
        assessmentStandards: standards,
      },
    };
  });
}
