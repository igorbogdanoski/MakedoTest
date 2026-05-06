/**
 * useLockdown — anti-cheat hook за student-take сесии.
 *
 * Опсег (lite, без proctoring SDK):
 *   • Fullscreen request + auto-exit detection.
 *   • Tab-blur / visibility-change → flag event.
 *   • Copy / paste / contextmenu → блокирани + flagged.
 *   • Сите настани собрани во `events` низа (за post-submit forensics).
 *
 * Дизајн правила:
 *   • PURE side-effects — никакво UI рендерирање тука.
 *   • Враќа `{ active, events, violations, request, exit, recordEvent }`.
 *   • Лесно testable: сите DOM хендлери се регистрирани преку document/window
 *     и можат да се истригират од jsdom.
 *
 * Употреба:
 *   const lock = useLockdown({ enabled: true, onViolation: (e)=>… });
 *   <button onClick={lock.request}>Започни тест</button>
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * @typedef {'blur' | 'visibility' | 'fullscreen-exit' | 'copy' | 'paste' | 'cut' | 'contextmenu' | 'manual'} LockEventKind
 * @typedef {{ kind: LockEventKind, at: number, meta?: Record<string, unknown> }} LockEvent
 */

const VIOLATION_KINDS = new Set([
  'blur',
  'visibility',
  'fullscreen-exit',
  'copy',
  'paste',
  'cut',
  'contextmenu',
]);

function requestFullscreen(el) {
  if (!el) return Promise.reject(new Error('no element'));
  const fn =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;
  if (!fn) return Promise.reject(new Error('Fullscreen API не е поддржан'));
  return fn.call(el);
}

function exitFullscreen() {
  if (typeof document === 'undefined') return Promise.resolve();
  const fn =
    document.exitFullscreen ||
    document.webkitExitFullscreen ||
    document.mozCancelFullScreen ||
    document.msExitFullscreen;
  if (!fn || !document.fullscreenElement) return Promise.resolve();
  return fn.call(document);
}

/**
 * @param {{
 *   enabled?: boolean,
 *   targetRef?: { current: HTMLElement | null },
 *   onViolation?: (e: LockEvent) => void,
 * }} opts
 */
export function useLockdown({ enabled = false, targetRef, onViolation } = {}) {
  const [active, setActive] = useState(false);
  const [events, setEvents] = useState([]);
  const onViolationRef = useRef(onViolation);

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  const recordEvent = useCallback((kind, meta) => {
    const ev = { kind, at: Date.now(), meta };
    setEvents((prev) => [...prev, ev]);
    if (VIOLATION_KINDS.has(kind) && onViolationRef.current) {
      try {
        onViolationRef.current(ev);
      } catch {
        /* swallow listener errors */
      }
    }
    return ev;
  }, []);

  const request = useCallback(async () => {
    const el =
      targetRef?.current ?? (typeof document !== 'undefined' ? document.documentElement : null);
    try {
      await requestFullscreen(el);
      setActive(true);
      recordEvent('manual', { action: 'enter' });
      return true;
    } catch (err) {
      recordEvent('manual', { action: 'enter-failed', error: String(err?.message ?? err) });
      // На устројства без Fullscreen API сепак активирај listeners.
      setActive(true);
      return false;
    }
  }, [targetRef, recordEvent]);

  const exit = useCallback(async () => {
    setActive(false);
    recordEvent('manual', { action: 'exit' });
    try {
      await exitFullscreen();
    } catch {
      /* ignore */
    }
  }, [recordEvent]);

  useEffect(() => {
    if (!enabled || !active || typeof window === 'undefined') return undefined;

    const onBlur = () => recordEvent('blur');
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') recordEvent('visibility', { state: 'hidden' });
    };
    const onFsChange = () => {
      if (!document.fullscreenElement) recordEvent('fullscreen-exit');
    };
    const blockClipboard = (kind) => (e) => {
      e.preventDefault?.();
      recordEvent(kind);
    };
    const onContext = (e) => {
      e.preventDefault?.();
      recordEvent('contextmenu');
    };

    const onCopy = blockClipboard('copy');
    const onPaste = blockClipboard('paste');
    const onCut = blockClipboard('cut');

    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    document.addEventListener('cut', onCut);
    document.addEventListener('contextmenu', onContext);

    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
      document.removeEventListener('cut', onCut);
      document.removeEventListener('contextmenu', onContext);
    };
  }, [enabled, active, recordEvent]);

  const violations = events.filter((e) => VIOLATION_KINDS.has(e.kind));

  return { active, events, violations, request, exit, recordEvent };
}
