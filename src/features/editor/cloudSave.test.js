import { describe, expect, it } from 'vitest';
import { buildSaveMessage, buildSavePayload, buildVersionSnapshot } from './cloudSave.js';

describe('cloudSave helpers', () => {
  it('buildSavePayload returns testInfo, questions and ISO updatedAt', () => {
    const now = new Date('2024-01-15T10:30:00Z');
    const payload = buildSavePayload({ title: 'T' }, [{ id: 1 }], now);
    expect(payload).toEqual({
      testInfo: { title: 'T' },
      questions: [{ id: 1 }],
      updatedAt: '2024-01-15T10:30:00.000Z',
    });
  });

  it('buildSavePayload defaults updatedAt to current Date', () => {
    const payload = buildSavePayload({}, []);
    expect(typeof payload.updatedAt).toBe('string');
    expect(payload.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('buildVersionSnapshot wraps content into manual-save record', () => {
    const now = new Date('2024-02-20T08:00:00Z');
    const snap = buildVersionSnapshot({ a: 1 }, [{ id: 2 }], now);
    expect(snap).toEqual({
      source: 'manual-save',
      createdAt: '2024-02-20T08:00:00.000Z',
      snapshot: { testInfo: { a: 1 }, questions: [{ id: 2 }] },
    });
  });

  it('buildSaveMessage returns existing message when wasExisting truthy', () => {
    expect(buildSaveMessage(true)).toBe('Тестот е ажуриран и архивиран како нова верзија!');
  });

  it('buildSaveMessage returns new message when wasExisting falsy', () => {
    expect(buildSaveMessage(false)).toBe('Тестот е зачуван во Вашиот облак!');
    expect(buildSaveMessage(null)).toBe('Тестот е зачуван во Вашиот облак!');
  });
});
