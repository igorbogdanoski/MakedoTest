export const NAV_VIEW_TABS = [
  'editor',
  'preview',
  'answerKey',
  'answerSheet',
  'analytics',
  'verify',
];

const NAV_VIEW_LABELS = {
  editor: 'Уреди',
  preview: 'Тест',
  answerKey: 'Клуч',
  answerSheet: 'Лист',
  analytics: 'Аналитика',
  verify: 'Verify',
};

const NAV_VIEW_BUTTON_BASE_CLASS =
  'px-6 py-2 rounded-xl text-[11px] font-black uppercase transition';
const NAV_VIEW_BUTTON_ACTIVE_CLASS = 'bg-white text-indigo-600 shadow-md';
const NAV_VIEW_BUTTON_INACTIVE_CLASS = 'text-slate-500 hover:text-slate-900';

export function getNavViewLabel(view) {
  return NAV_VIEW_LABELS[view] || 'Verify';
}

export function getNavViewButtonClass(isActive) {
  return `${NAV_VIEW_BUTTON_BASE_CLASS} ${isActive ? NAV_VIEW_BUTTON_ACTIVE_CLASS : NAV_VIEW_BUTTON_INACTIVE_CLASS}`;
}
