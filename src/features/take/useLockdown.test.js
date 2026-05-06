import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLockdown } from './useLockdown';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useLockdown', () => {
  it('initial state is inactive with empty events', () => {
    const { result } = renderHook(() => useLockdown());
    expect(result.current.active).toBe(false);
    expect(result.current.events).toEqual([]);
    expect(result.current.violations).toEqual([]);
  });

  it('request() activates and records manual enter event', async () => {
    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useLockdown());
    await act(async () => {
      await result.current.request();
    });
    expect(result.current.active).toBe(true);
    expect(result.current.events.some((e) => e.kind === 'manual')).toBe(true);
  });

  it('request() activates even when Fullscreen API unsupported', async () => {
    document.documentElement.requestFullscreen = undefined;
    const { result } = renderHook(() => useLockdown());
    await act(async () => {
      await result.current.request();
    });
    expect(result.current.active).toBe(true);
  });

  it('blur event is recorded as violation when enabled+active', async () => {
    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    const onViolation = vi.fn();
    const { result } = renderHook(() => useLockdown({ enabled: true, onViolation }));
    await act(async () => {
      await result.current.request();
    });
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    const violations = result.current.events.filter((e) => e.kind === 'blur');
    expect(violations).toHaveLength(1);
    expect(onViolation).toHaveBeenCalledTimes(1);
  });

  it('copy/paste/cut/contextmenu are blocked and recorded', async () => {
    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useLockdown({ enabled: true }));
    await act(async () => {
      await result.current.request();
    });

    const fire = (type) => {
      const e = new Event(type, { bubbles: true, cancelable: true });
      const prevented = !document.dispatchEvent(e);
      return prevented;
    };

    act(() => {
      fire('copy');
      fire('paste');
      fire('cut');
      fire('contextmenu');
    });

    const kinds = result.current.events.map((e) => e.kind);
    expect(kinds).toContain('copy');
    expect(kinds).toContain('paste');
    expect(kinds).toContain('cut');
    expect(kinds).toContain('contextmenu');
    expect(result.current.violations.length).toBeGreaterThanOrEqual(4);
  });

  it('violations excludes manual events', async () => {
    document.documentElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useLockdown({ enabled: true }));
    await act(async () => {
      await result.current.request();
    });
    expect(result.current.violations.every((v) => v.kind !== 'manual')).toBe(true);
  });

  it('listeners NOT attached when enabled=false', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useLockdown({ enabled: false }));
    const blurAdded = addSpy.mock.calls.some(([type]) => type === 'blur');
    expect(blurAdded).toBe(false);
  });
});
