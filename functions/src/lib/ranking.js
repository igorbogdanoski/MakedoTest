/**
 * Cosine similarity ranking — server-side copy of the frontend utility.
 * Kept here to avoid a cross-package dependency in the functions bundle.
 *
 * @param {number[]} queryEmbedding
 * @param {Array<{embedding: number[], [key: string]: unknown}>} candidates
 * @param {{ topK?: number, minScore?: number }} options
 * @returns {Array<{score: number, [key: string]: unknown}>}
 */
export function rankBySimilarity(queryEmbedding, candidates, options = {}) {
  const topK = Number(options.topK ?? 5);
  const minScore = Number(options.minScore ?? -1);

  const scored = [];
  for (const item of candidates) {
    if (!Array.isArray(item.embedding) || item.embedding.length !== queryEmbedding.length) {
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

function cosineSimilarity(a, b) {
  const len = a.length;
  if (len !== b.length || len === 0) return 0;
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
