import { describe, it, expect } from 'vitest';
import {
  parseUploadPath,
  parseTakePath,
  parseTakeQuery,
  parseResumeToken,
  resolvePublicRoute,
  resolveTakeRoute,
  buildAttachmentUploadUrl,
  buildTakeUrl,
} from './route';

describe('parseTakePath', () => {
  it('matches /t/CODE', () => {
    expect(parseTakePath('/t/ABC123')).toEqual({ code: 'ABC123' });
  });
  it('matches with trailing slash', () => {
    expect(parseTakePath('/t/abc-123_X/')).toEqual({ code: 'abc-123_X' });
  });
  it('rejects too short', () => {
    expect(parseTakePath('/t/AB')).toBeNull();
  });
  it('rejects unrelated paths', () => {
    expect(parseTakePath('/editor')).toBeNull();
    expect(parseTakePath('/')).toBeNull();
  });
  it('rejects invalid chars', () => {
    expect(parseTakePath('/t/foo bar')).toBeNull();
  });
  it('handles empty input', () => {
    expect(parseTakePath('')).toBeNull();
    expect(parseTakePath(null)).toBeNull();
  });
});

describe('parseTakeQuery', () => {
  it('reads ?code=', () => {
    expect(parseTakeQuery('?code=ABC123')).toEqual({ code: 'ABC123' });
  });
  it('reads ?code= with resume token', () => {
    expect(parseTakeQuery('?code=ABC123&r=TOKEN123')).toEqual({
      code: 'ABC123',
      resumeToken: 'TOKEN123',
    });
  });
  it('rejects invalid code', () => {
    expect(parseTakeQuery('?code=ab')).toBeNull();
    expect(parseTakeQuery('?code=foo bar')).toBeNull();
  });
  it('returns null for empty', () => {
    expect(parseTakeQuery('')).toBeNull();
    expect(parseTakeQuery('?other=1')).toBeNull();
  });
});

describe('parseResumeToken', () => {
  it('reads valid token', () => {
    expect(parseResumeToken('?r=ABC123TOKEN')).toBe('ABC123TOKEN');
  });
  it('returns null for invalid token', () => {
    expect(parseResumeToken('?r=bad token')).toBeNull();
    expect(parseResumeToken('?r=abc')).toBeNull();
  });
});

describe('resolveTakeRoute', () => {
  it('prefers pathname', () => {
    expect(resolveTakeRoute({ pathname: '/t/ABC', search: '?code=XYZ' })).toEqual({
      code: 'ABC',
    });
  });
  it('includes resume token with pathname route', () => {
    expect(resolveTakeRoute({ pathname: '/t/ABC', search: '?r=RESTOKEN11' })).toEqual({
      code: 'ABC',
      resumeToken: 'RESTOKEN11',
    });
  });
  it('falls back to query', () => {
    expect(resolveTakeRoute({ pathname: '/', search: '?code=XYZ123' })).toEqual({
      code: 'XYZ123',
    });
  });
  it('returns null when neither matches', () => {
    expect(resolveTakeRoute({ pathname: '/', search: '' })).toBeNull();
  });
});

describe('parseUploadPath', () => {
  it('parses companion upload route with token params', () => {
    expect(parseUploadPath('/u/ABC123/q1', '?v=VER12&sig=s123&hash=h123&ts=100')).toEqual({
      code: 'ABC123',
      questionId: 'q1',
      verificationId: 'VER12',
      signature: 's123',
      payloadHash: 'h123',
      submittedAt: 100,
    });
  });
});

describe('resolvePublicRoute', () => {
  it('returns upload route when upload path is active', () => {
    expect(resolvePublicRoute({ pathname: '/u/ABC123/q1', search: '?v=VER12' })).toMatchObject({
      kind: 'upload',
      code: 'ABC123',
      questionId: 'q1',
    });
  });

  it('returns take route for take links', () => {
    expect(resolvePublicRoute({ pathname: '/t/ABC123', search: '' })).toEqual({
      kind: 'take',
      code: 'ABC123',
    });
  });
});

describe('buildTakeUrl', () => {
  it('joins origin and code', () => {
    expect(buildTakeUrl('ABC123', 'https://makedo.test')).toBe('https://makedo.test/t/ABC123');
  });
  it('strips trailing slash', () => {
    expect(buildTakeUrl('ABC', 'https://x.io/')).toBe('https://x.io/t/ABC');
  });
  it('throws without code', () => {
    expect(() => buildTakeUrl('')).toThrow();
  });
});

describe('buildAttachmentUploadUrl', () => {
  it('builds companion upload URL with query params', () => {
    expect(
      buildAttachmentUploadUrl(
        {
          code: 'ABC123',
          questionId: 'q1',
          verificationId: 'VER12',
          signature: 'sig',
          payloadHash: 'hash',
          submittedAt: 100,
        },
        'https://makedo.test'
      )
    ).toBe('https://makedo.test/u/ABC123/q1?v=VER12&sig=sig&hash=hash&ts=100');
  });
});
