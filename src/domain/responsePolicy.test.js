import { describe, expect, it } from 'vitest';
import {
  createDefaultResponseConfig,
  isOpenResponseType,
  resolveResponseConfig,
} from './responsePolicy';

describe('responsePolicy', () => {
  it('detects open response types', () => {
    expect(isOpenResponseType('essay')).toBe(true);
    expect(isOpenResponseType('multiple')).toBe(false);
  });

  it('creates default response config for open tasks', () => {
    expect(createDefaultResponseConfig('short-answer')).toEqual({
      allowMathEditor: true,
      allowHandwrittenUpload: false,
      requireQrForAttachment: true,
    });
  });

  it('resolves config with overrides', () => {
    expect(
      resolveResponseConfig({
        type: 'essay',
        responseConfig: { allowMathEditor: false, allowHandwrittenUpload: true },
      })
    ).toEqual({
      allowMathEditor: false,
      allowHandwrittenUpload: true,
      requireQrForAttachment: true,
    });
  });
});
