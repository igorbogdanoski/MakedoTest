import { describe, it, expect, vi } from 'vitest';
import { handleQuery } from './queryHandler.js';

const QUERY_VEC = [1, 0, 0];

const fakeCandidates = [
  { id: 'doc-a', text: 'Geometry basics', embedding: [1, 0, 0], metadata: { grade: 1 } },
  { id: 'doc-b', text: 'Algebra intro', embedding: [0, 1, 0], metadata: { grade: 5 } },
  { id: 'doc-c', text: 'Calculus', embedding: [0.7, 0.7, 0], metadata: { grade: 11 } },
];

const fakeEmbedQuery = vi.fn(async () => QUERY_VEC);
const fakeFetchAllVectors = vi.fn(async () => fakeCandidates);

function makeDeps(overrides = {}) {
  return {
    embedQuery: fakeEmbedQuery,
    fetchAllVectors: fakeFetchAllVectors,
    ...overrides,
  };
}

describe('handleQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fakeEmbedQuery.mockResolvedValue(QUERY_VEC);
    fakeFetchAllVectors.mockResolvedValue(fakeCandidates);
  });

  it('returns ok:true with ranked matches', async () => {
    const result = await handleQuery({ namespace: 'ns', query: 'geometry', topK: 3 }, makeDeps());

    expect(result.ok).toBe(true);
    expect(Array.isArray(result.matches)).toBe(true);
    expect(result.matches.length).toBeGreaterThan(0);
  });

  it('returns top-1 match correctly ranked by cosine similarity', async () => {
    const result = await handleQuery({ namespace: 'ns', query: 'geometry', topK: 1 }, makeDeps());

    // doc-a embedding [1,0,0] is identical to query [1,0,0] → score = 1.0
    expect(result.matches[0].id).toBe('doc-a');
    expect(result.matches[0].score).toBeCloseTo(1.0, 5);
  });

  it('respects topK limit', async () => {
    const result = await handleQuery({ namespace: 'ns', query: 'any', topK: 2 }, makeDeps());
    expect(result.matches).toHaveLength(2);
  });

  it('includes id, text, score, metadata on each match', async () => {
    const result = await handleQuery({ namespace: 'ns', query: 'any', topK: 1 }, makeDeps());
    const m = result.matches[0];
    expect(m).toHaveProperty('id');
    expect(m).toHaveProperty('text');
    expect(m).toHaveProperty('score');
    expect(m).toHaveProperty('metadata');
  });

  it('returns empty matches when vector store is empty', async () => {
    const emptyStore = vi.fn(async () => []);
    const result = await handleQuery(
      { namespace: 'ns', query: 'anything', topK: 5 },
      makeDeps({ fetchAllVectors: emptyStore })
    );
    expect(result.ok).toBe(true);
    expect(result.matches).toHaveLength(0);
  });

  it('propagates embedQuery errors', async () => {
    const failEmbed = vi.fn(async () => {
      throw new Error('API key invalid');
    });
    await expect(
      handleQuery({ namespace: 'ns', query: 'q', topK: 5 }, makeDeps({ embedQuery: failEmbed }))
    ).rejects.toThrow('API key invalid');
  });

  it('calls fetchAllVectors with the correct namespace', async () => {
    await handleQuery({ namespace: 'my-school', query: 'q', topK: 3 }, makeDeps());
    expect(fakeFetchAllVectors).toHaveBeenCalledWith('my-school');
  });
});
