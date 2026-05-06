import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { validateCurriculumSnapshot } from '../src/features/curriculum/validateSnapshot.js';

async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.error('Usage: node scripts/validate-curriculum-snapshot.mjs <snapshot.json>');
    process.exit(1);
  }

  const absolutePath = path.resolve(process.cwd(), inputPath);
  const raw = await fs.readFile(absolutePath, 'utf8');
  const parsed = JSON.parse(raw);

  const result = validateCurriculumSnapshot(parsed);
  if (!result.report) {
    console.error('Validation failed before report generation.');
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  console.log('Curriculum Validation Report');
  console.log(JSON.stringify(result.report, null, 2));

  if (result.warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of result.warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (result.errors.length > 0) {
    console.error('\nErrors:');
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log('\nSnapshot is valid.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
