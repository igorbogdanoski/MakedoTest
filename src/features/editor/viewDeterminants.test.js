import { describe, expect, it } from 'vitest';
import {
  isEditorView,
  shouldShowTestFormFields,
  shouldShowStudentLineFields,
  isAnalyticsView,
} from './viewDeterminants.js';

describe('viewDeterminants helpers', () => {
  it('correctly identifies editor view', () => {
    expect(isEditorView('editor')).toBe(true);
    expect(isEditorView('preview')).toBe(false);
    expect(isEditorView('answerKey')).toBe(false);
    expect(isEditorView('answerSheet')).toBe(false);
  });

  it('shows test form fields only in editor view', () => {
    expect(shouldShowTestFormFields('editor')).toBe(true);
    expect(shouldShowTestFormFields('preview')).toBe(false);
    expect(shouldShowTestFormFields('answerKey')).toBe(false);
    expect(shouldShowTestFormFields('analytics')).toBe(false);
  });

  it('shows student line fields for all views except answerKey, answerSheet, and analytics', () => {
    expect(shouldShowStudentLineFields('editor')).toBe(true);
    expect(shouldShowStudentLineFields('preview')).toBe(true);
    expect(shouldShowStudentLineFields('verify')).toBe(true);
    expect(shouldShowStudentLineFields('answerKey')).toBe(false);
    expect(shouldShowStudentLineFields('answerSheet')).toBe(false);
    expect(shouldShowStudentLineFields('analytics')).toBe(false);
  });

  it('correctly identifies analytics view', () => {
    expect(isAnalyticsView('analytics')).toBe(true);
    expect(isAnalyticsView('editor')).toBe(false);
    expect(isAnalyticsView('preview')).toBe(false);
  });
});
