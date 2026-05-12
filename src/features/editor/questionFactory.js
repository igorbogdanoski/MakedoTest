import { createDefaultResponseConfig } from '../../domain/responsePolicy';

export function createQuestion(type, { sectionLayout = 'single', id } = {}) {
  const baseQ = {
    id: id ?? Date.now(),
    type,
    text: '',
    points: 5,
    columns: type === 'multiple' || type === 'checklist' ? 2 : 1,
    difficulty: 'medium',
    responseConfig: createDefaultResponseConfig(type),
  };

  if (type === 'multiple' || type === 'checklist') {
    baseQ.options = ['', '', ''];
    baseQ.correct = 0;
    baseQ.corrects = [];
  } else if (type === 'true-false') {
    baseQ.correct = 0;
    baseQ.layout = 'horizontal';
  } else if (type === 'matching' || type === 'multi-match') {
    baseQ.matches = [
      { s: '', a: '' },
      { s: '', a: '' },
    ];
  } else if (type === 'table') {
    baseQ.tableData = { rows: 3, cols: 3, data: {} };
  } else if (type === 'selection') {
    baseQ.text = 'Пример за {точен|погрешно}.';
  } else if (type === 'section') {
    baseQ.points = 0;
    baseQ.fullWidth = true;
    baseQ.text = 'НОВА СЕКЦИЈА';
    baseQ.sectionLayout = sectionLayout;
  } else if (type === 'list' || type === 'ordering') {
    baseQ.items = ['', '', ''];
  } else if (type === 'statements') {
    baseQ.items = [
      { s: '', correct: 0 },
      { s: '', correct: 0 },
    ];
  } else if (type === 'multi-part') {
    baseQ.parts = ['', ''];
  } else if (type === 'diagram') {
    baseQ.embedType = 'image';
    baseQ.embedUrl = '';
    baseQ.imageUrl = '';
  }

  return baseQ;
}
