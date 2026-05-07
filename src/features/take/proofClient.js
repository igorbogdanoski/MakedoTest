const DEFAULT_BASE_URL = (import.meta.env.VITE_RAG_API_BASE_URL || '/api').replace(/\/$/, '');

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function requestServerSignedProof(payload, { signal, timeoutMs = 12000 } = {}) {
  const requestController = new AbortController();

  const forwardAbort = () => requestController.abort();
  if (signal) {
    if (signal.aborted) requestController.abort();
    else signal.addEventListener('abort', forwardAbort, { once: true });
  }

  const timer =
    Number.isFinite(timeoutMs) && timeoutMs > 0
      ? setTimeout(() => requestController.abort(), timeoutMs)
      : null;

  let response;
  try {
    response = await fetch(`${DEFAULT_BASE_URL}/submission/proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload }),
      signal: requestController.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Signing request timeout');
    }
    throw new Error(err?.message || 'Signing request failed');
  } finally {
    if (timer) clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', forwardAbort);
  }

  const json = await safeJson(response);
  if (!response.ok || json?.ok === false || !json?.token) {
    throw new Error(json?.error || `Signing request failed (${response.status})`);
  }

  return json.token;
}

export async function requestProofVerification(
  payload,
  signature,
  { signal, timeoutMs = 12000 } = {}
) {
  const requestController = new AbortController();

  const forwardAbort = () => requestController.abort();
  if (signal) {
    if (signal.aborted) requestController.abort();
    else signal.addEventListener('abort', forwardAbort, { once: true });
  }

  const timer =
    Number.isFinite(timeoutMs) && timeoutMs > 0
      ? setTimeout(() => requestController.abort(), timeoutMs)
      : null;

  let response;
  try {
    response = await fetch(`${DEFAULT_BASE_URL}/submission/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload, signature }),
      signal: requestController.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Verification request timeout');
    }
    throw new Error(err?.message || 'Verification request failed');
  } finally {
    if (timer) clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', forwardAbort);
  }

  const json = await safeJson(response);
  if (!response.ok || json?.ok === false) {
    throw new Error(json?.error || `Verification request failed (${response.status})`);
  }

  return json;
}
