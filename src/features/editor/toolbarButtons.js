const TOOLBAR_BUTTON_BASE_CLASS = 'px-3 py-2 rounded-xl transition flex items-center gap-1';
const TOOLBAR_IMPORT_BUTTON_CLASS = `${TOOLBAR_BUTTON_BASE_CLASS} relative`;
const TOOLBAR_SECONDARY_BUTTON_CLASS = `${TOOLBAR_BUTTON_BASE_CLASS} cursor-pointer`;

const JSON_IMPORT_BUTTON_CLASS = `${TOOLBAR_IMPORT_BUTTON_CLASS} text-slate-500 hover:bg-white hover:text-indigo-600`;
const PASTE_BUTTON_CLASS = `${TOOLBAR_BUTTON_BASE_CLASS} text-slate-400 hover:bg-white hover:text-indigo-600`;
const QTI_EXPORT_BUTTON_CLASS = `${TOOLBAR_BUTTON_BASE_CLASS} text-slate-500 hover:bg-white hover:text-indigo-600`;
const QTI_IMPORT_BUTTON_CLASS = `${TOOLBAR_SECONDARY_BUTTON_CLASS} text-slate-500 hover:bg-white hover:text-indigo-600`;

export function getJsonImportButtonClass() {
  return JSON_IMPORT_BUTTON_CLASS;
}

export function getPasteButtonClass() {
  return PASTE_BUTTON_CLASS;
}

export function getQtiExportButtonClass() {
  return QTI_EXPORT_BUTTON_CLASS;
}

export function getQtiImportButtonClass() {
  return QTI_IMPORT_BUTTON_CLASS;
}
