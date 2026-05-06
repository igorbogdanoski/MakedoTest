import React, { useMemo } from 'react';
import { analyzeAttempts } from './itemAnalysis';
import { BLOOM_LEVELS, inferBloomLevel, summarizeBloomCoverage } from './bloom';
import { analyzeCohorts } from './cohortAnalysis';
import { exportAdminPdfReport, exportParentPdfReport } from './pdfReports';
import { copyEJournalForGoogleSheets, exportAnalyticsCsvBundle } from './spreadsheetExport';
import { buildRagQualityRecords, summarizeRagQuality } from './ragQuality';

function fmt(n) {
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

export function buildDemoAttemptsFromQuestions(questions = [], count = 24) {
  const scored = (questions || []).filter((q) => q.type !== 'section');
  if (scored.length === 0) return [];

  return Array.from({ length: count }).map((_, idx) => {
    const items = scored.map((q) => {
      const max = Number.isFinite(q.points) ? q.points : 1;
      const base = q.difficulty === 'hard' ? 0.5 : q.difficulty === 'easy' ? 0.82 : 0.68;
      const noise = ((idx * 37 + (q.id?.length || 1) * 13) % 100) / 100;
      const ratio = Math.max(0, Math.min(1, base * 0.7 + noise * 0.3));
      const earned = Math.round(ratio * max * 100) / 100;
      return { qid: q.id || `q-${idx}`, earned, max };
    });

    const totalScore = items.reduce((s, it) => s + it.earned, 0);
    const maxScore = items.reduce((s, it) => s + it.max, 0);

    return {
      studentId: `demo-${idx + 1}`,
      totalScore,
      maxScore,
      items,
      gradeLevel: 7 + (idx % 3),
      semester: idx % 2 === 0 ? 'S1' : 'S2',
    };
  });
}

const BLOOM_LABELS = {
  remember: 'Remember',
  understand: 'Understand',
  apply: 'Apply',
  analyze: 'Analyze',
  evaluate: 'Evaluate',
  create: 'Create',
};

export default function TeacherAnalyticsPanel({
  attempts = [],
  questions = [],
  onSetBloom,
  onSetRagFeedback,
}) {
  const data = useMemo(() => analyzeAttempts(attempts), [attempts]);
  const cohort = useMemo(() => analyzeCohorts(attempts), [attempts]);
  const bloom = useMemo(() => summarizeBloomCoverage(questions), [questions]);
  const scoredQuestions = useMemo(
    () => (questions || []).filter((q) => q.type !== 'section'),
    [questions]
  );
  const ragRecords = useMemo(() => buildRagQualityRecords(questions), [questions]);
  const ragSummary = useMemo(() => summarizeRagQuality(ragRecords), [ragRecords]);

  const applyAutoBloom = () => {
    if (!onSetBloom) return;
    scoredQuestions.forEach((q) => onSetBloom(q.id, inferBloomLevel(q)));
  };

  const handleExportParentReport = () => {
    exportParentPdfReport({
      schoolName: 'MakedoTest School',
      testTitle: 'Teacher Analytics Snapshot',
      attempts,
      questions,
    });
  };

  const handleExportAdminReport = () => {
    exportAdminPdfReport({
      schoolName: 'MakedoTest School',
      testTitle: 'Teacher Analytics Snapshot',
      attempts,
      questions,
    });
  };

  const handleExportExcel = () => {
    exportAnalyticsCsvBundle({ attempts, questions });
  };

  const handleCopySheets = async () => {
    await copyEJournalForGoogleSheets({ attempts, questions });
  };

  if (!attempts.length) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Teacher Analytics</h2>
        <p className="mt-2 text-sm text-slate-500">Нема доволно обиди за аналитика.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-black uppercase text-slate-400">Обиди</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{data.cohort.n}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-black uppercase text-slate-400">Просек</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{fmt(data.cohort.mean)}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-black uppercase text-slate-400">StdDev</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{fmt(data.cohort.stddev)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-black uppercase text-slate-400">Медијана</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{fmt(data.cohort.median)}%</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleExportParentReport}
          className="rounded-xl border border-sky-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-sky-700 transition hover:bg-sky-50"
        >
          PDF Parent Report
        </button>
        <button
          type="button"
          onClick={handleExportAdminReport}
          className="rounded-xl border border-violet-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-violet-700 transition hover:bg-violet-50"
        >
          PDF Admin Report
        </button>
        <button
          type="button"
          onClick={handleExportExcel}
          className="rounded-xl border border-emerald-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-700 transition hover:bg-emerald-50"
        >
          Excel CSV Export
        </button>
        <button
          type="button"
          onClick={handleCopySheets}
          className="rounded-xl border border-amber-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-amber-700 transition hover:bg-amber-50"
        >
          Copy for Google Sheets
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
          Дистрибуција (децили)
        </h3>
        <div className="mt-4 grid grid-cols-10 items-end gap-2">
          {data.cohort.distribution.map((v, i) => {
            const max = Math.max(...data.cohort.distribution, 1);
            const h = Math.max(8, Math.round((v / max) * 84));
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-full rounded-t bg-indigo-500" style={{ height: `${h}px` }} />
                <span className="text-[10px] font-black text-slate-400">{i * 10}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
            Bloom coverage
          </h3>
          <button
            type="button"
            onClick={applyAutoBloom}
            disabled={!onSetBloom || scoredQuestions.length === 0}
            className="rounded-xl border border-indigo-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Auto suggest all
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {BLOOM_LEVELS.map((level) => (
            <div key={level} className="rounded-2xl border border-slate-100 p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500">
                <span>{BLOOM_LABELS[level]}</span>
                <span>
                  {bloom.counts[level]} • {bloom.percentages[level]}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${bloom.percentages[level]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
          Cognitive mapping
        </h3>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2">QID</th>
                <th className="py-2">Type</th>
                <th className="py-2">Recommended</th>
                <th className="py-2">Current</th>
              </tr>
            </thead>
            <tbody>
              {scoredQuestions.map((q) => {
                const recommended = inferBloomLevel(q);
                const current = q.bloomLevel || recommended;
                return (
                  <tr key={q.id} className="border-b border-slate-50">
                    <td className="py-2 font-mono text-xs text-slate-700">{q.id}</td>
                    <td className="py-2 text-slate-600">{q.type}</td>
                    <td className="py-2 text-slate-700">{BLOOM_LABELS[recommended]}</td>
                    <td className="py-2">
                      {onSetBloom ? (
                        <select
                          value={current}
                          onChange={(e) => onSetBloom(q.id, e.target.value)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700"
                        >
                          {BLOOM_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {BLOOM_LABELS[level]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-700">{BLOOM_LABELS[current]}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
          Cohort analysis (grade x semester)
        </h3>

        {cohort.rows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Нема cohort metadata во обидите.</p>
        ) : (
          <>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  Strongest
                </p>
                <p className="mt-1 text-sm font-black text-emerald-900">
                  Grade {cohort.strongest?.grade} / {cohort.strongest?.semester}
                </p>
                <p className="text-xs text-emerald-800">Mean: {fmt(cohort.strongest?.mean)}%</p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-700">
                  Needs support
                </p>
                <p className="mt-1 text-sm font-black text-rose-900">
                  Grade {cohort.weakest?.grade} / {cohort.weakest?.semester}
                </p>
                <p className="text-xs text-rose-800">Mean: {fmt(cohort.weakest?.mean)}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                  Semester trend
                </p>
                {cohort.semesterDeltaByGrade.length ? (
                  <div className="mt-1 space-y-1 text-xs text-slate-700">
                    {cohort.semesterDeltaByGrade.map((row) => (
                      <p key={row.grade}>
                        Grade {row.grade}: S2-S1 {row.delta >= 0 ? '+' : ''}
                        {fmt(row.delta)}pp
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">Недостигаат S1/S2 парови.</p>
                )}
              </div>
            </div>

            <div className="mt-4 overflow-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="py-2">Grade</th>
                    <th className="py-2">Semester</th>
                    <th className="py-2">N</th>
                    <th className="py-2">Mean</th>
                    <th className="py-2">StdDev</th>
                    <th className="py-2">Min</th>
                    <th className="py-2">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {cohort.rows.map((row) => (
                    <tr key={`${row.grade}-${row.semester}`} className="border-b border-slate-50">
                      <td className="py-2 text-slate-700">{row.grade}</td>
                      <td className="py-2 text-slate-700">{row.semester}</td>
                      <td className="py-2 text-slate-700">{row.n}</td>
                      <td className="py-2 font-black text-slate-900">{fmt(row.mean)}%</td>
                      <td className="py-2 text-slate-700">{fmt(row.stddev)}</td>
                      <td className="py-2 text-slate-700">{fmt(row.min)}%</td>
                      <td className="py-2 text-slate-700">{fmt(row.max)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
          RAG quality dashboard
        </h3>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Avg latency
            </p>
            <p className="mt-1 text-xl font-black text-slate-900">{ragSummary.avgLatencyMs}ms</p>
            <p className="text-xs text-slate-500">P95: {ragSummary.p95LatencyMs}ms</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Citation coverage
            </p>
            <p className="mt-1 text-xl font-black text-slate-900">
              {ragSummary.citationCoveragePct}%
            </p>
            <p className="text-xs text-slate-500">Used / Retrieved citations</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Hallucination sampling
            </p>
            <p className="mt-1 text-xl font-black text-slate-900">
              {ragSummary.hallucinationRatePct}%
            </p>
            <p className="text-xs text-slate-500">
              Flagged samples: {ragSummary.flaggedSamples.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Teacher feedback
            </p>
            <p className="mt-1 text-sm font-black text-slate-900">
              Helpful {ragSummary.feedbackCounts.helpful} • Not helpful{' '}
              {ragSummary.feedbackCounts['not-helpful']}
            </p>
            <p className="text-xs text-slate-500">
              Unreviewed {ragSummary.feedbackCounts.unreviewed} • Flagged{' '}
              {ragSummary.feedbackCounts.flagged}
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2">QID</th>
                <th className="py-2">Latency</th>
                <th className="py-2">Citations</th>
                <th className="py-2">Hallucination</th>
                <th className="py-2">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {ragRecords.map((row) => (
                <tr key={row.questionId} className="border-b border-slate-50">
                  <td className="py-2 font-mono text-xs text-slate-700">{row.questionId}</td>
                  <td className="py-2 text-slate-700">{row.latencyMs}ms</td>
                  <td className="py-2 text-slate-700">
                    {row.citationsUsed}/{row.citationsRetrieved}
                  </td>
                  <td className="py-2 text-slate-700">
                    {row.hallucinationFlag ? 'Flagged' : 'OK'}
                  </td>
                  <td className="py-2">
                    {onSetRagFeedback ? (
                      <select
                        value={row.feedback}
                        onChange={(e) => onSetRagFeedback(row.questionId, e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700"
                      >
                        <option value="unreviewed">Unreviewed</option>
                        <option value="helpful">Helpful</option>
                        <option value="not-helpful">Not helpful</option>
                        <option value="flagged">Flagged</option>
                      </select>
                    ) : (
                      <span className="text-slate-700">{row.feedback}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
          Item analysis
        </h3>
        <div className="mt-4 overflow-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2">QID</th>
                <th className="py-2">p-value</th>
                <th className="py-2">Difficulty</th>
                <th className="py-2">Discrimination</th>
                <th className="py-2">Label</th>
                <th className="py-2">Mean</th>
                <th className="py-2">StdDev</th>
              </tr>
            </thead>
            <tbody>
              {data.itemStats.map((row) => (
                <tr key={row.qid} className="border-b border-slate-50">
                  <td className="py-2 font-mono text-xs text-slate-700">{row.qid}</td>
                  <td className="py-2 font-black text-slate-900">{fmt(row.pValue)}</td>
                  <td className="py-2 text-slate-600">{row.difficulty}</td>
                  <td className="py-2 text-slate-700">{fmt(row.discrimination)}</td>
                  <td className="py-2 text-slate-600">{row.discriminationLabel}</td>
                  <td className="py-2 text-slate-700">{fmt(row.mean)}</td>
                  <td className="py-2 text-slate-700">{fmt(row.stddev)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
