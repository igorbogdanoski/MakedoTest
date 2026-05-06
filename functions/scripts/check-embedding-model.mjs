#!/usr/bin/env node

import process from 'node:process';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_AI_API_KEY;
const model = process.env.GOOGLE_AI_EMBEDDING_MODEL || 'gemini-embedding-001';

if (!apiKey) {
  console.error('Missing GOOGLE_AI_API_KEY in environment.');
  process.exit(1);
}

async function main() {
  const client = new GoogleGenerativeAI(apiKey);
  const embeddingModel = client.getGenerativeModel({ model });

  const response = await embeddingModel.embedContent({
    content: { role: 'user', parts: [{ text: 'Model preflight for MakedoTest RAG.' }] },
    taskType: 'RETRIEVAL_QUERY',
  });

  const dims = response?.embedding?.values?.length || 0;
  if (!dims) {
    throw new Error('Embedding response did not contain vector values.');
  }

  console.log(`Embedding model OK: ${model}`);
  console.log(`Vector dimensions: ${dims}`);
}

main().catch((err) => {
  console.error(`Embedding model preflight failed for ${model}.`);
  console.error(err?.message || err);
  process.exit(1);
});
