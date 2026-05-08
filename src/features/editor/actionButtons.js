const LANGUAGE_BUTTON_BASE_CLASS = 'px-3 py-1.5 rounded-xl text-[10px] font-black transition';
const LANGUAGE_BUTTON_ACTIVE_CLASS = 'bg-white text-indigo-600 shadow-sm';
const LANGUAGE_BUTTON_INACTIVE_CLASS = 'text-slate-400 hover:text-slate-600';

const SAVE_BUTTON_BASE_CLASS =
  'px-5 py-2.5 rounded-xl text-[11px] font-black uppercase flex items-center gap-2 transition';
const SAVE_BUTTON_SAVING_CLASS = 'bg-slate-100 text-slate-400';
const SAVE_BUTTON_IDLE_CLASS =
  'bg-white border border-indigo-200 text-indigo-600 shadow-lg shadow-indigo-50 hover:bg-indigo-50';
const SAVE_BUTTON_ICON_SAVING_CLASS = 'animate-bounce';
const SAVE_BUTTON_ICON_IDLE_CLASS = '';

const VISION_IMPORT_BASE_CLASS =
  'px-3 py-2 rounded-xl transition flex items-center gap-1 relative cursor-pointer';
const VISION_IMPORT_BUSY_CLASS = 'text-slate-300 bg-slate-50';
const VISION_IMPORT_IDLE_CLASS = 'text-slate-400 hover:bg-white hover:text-indigo-600';

const COLLAB_BUTTON_BASE_CLASS =
  'px-5 py-2.5 rounded-xl text-[11px] font-black uppercase flex items-center gap-2 transition';
const COLLAB_BUTTON_ENABLED_CLASS =
  'bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700';
const COLLAB_BUTTON_DISABLED_CLASS =
  'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50';

export function getLanguageToggleButtonClass(isActive) {
  return `${LANGUAGE_BUTTON_BASE_CLASS} ${isActive ? LANGUAGE_BUTTON_ACTIVE_CLASS : LANGUAGE_BUTTON_INACTIVE_CLASS}`;
}

export function getSaveButtonClass(isSaving) {
  return `${SAVE_BUTTON_BASE_CLASS} ${isSaving ? SAVE_BUTTON_SAVING_CLASS : SAVE_BUTTON_IDLE_CLASS}`;
}

export function getSaveButtonIconClass(isSaving) {
  return isSaving ? SAVE_BUTTON_ICON_SAVING_CLASS : SAVE_BUTTON_ICON_IDLE_CLASS;
}

export function getSaveButtonLabel(isSaving, t) {
  const key = isSaving ? 'saving' : 'saveTest';
  return typeof t === 'function' ? t(key) : key;
}

export function getVisionImportButtonClass(isVisionImporting) {
  return `${VISION_IMPORT_BASE_CLASS} ${isVisionImporting ? VISION_IMPORT_BUSY_CLASS : VISION_IMPORT_IDLE_CLASS}`;
}

export function getVisionImportButtonLabel(isVisionImporting) {
  return isVisionImporting ? 'OCR...' : 'Vision';
}

export function getCollabToggleButtonClass(isEnabled) {
  return `${COLLAB_BUTTON_BASE_CLASS} ${isEnabled ? COLLAB_BUTTON_ENABLED_CLASS : COLLAB_BUTTON_DISABLED_CLASS}`;
}
