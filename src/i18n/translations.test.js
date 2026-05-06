import { describe, it, expect } from 'vitest';
import {
  translations,
  translate,
  createTranslator,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
} from './translations.js';

describe('i18n translations', () => {
  it('подржува mk и sq', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['mk', 'sq']);
    expect(DEFAULT_LANGUAGE).toBe('mk');
  });

  it('сите јазици имаат исти клучеви', () => {
    const mkKeys = Object.keys(translations.mk).sort();
    const sqKeys = Object.keys(translations.sq).sort();
    expect(sqKeys).toEqual(mkKeys);
  });

  it('translate враќа точен превод', () => {
    expect(translate('mk', 'editor')).toBe('Едитор');
    expect(translate('sq', 'editor')).toBe('Redaktues');
  });

  it('translate fallback на default јазик за непознат код', () => {
    expect(translate('xx', 'editor')).toBe('Едитор');
  });

  it('translate враќа клуч ако превод не постои', () => {
    expect(translate('mk', 'nonexistent_key_xyz')).toBe('nonexistent_key_xyz');
  });

  it('createTranslator креира bound функција', () => {
    const t = createTranslator('sq');
    expect(t('print')).toBe('Printo');
    expect(t('saveTest')).toBe('Ruaj Testin');
  });
});
