import { describe, expect, it } from 'vitest';
import { TUTORIAL_STEPS } from './tutorialConfig.js';

describe('TUTORIAL_STEPS', () => {
  it('contains all expected tutorial targets in order', () => {
    expect(TUTORIAL_STEPS.map((step) => step.targetId)).toEqual([
      'main-nav',
      'bank-tab',
      'toolbox-sidebar',
      'advanced-settings',
      'test-paper',
      'action-buttons',
    ]);
  });

  it('has complete string fields for each step', () => {
    TUTORIAL_STEPS.forEach((step) => {
      expect(step).toMatchObject({
        title: expect.any(String),
        text: expect.any(String),
        targetId: expect.any(String),
      });
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.text.length).toBeGreaterThan(0);
      expect(step.targetId.length).toBeGreaterThan(0);
    });
  });

  it('has unique target IDs', () => {
    const ids = TUTORIAL_STEPS.map((step) => step.targetId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
