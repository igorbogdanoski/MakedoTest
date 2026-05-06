import { describe, expect, it } from 'vitest';
import { chunkText } from './chunking';
import { cosineSimilarity, rankByEmbeddingSimilarity } from './retrieval';
import { buildRagPromptHints, composeRagHintBlock } from './suggestions';

describe('rag chunking', () => {
  it('splits text into overlapping chunks', () => {
    const text = `${'A '.repeat(500)}\n\n${'B '.repeat(500)}\n\n${'C '.repeat(500)}`;
    const chunks = chunkText(text, { chunkSize: 220, overlap: 40, minChunkLength: 30 });

    expect(chunks.length).toBeGreaterThan(4);
    expect(chunks[0].id).toBe('chunk-0');
    expect(chunks[0].text.length).toBeGreaterThan(29);
    expect(chunks[1].start).toBeLessThan(chunks[0].end);
  });

  it('returns empty array for empty input', () => {
    expect(chunkText('   ')).toEqual([]);
  });
});

describe('rag retrieval', () => {
  it('computes cosine similarity', () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it('ranks vectors by relevance', () => {
    const query = [1, 0, 0];
    const docs = [
      { id: 'd1', embedding: [1, 0, 0], text: 'exact' },
      { id: 'd2', embedding: [0.6, 0.6, 0], text: 'mixed' },
      { id: 'd3', embedding: [0, 1, 0], text: 'off-topic' },
    ];

    const ranked = rankByEmbeddingSimilarity(query, docs, { topK: 2, minScore: 0.2 });
    expect(ranked).toHaveLength(2);
    expect(ranked[0].id).toBe('d1');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });
});

describe('rag suggestions', () => {
  it('builds concise hint lines from matches', () => {
    const hints = buildRagPromptHints([
      {
        id: 'c1',
        metadata: {
          conceptTitle: 'Множества и операции',
          topicTitle: 'Алгебра',
          gradeLevel: 10,
          track: 'gymnasium',
          assessmentStandards: ['Применува множества за моделирање проблеми'],
        },
      },
    ]);

    expect(hints).toHaveLength(1);
    expect(hints[0]).toContain('Множества и операции');
    expect(hints[0]).toContain('Алгебра');
    expect(hints[0]).toContain('Одд. 10');
    expect(hints[0]).toContain('Стандард:');
  });

  it('creates a multiline hint block', () => {
    const block = composeRagHintBlock([
      { id: 'c2', metadata: { conceptTitle: 'Линеарни функции' } },
    ]);

    expect(block).toContain('Насоки од наставна програма:');
    expect(block).toContain('- Линеарни функции');
  });
});
