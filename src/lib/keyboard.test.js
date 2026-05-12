import { describe, expect, it, vi } from 'vitest';
import { triggerOnEnterOrSpace } from './keyboard.js';

describe('triggerOnEnterOrSpace', () => {
  it('invokes callback on Enter and prevents default', () => {
    const cb = vi.fn();
    const preventDefault = vi.fn();
    triggerOnEnterOrSpace({ key: 'Enter', preventDefault }, cb);
    expect(cb).toHaveBeenCalledOnce();
    expect(preventDefault).toHaveBeenCalledOnce();
  });

  it('invokes callback on Space and prevents default', () => {
    const cb = vi.fn();
    const preventDefault = vi.fn();
    triggerOnEnterOrSpace({ key: ' ', preventDefault }, cb);
    expect(cb).toHaveBeenCalledOnce();
    expect(preventDefault).toHaveBeenCalledOnce();
  });

  it('does not invoke callback on other keys', () => {
    const cb = vi.fn();
    triggerOnEnterOrSpace({ key: 'Tab', preventDefault: () => {} }, cb);
    expect(cb).not.toHaveBeenCalled();
  });

  it('is no-op for missing event or non-function callback', () => {
    expect(() => triggerOnEnterOrSpace(null, () => {})).not.toThrow();
    expect(() => triggerOnEnterOrSpace({ key: 'Enter' }, null)).not.toThrow();
  });
});
