import { describe, it, expect } from 'vitest';
import {
  LOAD_TEST_CONFIRM_MESSAGE,
  DELETE_TEST_CONFIRM_MESSAGE,
  buildLoadTestState,
} from './testLoader';

describe('confirm constants', () => {
  it('LOAD_TEST_CONFIRM_MESSAGE содржи macedonian prompt', () => {
    expect(LOAD_TEST_CONFIRM_MESSAGE).toContain('вчитате');
  });

  it('DELETE_TEST_CONFIRM_MESSAGE е краток prompt', () => {
    expect(DELETE_TEST_CONFIRM_MESSAGE).toBe('Избриши тест?');
  });
});

describe('buildLoadTestState', () => {
  it('extract id/questions/testInfo од валиден test', () => {
    const test = {
      id: 'abc',
      questions: [{ id: 1 }],
      testInfo: { subject: 'X' },
    };
    expect(buildLoadTestState(test)).toEqual({
      activeTestId: 'abc',
      questions: [{ id: 1 }],
      testInfo: { subject: 'X' },
    });
  });

  it('null test враќа null', () => {
    expect(buildLoadTestState(null)).toBeNull();
    expect(buildLoadTestState('string')).toBeNull();
  });

  it('missing полиња fallback-ат на безбедни defaults', () => {
    expect(buildLoadTestState({})).toEqual({
      activeTestId: null,
      questions: [],
      testInfo: {},
    });
  });

  it('non-array questions се normalizirat на []', () => {
    const out = buildLoadTestState({ id: 1, questions: 'bad', testInfo: null });
    expect(out.questions).toEqual([]);
    expect(out.testInfo).toEqual({});
  });
});
