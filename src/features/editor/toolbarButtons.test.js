import { describe, expect, it } from 'vitest';
import {
  getJsonImportButtonClass,
  getPasteButtonClass,
  getQtiExportButtonClass,
  getQtiImportButtonClass,
} from './toolbarButtons.js';

describe('toolbarButtons helpers', () => {
  it('builds JSON import button class', () => {
    expect(getJsonImportButtonClass()).toBe(
      'px-3 py-2 rounded-xl transition flex items-center gap-1 relative text-slate-500 hover:bg-white hover:text-indigo-600'
    );
  });

  it('builds paste button class', () => {
    expect(getPasteButtonClass()).toBe(
      'px-3 py-2 rounded-xl transition flex items-center gap-1 text-slate-400 hover:bg-white hover:text-indigo-600'
    );
  });

  it('builds QTI export button class', () => {
    expect(getQtiExportButtonClass()).toBe(
      'px-3 py-2 rounded-xl transition flex items-center gap-1 text-slate-500 hover:bg-white hover:text-indigo-600'
    );
  });

  it('builds QTI import button class', () => {
    expect(getQtiImportButtonClass()).toBe(
      'px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer text-slate-500 hover:bg-white hover:text-indigo-600'
    );
  });
});
