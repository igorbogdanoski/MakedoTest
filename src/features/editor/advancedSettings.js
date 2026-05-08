const ADVANCED_TOGGLE_BASE_CLASS =
  'flex items-center gap-2 px-4 py-2 rounded-2xl border transition';
const ADVANCED_TOGGLE_ACTIVE_CLASS =
  'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100';
const ADVANCED_TOGGLE_INACTIVE_CLASS = 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white';

export function getAdvancedToggleButtonClass(isActive) {
  return `${ADVANCED_TOGGLE_BASE_CLASS} ${isActive ? ADVANCED_TOGGLE_ACTIVE_CLASS : ADVANCED_TOGGLE_INACTIVE_CLASS}`;
}

export function getNextLayout(layout) {
  return layout === 'single' ? 'double' : 'single';
}

export function getLayoutToggleLabel(layout) {
  return layout === 'single' ? '2 Колони' : '1 Колона';
}
