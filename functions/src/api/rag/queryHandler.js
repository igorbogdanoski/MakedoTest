/**
 * POST /api/rag/query
 *
 * Embeds the query, retrieves top-k similar documents from the vector store,
 * and returns ranked matches.
 *
 * Request body:
 *   { namespace: string, query: string, topK?: number }
 *
 * Response 200:
 *   { ok: true, matches: [{ id, text, score, metadata }] }
 *
 * Response 400:
 *   { ok: false, error: string, issues?: [...] }
 *
 * Response 500:
 *   { ok: false, error: string }
 */

import { z } from 'zod';
import { validateBody } from '../../middleware/validateBody.js';
import { embedQuery } from '../../lib/embeddings.js';
import { fetchAllVectors } from '../../lib/vectorStore.js';
import { rankBySimilarity } from '../../lib/ranking.js';

const MAX_TOP_K = 20;

const QueryRequestSchema = z.object({
  namespace: z.string().min(1).max(200),
  query: z.string().min(1).max(2000),
  topK: z.number().int().min(1).max(MAX_TOP_K).default(5),
});

/**
 * Core handler logic (testable separately from Express wiring).
 *
 * @param {{ namespace: string, query: string, topK: number }} body
 * @param {{ embedQuery: Function, fetchAllVectors: Function }} deps
 * @returns {Promise<{ ok: boolean, matches?: object[], error?: string }>}
 */
export async function handleQuery(body, deps = {}) {
  const embedFn = deps.embedQuery ?? embedQuery;
  const fetchFn = deps.fetchAllVectors ?? fetchAllVectors;

  const [queryEmbedding, candidates] = await Promise.all([
    embedFn(body.query),
    fetchFn(body.namespace),
  ]);

  const ranked = rankBySimilarity(queryEmbedding, candidates, { topK: body.topK });

  const matches = ranked.map(({ id, text, score, metadata }) => ({
    id,
    text,
    score,
    metadata: metadata ?? {},
  }));

  return { ok: true, matches };
}

/**
 * Express route handler.
 * @type {import('express').RequestHandler[]}
 */
export const queryRouteHandlers = [
  validateBody(QueryRequestSchema),
  async (req, res) => {
    try {
      const result = await handleQuery(req.validatedBody);
      res.status(200).json(result);
    } catch (err) {
      console.error('[rag/query] Internal error:', err);
      res.status(500).json({ ok: false, error: 'Internal server error' });
    }
  },
];
