/**
 * useAuth — централен hook за Firebase auth state.
 *
 * Архитектонски правила:
 *   • Точно еден `onAuthStateChanged` listener per app (overlap-free).
 *   • Анонимна автентикација е fallback ако нема логиран корисник.
 *   • Враќа `{ user, status }` каде `status ∈ { loading, ready, error }`.
 *   • Никаде на друго место во кодот да не се повикува `signInAnonymously`
 *     или `onAuthStateChanged` директно — секогаш преку овој hook.
 */

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '../lib/firebase';

/**
 * @typedef {'loading' | 'ready' | 'error'} AuthStatus
 * @typedef {{ user: import('firebase/auth').User | null, status: AuthStatus, error: Error | null }} AuthState
 */

/** @returns {AuthState} */
export function useAuth() {
  const [state, setState] = useState({
    user: null,
    status: 'loading',
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const unsub = onAuthStateChanged(
      auth,
      async (user) => {
        if (cancelled) return;
        if (user) {
          setState({ user, status: 'ready', error: null });
          return;
        }
        try {
          const cred = await signInAnonymously(auth);
          if (cancelled) return;
          setState({ user: cred.user, status: 'ready', error: null });
        } catch (err) {
          if (cancelled) return;
          // eslint-disable-next-line no-console
          console.error('[useAuth] анонимна автентикација пропадна', err);
          setState({ user: null, status: 'error', error: err });
        }
      },
      (err) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error('[useAuth] auth state listener грешка', err);
        setState({ user: null, status: 'error', error: err });
      }
    );

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return state;
}
