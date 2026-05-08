import { isValidElement } from 'react';
import { describe, expect, it } from 'vitest';
import { buildCategoryIcons, CATEGORY_FILTERS, TOOLBOX_CATEGORY_ORDER } from './categoryConfig.js';

describe('categoryConfig', () => {
  it('exports expected category filters in stable order', () => {
    expect(CATEGORY_FILTERS.map((c) => c.id)).toEqual([
      'all',
      'stem',
      'geometry',
      'languages',
      'history',
    ]);
  });

  it('exports toolbox category order', () => {
    expect(TOOLBOX_CATEGORY_ORDER).toEqual([
      'базични',
      'текстуални',
      'логички',
      'листа',
      'напредни',
      'geometry',
    ]);
  });

  it('builds icon nodes for every toolbox category', () => {
    const icons = buildCategoryIcons();
    expect(Object.keys(icons)).toEqual(TOOLBOX_CATEGORY_ORDER);
    TOOLBOX_CATEGORY_ORDER.forEach((category) => {
      expect(isValidElement(icons[category])).toBe(true);
    });
  });
});
