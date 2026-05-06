export const BLOOM_LEVELS = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];

const VERB_MAP = {
  remember: ['define', 'list', 'name', 'identify', 'state', 'memorize', 'наброј', 'дефинирај'],
  understand: ['explain', 'describe', 'summarize', 'classify', 'interpret', 'објасни', 'опиши'],
  apply: ['solve', 'use', 'compute', 'calculate', 'demonstrate', 'реши', 'пресметај'],
  analyze: ['analyze', 'compare', 'differentiate', 'organize', 'contrast', 'анализирај', 'спореди'],
  evaluate: ['evaluate', 'justify', 'defend', 'critique', 'assess', 'евалуирај', 'оправдај'],
  create: ['design', 'create', 'construct', 'compose', 'develop', 'креирај', 'дизајнирај'],
};

const TYPE_PRIOR = {
  'true-false': 'remember',
  multiple: 'remember',
  checklist: 'understand',
  matching: 'understand',
  ordering: 'analyze',
  'short-answer': 'understand',
  'fill-blanks': 'remember',
  'multi-part': 'analyze',
  statements: 'analyze',
  'multi-match': 'analyze',
  essay: 'evaluate',
  diagram: 'apply',
  table: 'apply',
  selection: 'apply',
  list: 'understand',
  section: 'remember',
};

function scoreByVerbs(text) {
  const t = String(text || '').toLowerCase();
  const score = Object.fromEntries(BLOOM_LEVELS.map((level) => [level, 0]));

  BLOOM_LEVELS.forEach((level) => {
    VERB_MAP[level].forEach((verb) => {
      if (t.includes(verb)) score[level] += 2;
    });
  });

  return score;
}

export function inferBloomLevel(question = {}) {
  if (BLOOM_LEVELS.includes(question.bloomLevel)) return question.bloomLevel;

  const score = scoreByVerbs(question.text);
  const prior = TYPE_PRIOR[question.type] || 'understand';
  score[prior] += 1;

  let best = 'understand';
  for (const level of BLOOM_LEVELS) {
    if (score[level] > score[best]) best = level;
  }
  return best;
}

export function summarizeBloomCoverage(questions = []) {
  const counted = (questions || []).filter((q) => q.type !== 'section');
  const counts = Object.fromEntries(BLOOM_LEVELS.map((level) => [level, 0]));

  counted.forEach((q) => {
    const level = BLOOM_LEVELS.includes(q.bloomLevel) ? q.bloomLevel : inferBloomLevel(q);
    counts[level] += 1;
  });

  const total = counted.length;
  const percentages = Object.fromEntries(
    BLOOM_LEVELS.map((level) => [level, total > 0 ? Math.round((counts[level] / total) * 100) : 0])
  );

  return { total, counts, percentages };
}
