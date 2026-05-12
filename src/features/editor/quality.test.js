import { describe, expect, it } from 'vitest';
import { findDuplicateQuestionTexts, normalizeQuestionText } from './quality.js';

describe('editor quality helpers', () => {
  it('normalizeQuestionText trims and lowercases', () => {
    expect(normalizeQuestionText('  Hello World  ')).toBe('hello world');
  });

  it('normalizeQuestionText returns empty string for non-strings', () => {
    expect(normalizeQuestionText(null)).toBe('');
    expect(normalizeQuestionText(undefined)).toBe('');
    expect(normalizeQuestionText(123)).toBe('');
  });

  it('findDuplicateQuestionTexts returns duplicates above min length', () => {
    const questions = [
      { text: 'Hello World' },
      { text: 'Different one here' },
      { text: 'hello world' },
    ];
    expect(findDuplicateQuestionTexts(questions)).toEqual(['hello world']);
  });

  it('findDuplicateQuestionTexts ignores short texts', () => {
    const questions = [{ text: 'Hi' }, { text: 'hi' }, { text: 'Hi' }];
    expect(findDuplicateQuestionTexts(questions)).toEqual([]);
  });

  it('findDuplicateQuestionTexts returns empty array for non-arrays', () => {
    expect(findDuplicateQuestionTexts(null)).toEqual([]);
    expect(findDuplicateQuestionTexts(undefined)).toEqual([]);
  });

  it('findDuplicateQuestionTexts handles missing text gracefully', () => {
    const questions = [{ text: 'Long enough text here' }, {}, { text: null }];
    expect(findDuplicateQuestionTexts(questions)).toEqual([]);
  });
});
