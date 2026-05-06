import { describe, it, expect, vi } from 'vitest';
import { handleIndex } from './indexHandler.js';

// Fake embeddings: deterministic unit vectors of length 3
const fakeEmbedTexts = vi.fn(async (texts) => texts.map((_, i) => [i + 1, 0, 0]));
const fakeUpsertVectors = vi.fn(async (_ns, docs) => docs.length);

function makeDeps(overrides = {}) {
  return {
    embedTexts: fakeEmbedTexts,
    upsertVectors: fakeUpsertVectors,
    ...overrides,
  };
}

describe('handleIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fakeEmbedTexts.mockImplementation(async (texts) => texts.map((_, i) => [i + 1, 0, 0]));
    fakeUpsertVectors.mockImplementation(async (_ns, docs) => docs.length);
  });

  it('embeds texts and upserts the correct number of docs', async () => {
    const body = {
      namespace: 'test-ns',
      items: [
        { id: 'doc-1', text: 'Hello world', metadata: { grade: 1 } },
        { id: 'doc-2', text: 'Mathematics', metadata: { grade: 2 } },
      ],
    };

    const result = await handleIndex(body, makeDeps());

    expect(result.ok).toBe(true);
    expect(result.upserted).toBe(2);
    expect(fakeEmbedTexts).toHaveBeenCalledWith(['Hello world', 'Mathematics']);
    expect(fakeUpsertVectors).toHaveBeenCalledTimes(1);

    const [ns, docs] = fakeUpsertVectors.mock.calls[0];
    expect(ns).toBe('test-ns');
    expect(docs).toHaveLength(2);
    expect(docs[0].embedding).toEqual([1, 0, 0]);
    expect(docs[1].embedding).toEqual([2, 0, 0]);
  });

  it('attaches metadata to upserted docs', async () => {
    const body = {
      namespace: 'ns',
      items: [{ id: 'c1', text: 'Concept one', metadata: { topicId: 't1', track: 'primary' } }],
    };

    await handleIndex(body, makeDeps());

    const [, docs] = fakeUpsertVectors.mock.calls[0];
    expect(docs[0].metadata).toEqual({ topicId: 't1', track: 'primary' });
  });

  it('defaults missing metadata to empty object', async () => {
    const body = {
      namespace: 'ns',
      items: [{ id: 'c2', text: 'No meta' }],
    };

    await handleIndex(body, makeDeps());

    const [, docs] = fakeUpsertVectors.mock.calls[0];
    expect(docs[0].metadata).toEqual({});
  });

  it('throws when embedding count does not match item count', async () => {
    const badEmbed = vi.fn(async () => [[1, 0, 0]]); // returns 1 embedding for 2 items

    const body = {
      namespace: 'ns',
      items: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
    };

    await expect(handleIndex(body, makeDeps({ embedTexts: badEmbed }))).rejects.toThrow(
      /mismatch/i
    );
  });

  it('propagates embedTexts errors', async () => {
    const failEmbed = vi.fn(async () => {
      throw new Error('Quota exceeded');
    });

    const body = { namespace: 'ns', items: [{ id: 'x', text: 'x' }] };
    await expect(handleIndex(body, makeDeps({ embedTexts: failEmbed }))).rejects.toThrow(
      'Quota exceeded'
    );
  });
});
