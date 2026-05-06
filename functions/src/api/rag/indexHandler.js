/**
 * POST /api/rag/index
 *
 * Embeds a batch of text items and upserts them into the Firestore vector store.
 *
 * Request body:
 *   {
 *     namespace: string,
 *     items: [{ id: string, text: string, metadata?: object }]
 *   }
 *
 * Response 200:
 *   { ok: true, upserted: number }
 *
 * Response 400:
 *   { ok: false, error: string, issues?: [...] }
 *
 * Response 500:
 *   { ok: false, error: string }
 */

import { z } from 'zod';
import { validateBody } from '../../middleware/validateBody.js';
import { embedTexts } from '../../lib/embeddings.js';
import { upsertVectors } from '../../lib/vectorStore.js';

const MAX_ITEMS = 500;

const IndexRequestSchema = z.object({
  namespace: z.string().min(1).max(200),
  items: z
    .array(
      z.object({
        id: z.string().min(1).max(500),
        text: z.string().min(1).max(8000),
        metadata: z.record(z.unknown()).optional().default({}),
      })
    )
    .min(1)
    .max(MAX_ITEMS),
});

/**
 * Core handler logic (testable separately from Express wiring).
 *
 * @param {{ namespace: string, items: IndexRequestSchema['items'] }} body
 * @param {{ embedTexts: Function, upsertVectors: Function }} deps
 * @returns {Promise<{ ok: boolean, upserted?: number, error?: string }>}
 */
export async function handleIndex(body, deps = {}) {
  const embedFn = deps.embedTexts ?? embedTexts;
  const upsertFn = deps.upsertVectors ?? upsertVectors;

  const texts = body.items.map((it) => it.text);
  const embeddings = await embedFn(texts);

  if (embeddings.length !== body.items.length) {
    throw new Error(
      `Embedding count mismatch: expected ${body.items.length}, got ${embeddings.length}`
    );
  }

  const docs = body.items.map((item, i) => ({
    id: item.id,
    text: item.text,
    embedding: embeddings[i],
    metadata: item.metadata ?? {},
  }));

  const upserted = await upsertFn(body.namespace, docs);
  return { ok: true, upserted };
}

/**
 * Express route handler.
 * @type {import('express').RequestHandler[]}
 */
export const indexRouteHandlers = [
  validateBody(IndexRequestSchema),
  async (req, res) => {
    try {
      const result = await handleIndex(req.validatedBody);
      res.status(200).json(result);
    } catch (err) {
      console.error('[rag/index] Internal error:', err);
      res.status(500).json({ ok: false, error: 'Internal server error' });
    }
  },
];
