import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { queryRag, indexRagDocuments } from './ragClient';

describe('ragClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('queryRag trims query and clamps topK', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ ok: true, matches: [{ id: 'c1' }] }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const matches = await queryRag({ query: '  linear equations  ', topK: 999 });

    expect(matches).toHaveLength(1);
    const [, options] = fetchMock.mock.calls[0];
    const payload = JSON.parse(options.body);
    expect(payload.query).toBe('linear equations');
    expect(payload.topK).toBe(20);
  });

  it('queryRag throws on API error payload', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({ ok: false, error: 'Internal server error' }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(queryRag({ query: 'x' })).rejects.toThrow('Internal server error');
  });

  it('indexRagDocuments validates empty items', async () => {
    await expect(indexRagDocuments({ items: [] })).rejects.toThrow(
      'indexRagDocuments requires a non-empty items array'
    );
  });

  it('queryRag maps AbortError to user-friendly timeout message', async () => {
    const fetchMock = vi.fn(async () => {
      const err = new Error('aborted');
      err.name = 'AbortError';
      throw err;
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(queryRag({ query: 'geometry', timeoutMs: 1 })).rejects.toThrow(
      'RAG барањето истече или беше прекинато.'
    );
  });
});
