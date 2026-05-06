/**
 * Convert raw RAG matches into concise teacher-facing hint lines.
 */
export function buildRagPromptHints(matches = [], options = {}) {
  const limit = Number(options.limit ?? 3);
  const selected = Array.isArray(matches) ? matches.slice(0, Math.max(0, limit)) : [];

  return selected.map((item) => {
    const metadata = item?.metadata ?? {};
    const conceptTitle = metadata.conceptTitle || item?.id || 'Непознат концепт';
    const context = [
      metadata.topicTitle,
      Number.isFinite(metadata.gradeLevel) ? `Одд. ${metadata.gradeLevel}` : null,
      metadata.track,
    ].filter(Boolean);

    const firstStandard = Array.isArray(metadata.assessmentStandards)
      ? metadata.assessmentStandards.find(Boolean)
      : null;

    const parts = [conceptTitle];
    if (context.length) parts.push(context.join(' • '));
    if (firstStandard) parts.push(`Стандард: ${firstStandard}`);

    return parts.join(' — ');
  });
}

export function composeRagHintBlock(matches = [], options = {}) {
  const lines = buildRagPromptHints(matches, options);
  if (lines.length === 0) return '';
  return ['Насоки од наставна програма:', ...lines.map((line) => `- ${line}`)].join('\n');
}
