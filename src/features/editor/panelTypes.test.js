import { describe, expect, it } from 'vitest';
import {
  getPaperPanelType,
  isAnalyticsPanelType,
  isVerifyPanelType,
  isAnswerSheetPanelType,
  isQuestionsPanelType,
} from './panelTypes.js';

describe('panelTypes helpers', () => {
  it('correctly identifies panel type from paperContentView', () => {
    expect(getPaperPanelType('analytics')).toBe('analytics');
    expect(getPaperPanelType('verify')).toBe('verify');
    expect(getPaperPanelType('answerSheet')).toBe('answerSheet');
    expect(getPaperPanelType('editor')).toBe('questions');
    expect(getPaperPanelType('preview')).toBe('questions');
  });

  it('correctly identifies analytics panel type', () => {
    expect(isAnalyticsPanelType('analytics')).toBe(true);
    expect(isAnalyticsPanelType('verify')).toBe(false);
    expect(isAnalyticsPanelType('questions')).toBe(false);
  });

  it('correctly identifies verify panel type', () => {
    expect(isVerifyPanelType('verify')).toBe(true);
    expect(isVerifyPanelType('analytics')).toBe(false);
  });

  it('correctly identifies answerSheet panel type', () => {
    expect(isAnswerSheetPanelType('answerSheet')).toBe(true);
    expect(isAnswerSheetPanelType('verify')).toBe(false);
  });

  it('correctly identifies questions panel type', () => {
    expect(isQuestionsPanelType('questions')).toBe(true);
    expect(isQuestionsPanelType('analytics')).toBe(false);
    expect(isQuestionsPanelType('verify')).toBe(false);
  });
});
