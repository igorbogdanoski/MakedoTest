import { describe, it, expect } from 'vitest';
import { appendQuestionFromBank } from './bankOps';

describe('appendQuestionFromBank', () => {
  it('додава прашање со нов id', () => {
    const out = appendQuestionFromBank([{ id: 1 }], { id: 'bank-x', text: 'Q' }, () => 999);
    expect(out).toHaveLength(2);
    expect(out[1]).toEqual({ id: 999, text: 'Q' });
  });

  it('преку override id (number) — третиран како generator? не — се користи функција', () => {
    const out = appendQuestionFromBank([], { text: 'A' }, 42);
    expect(out[0].id).toBe(42);
  });

  it('non-array враќа []', () => {
    expect(appendQuestionFromBank(null, { text: 'A' })).toEqual([]);
  });

  it('null bank question враќа копија на постоечки questions', () => {
    const arr = [{ id: 1 }];
    const out = appendQuestionFromBank(arr, null);
    expect(out).toEqual(arr);
    expect(out).not.toBe(arr);
  });

  it('default generator користи Date.now', () => {
    const out = appendQuestionFromBank([], { text: 'X' });
    expect(typeof out[0].id).toBe('number');
    expect(out[0].id).toBeGreaterThan(0);
  });
});
