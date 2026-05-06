/**
 * Google AI Embeddings wrapper.
 *
 * Depends on GOOGLE_AI_API_KEY in the server environment.
 * Model is configurable via GOOGLE_AI_EMBEDDING_MODEL (default: gemini-embedding-001).
 *
 * Exports:
 *   embedTexts(texts: string[]): Promise<number[][]>
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = process.env.GOOGLE_AI_EMBEDDING_MODEL || 'gemini-embedding-001';

/**
 * Lazily initialised client — avoids crashing on import in test environments
 * where GOOGLE_AI_API_KEY is not set (tests mock this module).
 */
let _client = null;

function getClient() {
  if (!_client) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error(
        '[embeddings] GOOGLE_AI_API_KEY is not set. ' +
          'Set it in Firebase Functions environment config or Secret Manager.'
      );
    }
    _client = new GoogleGenerativeAI(apiKey);
  }
  return _client;
}

/**
 * Embed a batch of text strings.
 *
 * @param {string[]} texts
 * @returns {Promise<number[][]>}  One float32 vector per input text.
 */
export async function embedTexts(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    throw new Error('embedTexts requires a non-empty array of strings');
  }

  const model = getClient().getGenerativeModel({ model: MODEL_NAME });

  // Google AI SDK batches up to 100 texts per request.
  // Chunk into batches of 100 to stay within the limit.
  const BATCH_SIZE = 100;
  const allVectors = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const result = await model.batchEmbedContents({
      requests: batch.map((text) => ({
        content: { role: 'user', parts: [{ text }] },
        taskType: 'RETRIEVAL_DOCUMENT',
      })),
    });

    for (const embedding of result.embeddings) {
      allVectors.push(embedding.values);
    }
  }

  return allVectors;
}

/**
 * Embed a single query string.
 *
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embedQuery(text) {
  const model = getClient().getGenerativeModel({ model: MODEL_NAME });
  const result = await model.embedContent({
    content: { role: 'user', parts: [{ text }] },
    taskType: 'RETRIEVAL_QUERY',
  });
  return result.embedding.values;
}
