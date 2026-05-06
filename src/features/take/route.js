/**
 * Lightweight router за /t/:code public test линкови.
 *
 * Зошто без react-router:
 *   • Eden route-pattern (/t/CODE), nema nested routes.
 *   • Zero dependency cost; кога ќе влезе react-router (Phase 2.6 PWA),
 *     ова се заменува со <Routes>/<Route>.
 *
 * API е чист и testable: `parseTakePath(pathname)` → { code } | null.
 */

const TAKE_PATTERN = /^\/t\/([A-Za-z0-9_-]{3,32})\/?$/;
const RESUME_TOKEN_RE = /^[A-Za-z0-9_-]{6,64}$/;

/**
 * Парсира path и враќа `{ code }` ако се совпаѓа со /t/CODE.
 * @param {string} pathname
 * @returns {{ code: string } | null}
 */
export function parseTakePath(pathname) {
  if (typeof pathname !== 'string' || pathname.length === 0) return null;
  const m = pathname.match(TAKE_PATTERN);
  if (!m) return null;
  return { code: m[1] };
}

/**
 * Извлекува `?code=ABC123` од querystring како fallback за статични хостови
 * што не поддржуваат rewrite за SPA-патеки (пр. GitHub Pages без 404.html).
 * @param {string} search
 */
export function parseTakeQuery(search) {
  if (typeof search !== 'string' || search.length === 0) return null;
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const code = params.get('code');
  if (!code) return null;
  if (!/^[A-Za-z0-9_-]{3,32}$/.test(code)) return null;
  const resumeToken = parseResumeToken(search);
  return resumeToken ? { code, resumeToken } : { code };
}

/**
 * Извлекува resume токен (`?r=<token>`) од querystring.
 * @param {string} search
 * @returns {string | null}
 */
export function parseResumeToken(search) {
  if (typeof search !== 'string' || search.length === 0) return null;
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const token = params.get('r');
  if (!token) return null;
  return RESUME_TOKEN_RE.test(token) ? token : null;
}

/**
 * Резолвира текстот на тековниот URL (path + query) во take-target.
 * @param {{ pathname?: string, search?: string }} loc
 * @returns {{ code: string } | null}
 */
export function resolveTakeRoute(loc = {}) {
  const pathHit = parseTakePath(loc.pathname ?? '');
  if (pathHit) {
    const resumeToken = parseResumeToken(loc.search ?? '');
    return resumeToken ? { ...pathHit, resumeToken } : pathHit;
  }
  return parseTakeQuery(loc.search ?? '');
}

/**
 * Гради canonical линк за споделување.
 * @param {string} code
 * @param {string} [origin]
 */
export function buildTakeUrl(code, origin = '') {
  if (!code) throw new Error('buildTakeUrl: code е задолжителен');
  const base = origin.replace(/\/$/, '');
  return `${base}/t/${encodeURIComponent(code)}`;
}
