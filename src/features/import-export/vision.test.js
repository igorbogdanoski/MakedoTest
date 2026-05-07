import { describe, it, expect, vi } from 'vitest';

vi.mock('tesseract.js', () => ({
  recognize: vi.fn(async () => ({
    data: {
      text: '1) Кој е главен град на Македонија?\nA) Скопје\nB) Битола\n2) Објасни фотосинтеза.',
    },
  })),
}));

import {
  parseQuestionsFromVisionText,
  parseVisionPayload,
  importQuestionsFromVisionFile,
  requestVisionApi,
  runTesseractFallback,
} from './vision';

describe('parseQuestionsFromVisionText', () => {
  it('парсира OCR текст во multiple + short-answer прашања', () => {
    const r = parseQuestionsFromVisionText(
      '1) Кој е главен град на Македонија?\nA) Скопје\nB) Битола\n2) Објасни фотосинтеза.'
    );

    expect(r.ok).toBe(true);
    if (!r.ok) return;

    expect(r.data).toHaveLength(2);
    expect(r.data[0].type).toBe('multiple');
    expect(r.data[0].options).toEqual(['Скопје', 'Битола']);
    expect(r.data[1].type).toBe('short-answer');
  });

  it('враќа грешка за празен текст', () => {
    const r = parseQuestionsFromVisionText('  ');
    expect(r.ok).toBe(false);
  });
});

describe('parseVisionPayload', () => {
  it('прифаќа payload со questions', () => {
    const r = parseVisionPayload({
      questions: [{ type: 'true-false', text: 'Сонцето е ѕвезда.', correct: 0 }],
    });
    expect(r.ok).toBe(true);
  });

  it('прифаќа payload со json string', () => {
    const r = parseVisionPayload({
      json: JSON.stringify([{ type: 'essay', text: 'Напиши краток есеј.' }]),
    });
    expect(r.ok).toBe(true);
  });

  it('враќа грешка за неподдржан payload', () => {
    const r = parseVisionPayload({ foo: 'bar' });
    expect(r.ok).toBe(false);
  });
});

describe('requestVisionApi', () => {
  it('праќа multipart POST кон /vision/parse', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ questions: [{ type: 'essay', text: 'X' }] }),
    }));

    const blob = new Blob(['img'], { type: 'image/png' });
    await requestVisionApi(blob, fetchImpl);

    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toMatch(/\/vision\/parse$/);
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
  });
});

describe('runTesseractFallback', () => {
  it('враќа OCR текст од tesseract.js', async () => {
    const blob = new Blob(['img'], { type: 'image/png' });
    const text = await runTesseractFallback(blob);
    expect(text).toMatch(/главен град/);
  });
});

describe('importQuestionsFromVisionFile', () => {
  it('користи API кога API враќа валидни прашања', async () => {
    const blob = new Blob(['img'], { type: 'image/png' });
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        questions: [{ type: 'essay', text: 'API прашање' }],
      }),
    }));

    const r = await importQuestionsFromVisionFile(blob, { fetchImpl });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.source).toBe('api');
    expect(r.data[0].text).toBe('API прашање');
  });

  it('паѓа на tesseract fallback кога API не успева', async () => {
    const blob = new Blob(['img'], { type: 'image/png' });
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 503 }));

    const r = await importQuestionsFromVisionFile(blob, { fetchImpl });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.source).toBe('tesseract');
    expect(r.data.length).toBeGreaterThan(0);
  });
});
