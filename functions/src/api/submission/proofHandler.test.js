import { describe, expect, it } from 'vitest';
import { handleSignProof, handleVerifyProof, signPayload } from './proofHandler.js';

describe('submission proof signing', () => {
  const payload = {
    v: 1,
    testId: 't1',
    code: 'ABC123',
    submittedAt: 1_700_000_000_000,
    payloadHash: 'abcd1234efgh5678',
    attachmentCount: 2,
  };

  it('signs payload with deterministic signature for same input', async () => {
    const a = await handleSignProof({ payload }, { signingKey: 'secret-key' });
    const b = await handleSignProof({ payload }, { signingKey: 'secret-key' });

    expect(a.ok).toBe(true);
    expect(a.token.signature).toBe(b.token.signature);
    expect(a.token.verificationId).toHaveLength(12);
  });

  it('verifies valid signature', async () => {
    const signed = signPayload(payload, 'secret-key');
    const verify = await handleVerifyProof(
      { payload: signed.payload, signature: signed.signature },
      { signingKey: 'secret-key' }
    );

    expect(verify.ok).toBe(true);
    expect(verify.valid).toBe(true);
    expect(verify.verificationId).toBe(signed.verificationId);
  });

  it('rejects tampered payload signature', async () => {
    const signed = signPayload(payload, 'secret-key');
    const verify = await handleVerifyProof(
      {
        payload: { ...signed.payload, attachmentCount: 9 },
        signature: signed.signature,
      },
      { signingKey: 'secret-key' }
    );

    expect(verify.ok).toBe(true);
    expect(verify.valid).toBe(false);
  });
});
