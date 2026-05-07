import { describe, expect, it, vi, afterEach } from 'vitest';
import { requestServerSignedProof } from './proofClient';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('requestServerSignedProof', () => {
  it('returns token when api returns ok', async () => {
    const fakeToken = { signature: 'abc', verificationId: 'ABC123456789' };
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ ok: true, token: fakeToken }),
      }))
    );

    const token = await requestServerSignedProof({ v: 1, payloadHash: '123', submittedAt: 1 });
    expect(token).toEqual(fakeToken);
  });

  it('throws when api rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 503,
        json: async () => ({ ok: false, error: 'Signing key is not configured' }),
      }))
    );

    await expect(
      requestServerSignedProof({ v: 1, payloadHash: '123', submittedAt: 1 })
    ).rejects.toThrow('Signing key is not configured');
  });
});
