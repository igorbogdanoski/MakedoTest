import { createElement } from 'react';
import { Grid3X3, ListOrdered, Shuffle, Sparkles, Type, Zap } from 'lucide-react';

export const CATEGORY_FILTERS = [
  { id: 'all', label: 'Сите' },
  { id: 'stem', label: 'СТЕМ (Мат/Физ/Хем)' },
  { id: 'geometry', label: 'Геометрија' },
  { id: 'languages', label: 'Јазици (Мак/Анг)' },
  { id: 'history', label: 'Историја/Гео' },
];

export const TOOLBOX_CATEGORY_ORDER = [
  'базични',
  'текстуални',
  'логички',
  'листа',
  'напредни',
  'geometry',
];

const CATEGORY_ICON_COMPONENTS = {
  базични: Zap,
  текстуални: Type,
  логички: Shuffle,
  листа: ListOrdered,
  напредни: Sparkles,
  geometry: Grid3X3,
};

const CATEGORY_ICON_CLASSNAMES = {
  базични: 'text-amber-500',
  текстуални: 'text-blue-500',
  логички: 'text-purple-500',
  листа: 'text-emerald-500',
  напредни: 'text-indigo-500',
  geometry: 'text-indigo-500',
};

export function buildCategoryIcons() {
  return TOOLBOX_CATEGORY_ORDER.reduce((acc, category) => {
    const Icon = CATEGORY_ICON_COMPONENTS[category];
    acc[category] = createElement(Icon, {
      size: 14,
      className: CATEGORY_ICON_CLASSNAMES[category],
    });
    return acc;
  }, {});
}
