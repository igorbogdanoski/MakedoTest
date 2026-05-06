import { analyzeAttempts } from './itemAnalysis';
import { summarizeBloomCoverage } from './bloom';
import { analyzeCohorts } from './cohortAnalysis';

function toNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function scoreParts(attempt) {
  const total = Number.isFinite(attempt.totalScore)
    ? attempt.totalScore
    : (attempt.items || []).reduce((s, it) => s + toNumber(it.earned), 0);
  const max = Number.isFinite(attempt.maxScore)
    ? attempt.maxScore
    : (attempt.items || []).reduce((s, it) => s + toNumber(it.max), 0);
  const percent = max > 0 ? (total / max) * 100 : 0;
  return { total, max, percent };
}

function getGrade(attempt) {
  const raw = attempt.gradeLevel ?? attempt.grade ?? attempt.metadata?.gradeLevel;
  return raw === undefined || raw === null || raw === '' ? 'N/A' : String(raw);
}

function getSemester(attempt) {
  const raw = attempt.semester ?? attempt.metadata?.semester;
  return raw === undefined || raw === null || raw === '' ? 'N/A' : String(raw).toUpperCase();
}

function escapeCsvCell(value) {
  const raw = String(value ?? '');
  const escaped = raw.replaceAll('"', '""');
  if (/[",\n]/.test(raw)) return `"${escaped}"`;
  return escaped;
}

export function rowsToCsv(rows = [], headers = []) {
  const head = headers.map((h) => escapeCsvCell(h.label)).join(',');
  const body = rows
    .map((row) => headers.map((h) => escapeCsvCell(row[h.key])).join(','))
    .join('\n');
  return `\uFEFF${head}${body ? `\n${body}` : ''}`;
}

export function rowsToTsv(rows = [], headers = []) {
  const head = headers.map((h) => String(h.label)).join('\t');
  const body = rows
    .map((row) =>
      headers
        .map((h) =>
          String(row[h.key] ?? '')
            .replaceAll('\t', ' ')
            .replaceAll('\n', ' ')
        )
        .join('\t')
    )
    .join('\n');
  return `${head}${body ? `\n${body}` : ''}`;
}

export function buildEJournalRows(attempts = []) {
  return (attempts || []).map((attempt) => {
    const { total, max, percent } = scoreParts(attempt);
    return {
      studentId: attempt.studentId || 'unknown',
      grade: getGrade(attempt),
      semester: getSemester(attempt),
      totalScore: total.toFixed(2),
      maxScore: max.toFixed(2),
      percent: percent.toFixed(2),
    };
  });
}

export function buildSpreadsheetArtifacts({ attempts = [], questions = [] } = {}) {
  const analytics = analyzeAttempts(attempts);
  const cohorts = analyzeCohorts(attempts);
  const bloom = summarizeBloomCoverage(questions);
  const journalRows = buildEJournalRows(attempts);

  const journalHeaders = [
    { key: 'studentId', label: 'Student ID' },
    { key: 'grade', label: 'Grade' },
    { key: 'semester', label: 'Semester' },
    { key: 'totalScore', label: 'Total Score' },
    { key: 'maxScore', label: 'Max Score' },
    { key: 'percent', label: 'Percent' },
  ];

  const itemRows = analytics.itemStats.map((row) => ({
    qid: row.qid,
    pValue: row.pValue,
    difficulty: row.difficulty,
    discrimination: row.discrimination,
    discriminationLabel: row.discriminationLabel,
    mean: row.mean,
    stddev: row.stddev,
  }));

  const itemHeaders = [
    { key: 'qid', label: 'QID' },
    { key: 'pValue', label: 'p-value' },
    { key: 'difficulty', label: 'Difficulty' },
    { key: 'discrimination', label: 'Discrimination' },
    { key: 'discriminationLabel', label: 'Discrimination Label' },
    { key: 'mean', label: 'Mean' },
    { key: 'stddev', label: 'StdDev' },
  ];

  const cohortRows = cohorts.rows.map((row) => ({
    grade: row.grade,
    semester: row.semester,
    n: row.n,
    mean: row.mean,
    stddev: row.stddev,
    min: row.min,
    max: row.max,
  }));

  const cohortHeaders = [
    { key: 'grade', label: 'Grade' },
    { key: 'semester', label: 'Semester' },
    { key: 'n', label: 'N' },
    { key: 'mean', label: 'Mean' },
    { key: 'stddev', label: 'StdDev' },
    { key: 'min', label: 'Min' },
    { key: 'max', label: 'Max' },
  ];

  const bloomRows = [
    ['remember', bloom.counts.remember, bloom.percentages.remember],
    ['understand', bloom.counts.understand, bloom.percentages.understand],
    ['apply', bloom.counts.apply, bloom.percentages.apply],
    ['analyze', bloom.counts.analyze, bloom.percentages.analyze],
    ['evaluate', bloom.counts.evaluate, bloom.percentages.evaluate],
    ['create', bloom.counts.create, bloom.percentages.create],
  ].map(([level, count, coverage]) => ({ level, count, coverage }));

  const bloomHeaders = [
    { key: 'level', label: 'Bloom Level' },
    { key: 'count', label: 'Count' },
    { key: 'coverage', label: 'Coverage %' },
  ];

  return {
    journalCsv: rowsToCsv(journalRows, journalHeaders),
    journalTsv: rowsToTsv(journalRows, journalHeaders),
    itemCsv: rowsToCsv(itemRows, itemHeaders),
    cohortCsv: rowsToCsv(cohortRows, cohortHeaders),
    bloomCsv: rowsToCsv(bloomRows, bloomHeaders),
  };
}

export function downloadCsvFile(content, filename) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

export function exportAnalyticsCsvBundle(input = {}) {
  const artifacts = buildSpreadsheetArtifacts(input);
  const ok1 = downloadCsvFile(artifacts.journalCsv, 'analytics-ejournal.csv');
  const ok2 = downloadCsvFile(artifacts.itemCsv, 'analytics-item-analysis.csv');
  const ok3 = downloadCsvFile(artifacts.cohortCsv, 'analytics-cohorts.csv');
  const ok4 = downloadCsvFile(artifacts.bloomCsv, 'analytics-bloom.csv');
  return ok1 && ok2 && ok3 && ok4;
}

export async function copyEJournalForGoogleSheets(input = {}) {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return false;
  const artifacts = buildSpreadsheetArtifacts(input);
  await navigator.clipboard.writeText(artifacts.journalTsv);
  return true;
}
