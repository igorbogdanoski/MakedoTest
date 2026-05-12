import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setTemporaryState } from './temporaryState.js';

describe('setTemporaryState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('immediately calls setter with value', () => {
    const setter = vi.fn();
    setTemporaryState(setter, 'hi', 1000);
    expect(setter).toHaveBeenCalledWith('hi');
  });

  it('resets to null after duration', () => {
    const setter = vi.fn();
    setTemporaryState(setter, 'hi', 1000);
    vi.advanceTimersByTime(1000);
    expect(setter).toHaveBeenLastCalledWith(null);
  });

  it('uses custom reset value when provided', () => {
    const setter = vi.fn();
    setTemporaryState(setter, 'hi', 500, '');
    vi.advanceTimersByTime(500);
    expect(setter).toHaveBeenLastCalledWith('');
  });

  it('returns cleanup function that cancels reset', () => {
    const setter = vi.fn();
    const cancel = setTemporaryState(setter, 'hi', 1000);
    cancel();
    vi.advanceTimersByTime(2000);
    expect(setter).toHaveBeenCalledTimes(1);
  });

  it('is no-op when setter is not a function', () => {
    expect(() => setTemporaryState(null, 'x', 100)).not.toThrow();
  });
});
