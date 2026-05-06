import { analyzeAttempts } from './itemAnalysis';
import { summarizeBloomCoverage } from './bloom';
import { analyzeCohorts } from './cohortAnalysis';

function escapeHtml(input) {
  return String(input ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function fmt(n, digits = 2) {
  return Number.isFinite(n) ? n.toFixed(digits) : '0.00';
}

function nowStamp() {
  return new Date().toISOString().slice(0, 10);
}

export function buildParentPdfReportHtml({
  schoolName = 'MakedoTest School',
  testTitle = 'Assessment Report',
  attempts = [],
  questions = [],
} = {}) {
  const analytics = analyzeAttempts(attempts);
  const bloom = summarizeBloomCoverage(questions);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Parent Report</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; margin: 28px; }
    h1, h2 { margin: 0 0 8px; }
    .muted { color: #475569; font-size: 12px; margin-bottom: 16px; }
    .kpi { display: inline-block; min-width: 180px; margin: 6px 10px 6px 0; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
    .kpi .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; }
    .kpi .value { font-size: 20px; font-weight: 800; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; text-align: left; }
    th { background: #f1f5f9; }
  </style>
</head>
<body>
  <h1>Parent Progress Report</h1>
  <div class="muted">${escapeHtml(schoolName)} • ${escapeHtml(testTitle)} • Generated ${nowStamp()}</div>

  <div class="kpi"><div class="label">Attempts</div><div class="value">${analytics.cohort.n}</div></div>
  <div class="kpi"><div class="label">Average Score</div><div class="value">${fmt(analytics.cohort.mean)}%</div></div>
  <div class="kpi"><div class="label">Median Score</div><div class="value">${fmt(analytics.cohort.median)}%</div></div>

  <h2>Learning Focus (Bloom)</h2>
  <table>
    <thead><tr><th>Level</th><th>Count</th><th>Coverage</th></tr></thead>
    <tbody>
      <tr><td>Remember</td><td>${bloom.counts.remember}</td><td>${bloom.percentages.remember}%</td></tr>
      <tr><td>Understand</td><td>${bloom.counts.understand}</td><td>${bloom.percentages.understand}%</td></tr>
      <tr><td>Apply</td><td>${bloom.counts.apply}</td><td>${bloom.percentages.apply}%</td></tr>
      <tr><td>Analyze</td><td>${bloom.counts.analyze}</td><td>${bloom.percentages.analyze}%</td></tr>
      <tr><td>Evaluate</td><td>${bloom.counts.evaluate}</td><td>${bloom.percentages.evaluate}%</td></tr>
      <tr><td>Create</td><td>${bloom.counts.create}</td><td>${bloom.percentages.create}%</td></tr>
    </tbody>
  </table>

  <h2>Item Insights</h2>
  <table>
    <thead><tr><th>Question</th><th>Difficulty</th><th>Discrimination</th><th>p-value</th></tr></thead>
    <tbody>
      ${analytics.itemStats
        .slice(0, 12)
        .map(
          (it) =>
            `<tr><td>${escapeHtml(it.qid)}</td><td>${escapeHtml(it.difficulty)}</td><td>${escapeHtml(
              it.discriminationLabel
            )}</td><td>${fmt(it.pValue, 3)}</td></tr>`
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;
}

export function buildAdminPdfReportHtml({
  schoolName = 'MakedoTest School',
  testTitle = 'Assessment Report',
  attempts = [],
  questions = [],
} = {}) {
  const analytics = analyzeAttempts(attempts);
  const cohorts = analyzeCohorts(attempts);
  const bloom = summarizeBloomCoverage(questions);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Administration Report</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; margin: 28px; }
    h1, h2 { margin: 0 0 8px; }
    .muted { color: #475569; font-size: 12px; margin-bottom: 16px; }
    .kpis { display: grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap: 10px; margin-bottom: 12px; }
    .kpi { padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
    .kpi .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; }
    .kpi .value { font-size: 18px; font-weight: 800; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; text-align: left; }
    th { background: #f1f5f9; }
  </style>
</head>
<body>
  <h1>School Administration Report</h1>
  <div class="muted">${escapeHtml(schoolName)} • ${escapeHtml(testTitle)} • Generated ${nowStamp()}</div>

  <div class="kpis">
    <div class="kpi"><div class="label">Attempts</div><div class="value">${analytics.cohort.n}</div></div>
    <div class="kpi"><div class="label">Average</div><div class="value">${fmt(analytics.cohort.mean)}%</div></div>
    <div class="kpi"><div class="label">StdDev</div><div class="value">${fmt(analytics.cohort.stddev)}</div></div>
    <div class="kpi"><div class="label">Median</div><div class="value">${fmt(analytics.cohort.median)}%</div></div>
  </div>

  <h2>Cohort Breakdown (Grade x Semester)</h2>
  <table>
    <thead><tr><th>Grade</th><th>Semester</th><th>N</th><th>Mean</th><th>StdDev</th><th>Min</th><th>Max</th></tr></thead>
    <tbody>
      ${cohorts.rows
        .map(
          (row) =>
            `<tr><td>${escapeHtml(row.grade)}</td><td>${escapeHtml(row.semester)}</td><td>${row.n}</td><td>${fmt(
              row.mean
            )}%</td><td>${fmt(row.stddev)}</td><td>${fmt(row.min)}%</td><td>${fmt(row.max)}%</td></tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h2>Semester Delta (S2 - S1)</h2>
  <table>
    <thead><tr><th>Grade</th><th>S1 Mean</th><th>S2 Mean</th><th>Delta</th></tr></thead>
    <tbody>
      ${cohorts.semesterDeltaByGrade
        .map(
          (row) =>
            `<tr><td>${escapeHtml(row.grade)}</td><td>${fmt(row.s1Mean)}%</td><td>${fmt(
              row.s2Mean
            )}%</td><td>${row.delta >= 0 ? '+' : ''}${fmt(row.delta)}pp</td></tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h2>Bloom Coverage</h2>
  <table>
    <thead><tr><th>Level</th><th>Count</th><th>Coverage</th></tr></thead>
    <tbody>
      <tr><td>Remember</td><td>${bloom.counts.remember}</td><td>${bloom.percentages.remember}%</td></tr>
      <tr><td>Understand</td><td>${bloom.counts.understand}</td><td>${bloom.percentages.understand}%</td></tr>
      <tr><td>Apply</td><td>${bloom.counts.apply}</td><td>${bloom.percentages.apply}%</td></tr>
      <tr><td>Analyze</td><td>${bloom.counts.analyze}</td><td>${bloom.percentages.analyze}%</td></tr>
      <tr><td>Evaluate</td><td>${bloom.counts.evaluate}</td><td>${bloom.percentages.evaluate}%</td></tr>
      <tr><td>Create</td><td>${bloom.counts.create}</td><td>${bloom.percentages.create}%</td></tr>
    </tbody>
  </table>
</body>
</html>`;
}

export function openPrintableReport(html, title = 'Report') {
  if (typeof window === 'undefined') return false;
  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) return false;
  popup.document.open();
  popup.document.write(html);
  popup.document.title = title;
  popup.document.close();
  popup.focus();
  popup.print();
  return true;
}

export function exportParentPdfReport(input = {}) {
  return openPrintableReport(buildParentPdfReportHtml(input), 'Parent Report');
}

export function exportAdminPdfReport(input = {}) {
  return openPrintableReport(buildAdminPdfReportHtml(input), 'Administration Report');
}
