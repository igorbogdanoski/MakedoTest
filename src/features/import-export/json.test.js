import { describe, it, expect } from 'vitest';
import { importQuestionsFromJson, importTestFromJson, exportToJson } from './json.js';

describe('importQuestionsFromJson', () => {
  it('прифаќа валидна низа од прашања', () => {
    const json = JSON.stringify([
      { type: 'multiple', text: 'A?', options: ['x', 'y'], correct: 0 },
    ]);
    const r = importQuestionsFromJson(json);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toHaveLength(1);
  });

  it('прифаќа објект со поле questions', () => {
    const json = JSON.stringify({
      title: 'X',
      questions: [{ type: 'true-false', text: 'X', correct: 0 }],
    });
    const r = importQuestionsFromJson(json);
    expect(r.ok).toBe(true);
  });

  it('одбива невалиден JSON', () => {
    const r = importQuestionsFromJson('{not json');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Невалиден JSON/);
  });

  it('одбива невалиден shape со конкретни issues', () => {
    const r = importQuestionsFromJson(JSON.stringify([{ type: 'banana' }]));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.issues?.length).toBeGreaterThan(0);
  });
});

describe('importTestFromJson', () => {
  it('прифаќа целосен Test', () => {
    const r = importTestFromJson(
      JSON.stringify({
        title: 'Тест',
        language: 'mk',
        questions: [{ type: 'essay', text: 'Опиши' }],
      })
    );
    expect(r.ok).toBe(true);
  });
});

describe('exportToJson', () => {
  it('враќа pretty JSON', () => {
    const out = exportToJson({ a: 1 });
    expect(out).toBe('{\n  "a": 1\n}');
  });
});
