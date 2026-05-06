#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { parseCurriculumSnapshot } from '../src/features/curriculum/snapshotSchema.js';
import { adaptSnapshot } from '../src/features/curriculum/importAdapter.js';
import { buildCurriculumRagDocuments } from '../src/features/curriculum/ragDocuments.js';

const DEFAULT_NAMESPACE = 'makedotest';
const DEFAULT_BATCH_SIZE = 200;

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

async function postIndexBatch({ baseUrl, namespace, items }) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/rag/index`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ namespace, items }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.ok !== true) {
    const details = body?.error ? `: ${body.error}` : '';
    throw new Error(`Index request failed with HTTP ${response.status}${details}`);
  }

  return body;
}

async function main() {
  const [, , snapshotArg, namespaceArg, apiBaseArg] = process.argv;

  if (!snapshotArg) {
    console.error(
      'Usage: node scripts/ingest-curriculum-rag.mjs <snapshot.json> [namespace] [apiBaseUrl]',
    );
    process.exit(1);
  }

  const namespace = namespaceArg || process.env.VITE_RAG_DEFAULT_NAMESPACE || DEFAULT_NAMESPACE;
  const apiBaseUrl = apiBaseArg || process.env.VITE_RAG_API_BASE_URL;

  if (!apiBaseUrl) {
    console.error(
      'Missing API base URL. Pass [apiBaseUrl] or set VITE_RAG_API_BASE_URL in the environment.',
    );
    process.exit(1);
  }

  const snapshotPath = path.resolve(process.cwd(), snapshotArg);

  let rawSnapshot;
  try {
    const snapshotText = await fs.readFile(snapshotPath, 'utf8');
    rawSnapshot = JSON.parse(snapshotText);
  } catch (err) {
    console.error(`Failed to read or parse snapshot: ${err.message}`);
    process.exit(1);
  }

  let parsed;
  try {
    parsed = parseCurriculumSnapshot(rawSnapshot);
  } catch (err) {
    console.error('Snapshot validation failed.');
    console.error(err.message);
    process.exit(1);
  }

  const { conceptIndex } = adaptSnapshot(parsed.data);
  const docs = buildCurriculumRagDocuments(conceptIndex);

  if (docs.length === 0) {
    console.log('No curriculum concepts found. Nothing to ingest.');
    return;
  }

  const batches = chunk(docs, DEFAULT_BATCH_SIZE);
  let totalUpserted = 0;

  console.log(`Ingesting ${docs.length} documents in ${batches.length} batch(es)...`);
  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    const result = await postIndexBatch({
      baseUrl: apiBaseUrl,
      namespace,
      items: batch.map((doc) => ({ id: doc.id, text: doc.text, metadata: doc.metadata })),
    });
    totalUpserted += result.upserted ?? batch.length;
    console.log(`  Batch ${i + 1}/${batches.length} indexed (${batch.length} items)`);
  }

  console.log('Ingestion complete.');
  console.log(`  namespace: ${namespace}`);
  console.log(`  api:       ${apiBaseUrl}`);
  console.log(`  concepts:  ${docs.length}`);
  console.log(`  upserted:  ${totalUpserted}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
