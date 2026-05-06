#!/usr/bin/env node
/**
 * generate-curriculum-report.mjs
 *
 * Reads a curriculum snapshot JSON file, validates it, builds a
 * CurriculumReportArtifact, and writes it to disk.
 *
 * Usage:
 *   node scripts/generate-curriculum-report.mjs <snapshot.json> [output.json]
 *
 * If [output.json] is omitted, the report is written next to the snapshot
 * file with the suffix "-report.json".
 *
 * Exit code 0  – valid snapshot, report written.
 * Exit code 1  – invalid snapshot or I/O error; report still written so the
 *                artifact is available for debugging.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { buildReportArtifact } from '../src/features/curriculum/reportArtifact.js';

async function main() {
  const [, , inputArg, outputArg] = process.argv;

  if (!inputArg) {
    console.error(
      'Usage: node scripts/generate-curriculum-report.mjs <snapshot.json> [output.json]',
    );
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), inputArg);
  const defaultOutput = inputPath.replace(/\.json$/, '-report.json');
  const outputPath = outputArg ? path.resolve(process.cwd(), outputArg) : defaultOutput;

  let rawSnapshot;
  try {
    const text = await fs.readFile(inputPath, 'utf8');
    rawSnapshot = JSON.parse(text);
  } catch (err) {
    console.error(`Failed to read/parse snapshot: ${err.message}`);
    process.exit(1);
  }

  const artifact = buildReportArtifact(rawSnapshot);

  // Ensure output directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(artifact, null, 2) + '\n', 'utf8');

  console.log(`Report written → ${outputPath}`);
  console.log(`  valid:         ${artifact.valid}`);
  console.log(`  tracks:        ${artifact.totalTracks}`);
  console.log(`  grades:        ${artifact.totalGrades}`);
  console.log(`  concepts:      ${artifact.totalConcepts}`);
  console.log(`  errors:        ${artifact.errors.length}`);
  console.log(`  warnings:      ${artifact.warnings.length}`);

  if (!artifact.valid) {
    console.error('\nErrors:');
    for (const e of artifact.errors) {
      console.error(`  - ${e}`);
    }
    process.exit(1);
  }

  if (artifact.warnings.length > 0) {
    console.warn('\nWarnings:');
    for (const w of artifact.warnings) {
      console.warn(`  - ${w}`);
    }
  }
}

main();
