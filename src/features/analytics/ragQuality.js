export const RAG_FEEDBACK_OPTIONS = ['unreviewed', 'helpful', 'not-helpful', 'flagged'];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx];
}

function safeFeedback(value) {
  return RAG_FEEDBACK_OPTIONS.includes(value) ? value : 'unreviewed';
}

function deriveLatencyMs(question = {}, idx = 0) {
  const textLen = String(question.text || '').length;
  const diffBoost =
    question.difficulty === 'hard' ? 220 : question.difficulty === 'easy' ? -80 : 60;
  return clamp(420 + textLen * 3 + diffBoost + (idx % 5) * 35, 250, 2200);
}

function deriveCitationRetrieved(question = {}) {
  const base = question.type === 'essay' || question.type === 'multi-part' ? 4 : 3;
  const textLen = String(question.text || '').length;
  return clamp(base + Math.floor(textLen / 90), 1, 8);
}

function deriveCitationUsed(question = {}, citationsRetrieved = 1) {
  const hintInjected = String(question.text || '').includes('Насоки од наставна програма:');
  const manualHelpful = question.ragFeedback === 'helpful';
  if (hintInjected || manualHelpful) return clamp(citationsRetrieved - 1, 1, citationsRetrieved);
  if (question.ragFeedback === 'not-helpful') return 0;
  return clamp(Math.floor(citationsRetrieved / 2), 0, citationsRetrieved);
}

function deriveHallucination(question = {}, citationsRetrieved = 1, citationsUsed = 0) {
  if (question.ragFeedback === 'flagged') return true;
  const riskyType = question.type === 'essay' || question.type === 'short-answer';
  const lowGrounding = citationsUsed === 0 || citationsRetrieved <= 1;
  return riskyType && lowGrounding;
}

export function buildRagQualityRecords(questions = []) {
  const safe = Array.isArray(questions) ? questions.filter((q) => q.type !== 'section') : [];
  return safe.map((question, idx) => {
    const citationsRetrieved = deriveCitationRetrieved(question);
    const citationsUsed = deriveCitationUsed(question, citationsRetrieved);
    const feedback = safeFeedback(question.ragFeedback);
    return {
      questionId: question.id || `q-${idx + 1}`,
      type: question.type || 'unknown',
      latencyMs: deriveLatencyMs(question, idx),
      citationsRetrieved,
      citationsUsed,
      hallucinationFlag: deriveHallucination(question, citationsRetrieved, citationsUsed),
      feedback,
    };
  });
}

export function summarizeRagQuality(records = []) {
  const safe = Array.isArray(records) ? records : [];
  const feedbackCounts = {
    unreviewed: 0,
    helpful: 0,
    'not-helpful': 0,
    flagged: 0,
  };

  if (!safe.length) {
    return {
      totalQueries: 0,
      avgLatencyMs: 0,
      p95LatencyMs: 0,
      citationCoveragePct: 0,
      hallucinationRatePct: 0,
      feedbackCounts,
      flaggedSamples: [],
    };
  }

  const latencies = safe.map((r) => r.latencyMs).sort((a, b) => a - b);
  const totalRetrieved = safe.reduce((s, r) => s + Math.max(0, r.citationsRetrieved || 0), 0);
  const totalUsed = safe.reduce((s, r) => s + Math.max(0, r.citationsUsed || 0), 0);
  const flaggedCount = safe.filter((r) => r.hallucinationFlag).length;

  safe.forEach((r) => {
    const key = safeFeedback(r.feedback);
    feedbackCounts[key] += 1;
  });

  return {
    totalQueries: safe.length,
    avgLatencyMs: Math.round(latencies.reduce((s, x) => s + x, 0) / latencies.length),
    p95LatencyMs: percentile(latencies, 95),
    citationCoveragePct: totalRetrieved > 0 ? Math.round((totalUsed / totalRetrieved) * 100) : 0,
    hallucinationRatePct: Math.round((flaggedCount / safe.length) * 100),
    feedbackCounts,
    flaggedSamples: safe.filter((r) => r.hallucinationFlag).slice(0, 5),
  };
}
