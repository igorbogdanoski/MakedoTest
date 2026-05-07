import crypto from 'node:crypto';
import { z } from 'zod';
import { validateBody } from '../../middleware/validateBody.js';

const PayloadSchema = z.object({
  v: z.number().int().default(1),
  scope: z.enum(['submission', 'question-upload']).default('submission'),
  testId: z.string().nullable().optional(),
  questionId: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  submittedAt: z.number().int().positive(),
  payloadHash: z.string().min(8).max(128),
  attachmentCount: z.number().int().min(0).default(0),
});

const ProofSignRequestSchema = z.object({
  payload: PayloadSchema,
});

const ProofVerifyRequestSchema = z.object({
  payload: PayloadSchema,
  signature: z.string().min(16).max(256),
});

function canonicalPayload(payload) {
  return JSON.stringify({
    v: payload.v ?? 1,
    scope: payload.scope ?? 'submission',
    testId: payload.testId ?? null,
    questionId: payload.questionId ?? null,
    code: payload.code ?? null,
    submittedAt: payload.submittedAt,
    payloadHash: payload.payloadHash,
    attachmentCount: Number(payload.attachmentCount || 0),
  });
}

export function signPayload(payload, signingKey) {
  const signature = crypto
    .createHmac('sha256', signingKey)
    .update(canonicalPayload(payload))
    .digest('hex');

  return {
    payload: {
      v: payload.v ?? 1,
      scope: payload.scope ?? 'submission',
      testId: payload.testId ?? null,
      questionId: payload.questionId ?? null,
      code: payload.code ?? null,
      submittedAt: payload.submittedAt,
      payloadHash: payload.payloadHash,
      attachmentCount: Number(payload.attachmentCount || 0),
    },
    signature,
    verificationId: signature.slice(0, 12).toUpperCase(),
  };
}

function timingSafeEqualHex(a, b) {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

/**
 * @param {{ payload: object }} body
 * @param {{ signingKey?: string }} deps
 */
export async function handleSignProof(body, deps = {}) {
  const signingKey = deps.signingKey ?? process.env.SUBMISSION_SIGNING_KEY;
  if (!signingKey) {
    throw new Error('Signing key is not configured');
  }

  return {
    ok: true,
    token: signPayload(body.payload, signingKey),
  };
}

/**
 * @param {{ payload: object, signature: string }} body
 * @param {{ signingKey?: string }} deps
 */
export async function handleVerifyProof(body, deps = {}) {
  const signingKey = deps.signingKey ?? process.env.SUBMISSION_SIGNING_KEY;
  if (!signingKey) {
    throw new Error('Signing key is not configured');
  }

  const expected = signPayload(body.payload, signingKey);
  const valid = timingSafeEqualHex(expected.signature, body.signature);

  return {
    ok: true,
    valid,
    verificationId: expected.verificationId,
  };
}

export const signProofRouteHandlers = [
  validateBody(ProofSignRequestSchema),
  async (req, res) => {
    try {
      const result = await handleSignProof(req.validatedBody);
      res.status(200).json(result);
    } catch (err) {
      const message = err?.message || 'Internal server error';
      if (message.includes('Signing key is not configured')) {
        res.status(503).json({ ok: false, error: message });
        return;
      }
      console.error('[submission/proof] Internal error:', err);
      res.status(500).json({ ok: false, error: 'Internal server error' });
    }
  },
];

export const verifyProofRouteHandlers = [
  validateBody(ProofVerifyRequestSchema),
  async (req, res) => {
    try {
      const result = await handleVerifyProof(req.validatedBody);
      res.status(200).json(result);
    } catch (err) {
      const message = err?.message || 'Internal server error';
      if (message.includes('Signing key is not configured')) {
        res.status(503).json({ ok: false, error: message });
        return;
      }
      console.error('[submission/verify] Internal error:', err);
      res.status(500).json({ ok: false, error: 'Internal server error' });
    }
  },
];
