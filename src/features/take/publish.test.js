import { describe, it, expect, vi, beforeEach } from 'vitest';

const setDocMock = vi.fn();
const getDocMock = vi.fn();

vi.mock('firebase/firestore', () => ({
  doc: (_db, path) => ({ path }),
  setDoc: (...args) => setDocMock(...args),
  getDoc: (...args) => getDocMock(...args),
  serverTimestamp: () => '__ts__',
}));

vi.mock('../../lib/firebase', () => ({
  db: {},
  APP_ID: 'test-app',
}));

import {
  publishTest,
  loadPublishedTest,
  generateCode,
  generateResumeToken,
  saveResumeState,
  loadResumeState,
} from './publish';

const validTest = {
  title: 'Демо',
  language: 'mk',
  questions: [
    { id: 'q1', type: 'multiple', text: '1+1?', options: ['2', '3'], correct: 0, points: 1 },
  ],
};

beforeEach(() => {
  setDocMock.mockReset();
  getDocMock.mockReset();
});

describe('generateCode', () => {
  it('returns N chars from safe alphabet', () => {
    const c = generateCode(8);
    expect(c).toHaveLength(8);
    expect(c).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
  });
  it('default length 6', () => {
    expect(generateCode()).toHaveLength(6);
  });
});

describe('generateResumeToken', () => {
  it('returns default 12-char token', () => {
    const token = generateResumeToken();
    expect(token).toHaveLength(12);
    expect(token).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
  });
});

describe('publishTest', () => {
  it('writes valid test and returns code', async () => {
    setDocMock.mockResolvedValueOnce(undefined);
    const res = await publishTest(validTest, { code: 'ABC123', ownerUid: 'u1' });
    expect(res).toEqual({ ok: true, code: 'ABC123' });
    expect(setDocMock).toHaveBeenCalledTimes(1);
    const [ref, payload] = setDocMock.mock.calls[0];
    expect(ref.path).toBe('artifacts/test-app/publishedTests/ABC123');
    expect(payload.code).toBe('ABC123');
    expect(payload.ownerUid).toBe('u1');
    expect(payload.test.questions).toHaveLength(1);
  });

  it('rejects invalid test', async () => {
    const res = await publishTest({ title: 'x', questions: [{ type: 'unknown' }] });
    expect(res.ok).toBe(false);
    expect(setDocMock).not.toHaveBeenCalled();
  });

  it('rejects malformed code', async () => {
    const res = await publishTest(validTest, { code: 'a b' });
    expect(res.ok).toBe(false);
  });

  it('returns error on Firestore failure', async () => {
    setDocMock.mockRejectedValueOnce(new Error('boom'));
    const res = await publishTest(validTest, { code: 'ABC123' });
    expect(res).toEqual({ ok: false, error: 'boom' });
  });
});

describe('loadPublishedTest', () => {
  it('returns parsed test on hit', async () => {
    getDocMock.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ code: 'ABC123', test: validTest }),
    });
    const res = await loadPublishedTest('ABC123');
    expect(res.ok).toBe(true);
    expect(res.data.test.questions).toHaveLength(1);
  });

  it('returns not-found for missing doc', async () => {
    getDocMock.mockResolvedValueOnce({ exists: () => false });
    const res = await loadPublishedTest('ABC123');
    expect(res).toMatchObject({ ok: false, status: 'not-found' });
  });

  it('returns invalid for malformed code', async () => {
    const res = await loadPublishedTest('a');
    expect(res).toMatchObject({ ok: false, status: 'invalid' });
    expect(getDocMock).not.toHaveBeenCalled();
  });

  it('returns invalid when stored test fails schema', async () => {
    getDocMock.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ code: 'ABC123', test: { questions: [{ type: 'oops' }] } }),
    });
    const res = await loadPublishedTest('ABC123');
    expect(res).toMatchObject({ ok: false, status: 'invalid' });
  });

  it('returns network on throw', async () => {
    getDocMock.mockRejectedValueOnce(new Error('offline'));
    const res = await loadPublishedTest('ABC123');
    expect(res).toMatchObject({ ok: false, status: 'network' });
  });
});

describe('saveResumeState', () => {
  it('stores responses and returns resumeToken', async () => {
    setDocMock.mockResolvedValueOnce(undefined);
    const res = await saveResumeState({
      code: 'ABC123',
      resumeToken: 'TOKEN12345',
      responses: { q1: 1 },
    });

    expect(res).toEqual({ ok: true, resumeToken: 'TOKEN12345' });
    const [ref, payload] = setDocMock.mock.calls[0];
    expect(ref.path).toBe('artifacts/test-app/publishedResumes/ABC123__TOKEN12345');
    expect(payload.responses).toEqual({ q1: 1 });
  });

  it('rejects invalid inputs', async () => {
    expect((await saveResumeState({ code: 'ab', responses: {} })).ok).toBe(false);
    expect((await saveResumeState({ code: 'ABC123', responses: [] })).ok).toBe(false);
  });
});

describe('loadResumeState', () => {
  it('returns responses when found', async () => {
    getDocMock.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ responses: { q1: 2, q2: 'x' } }),
    });

    const res = await loadResumeState({ code: 'ABC123', resumeToken: 'TOKEN12345' });
    expect(res).toEqual({ ok: true, data: { responses: { q1: 2, q2: 'x' } } });
  });

  it('returns not-found for missing resume record', async () => {
    getDocMock.mockResolvedValueOnce({ exists: () => false });
    const res = await loadResumeState({ code: 'ABC123', resumeToken: 'TOKEN12345' });
    expect(res).toMatchObject({ ok: false, status: 'not-found' });
  });

  it('returns invalid for malformed input', async () => {
    const res = await loadResumeState({ code: 'ABC123', resumeToken: 'bad' });
    expect(res).toMatchObject({ ok: false, status: 'invalid' });
  });
});
