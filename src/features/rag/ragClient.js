const DEFAULT_BASE_URL = (import.meta.env.VITE_RAG_API_BASE_URL || '/api').replace(/\/$/, '');
const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_RAG_TIMEOUT_MS || 12000);

function getNamespace(namespace) {
  return namespace || import.meta.env.VITE_RAG_DEFAULT_NAMESPACE || 'makedotest';
}

async function callJson(path, body, options = {}) {
  const timeoutMs = Number(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const requestController = new AbortController();

  const forwardAbort = () => requestController.abort();
  if (options.signal) {
    if (options.signal.aborted) {
      requestController.abort();
    } else {
      options.signal.addEventListener('abort', forwardAbort, { once: true });
    }
  }

  const timer =
    Number.isFinite(timeoutMs) && timeoutMs > 0
      ? setTimeout(() => requestController.abort(), timeoutMs)
      : null;

  let response;
  try {
    response = await fetch(`${DEFAULT_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: requestController.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('RAG барањето истече или беше прекинато.');
    }
    throw new Error(err?.message || 'Неуспешна конекција со RAG сервисот.');
  } finally {
    if (timer) clearTimeout(timer);
    if (options.signal) {
      options.signal.removeEventListener('abort', forwardAbort);
    }
  }

  const payload = await safeJson(response);
  if (!response.ok || payload?.ok === false) {
    const message = payload?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function indexRagDocuments({ items, namespace, signal, timeoutMs } = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('indexRagDocuments requires a non-empty items array');
  }

  return callJson(
    '/rag/index',
    {
      namespace: getNamespace(namespace),
      items,
    },
    {
      signal,
      timeoutMs,
    }
  );
}

export async function queryRag({ query, topK = 5, namespace, signal, timeoutMs } = {}) {
  if (!query || !String(query).trim()) {
    throw new Error('queryRag requires a non-empty query');
  }

  const safeTopK = Math.max(1, Math.min(20, Number(topK) || 5));

  const result = await callJson(
    '/rag/query',
    {
      namespace: getNamespace(namespace),
      query: String(query).trim(),
      topK: safeTopK,
    },
    {
      signal,
      timeoutMs,
    }
  );

  return Array.isArray(result.matches) ? result.matches : [];
}
