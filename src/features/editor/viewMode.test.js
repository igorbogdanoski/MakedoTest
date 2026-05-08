import { describe, expect, it } from 'vitest';
import { determinePaperContentView, getPaperContentContainerClass } from './viewMode.js';

describe('viewMode helpers', () => {
  it('maps known views to content modes', () => {
    expect(determinePaperContentView('analytics')).toBe('analytics');
    expect(determinePaperContentView('verify')).toBe('verify');
    expect(determinePaperContentView('answerSheet')).toBe('answerSheet');
  });

  it('falls back to default mode for other views', () => {
    expect(determinePaperContentView('editor')).toBe('default');
    expect(determinePaperContentView('preview')).toBe('default');
  });

  it('adds answer sheet spacing class only for answerSheet mode', () => {
    expect(getPaperContentContainerClass('answerSheet')).toContain('space-y-20');
    expect(getPaperContentContainerClass('default')).toBe('relative z-10 flex-grow');
  });
});
