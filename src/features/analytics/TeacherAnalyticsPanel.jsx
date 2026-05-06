import React, { useMemo } from 'react';
import { analyzeAttempts } from './itemAnalysis';

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
    };
  });
}

export default function TeacherAnalyticsPanel({ attempts = [] }) {
  const data = useMemo(() => analyzeAttempts(attempts), [attempts]);

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
