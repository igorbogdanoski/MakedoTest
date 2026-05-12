import { describe, expect, it } from 'vitest';
import { buildSessionStart } from './sessionStart.js';

describe('buildSessionStart', () => {
  it('updates subject when provided', () => {
    const testInfo = { subject: 'Old', teacher: 'T' };
    const result = buildSessionStart(testInfo, 'Math');
    expect(result.nextTestInfo).toEqual({ subject: 'Math', teacher: 'T' });
    expect(result.nextView).toBe('editor');
  });

  it('keeps testInfo when subject is empty/null', () => {
    const testInfo = { subject: 'Old' };
    expect(buildSessionStart(testInfo, '').nextTestInfo).toBe(testInfo);
    expect(buildSessionStart(testInfo, null).nextTestInfo).toBe(testInfo);
    expect(buildSessionStart(testInfo, undefined).nextTestInfo).toBe(testInfo);
  });

  it('always returns nextView of editor', () => {
    expect(buildSessionStart({}, 'X').nextView).toBe('editor');
    expect(buildSessionStart({}, '').nextView).toBe('editor');
  });

  it('does not mutate input testInfo', () => {
    const testInfo = { subject: 'Old' };
    buildSessionStart(testInfo, 'New');
    expect(testInfo).toEqual({ subject: 'Old' });
  });
});
