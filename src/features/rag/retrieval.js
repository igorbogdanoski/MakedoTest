/**
 * Deterministic ranking utility for vector-based retrieval.
 */
export function rankByEmbeddingSimilarity(queryEmbedding, candidates, options = {}) {
  const topK = Number(options.topK ?? 5);
  const minScore = Number(options.minScore ?? -1);

  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    throw new Error('queryEmbedding must be a non-empty numeric array');
  }
  if (!Array.isArray(candidates)) {
    throw new Error('candidates must be an array');
  }

  const scored = [];
  for (const item of candidates) {
    if (
      !item ||
      !Array.isArray(item.embedding) ||
      item.embedding.length !== queryEmbedding.length
    ) {
      continue;
    }

    const score = cosineSimilarity(queryEmbedding, item.embedding);
    if (score >= minScore) {
      scored.push({ ...item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(0, topK));
}

export function cosineSimilarity(a, b) {
  const len = a.length;
  if (len !== b.length || len === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i += 1) {
    const x = Number(a[i]);
    const y = Number(b[i]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
