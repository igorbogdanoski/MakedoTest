const EDITOR_VIEW = 'editor';
const ICON_PREVIEW = 'preview';
const ICON_EDITOR = 'editor';

export function getEditorToggleIconType(view) {
  return view === EDITOR_VIEW ? ICON_PREVIEW : ICON_EDITOR;
}

export function getEditorToggleLabel(view, t) {
  return view === EDITOR_VIEW ? t('preview') : t('editor');
}
