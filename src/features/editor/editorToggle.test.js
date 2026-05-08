import { describe, expect, it, vi } from 'vitest';
import { getEditorToggleIconType, getEditorToggleLabel } from './editorToggle.js';

describe('editorToggle helpers', () => {
  it('returns correct icon type for editor and preview views', () => {
    expect(getEditorToggleIconType('editor')).toBe('preview');
    expect(getEditorToggleIconType('preview')).toBe('editor');
  });

  it('translates label based on current view', () => {
    const mockT = vi.fn((key) => {
      const translations = { preview: 'Preview', editor: 'Editor' };
      return translations[key] || key;
    });

    expect(getEditorToggleLabel('editor', mockT)).toBe('Preview');
    expect(getEditorToggleLabel('preview', mockT)).toBe('Editor');
    expect(mockT).toHaveBeenCalledTimes(2);
  });

  it('falls back gracefully if translation function is missing', () => {
    const fallbackT = (key) => key;
    expect(getEditorToggleLabel('editor', fallbackT)).toBe('preview');
    expect(getEditorToggleLabel('preview', fallbackT)).toBe('editor');
  });
});
