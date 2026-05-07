import { describe, it, expect, vi } from 'vitest';
import { createRtdbCollabChannel } from './rtdbTransport';

describe('createRtdbCollabChannel', () => {
  it('returns unsupported when required args are missing', () => {
    const ch = createRtdbCollabChannel({
      database: null,
      appId: 'app',
      sessionId: 's1',
      onMessage: vi.fn(),
    });
    expect(ch.supported).toBe(false);
  });

  it('subscribes and forwards snapshot values', () => {
    const onMessage = vi.fn();
    const fakeRef = { path: 'x' };
    const dbApi = {
      ref: vi.fn(() => fakeRef),
      set: vi.fn(async () => {}),
      onValue: vi.fn((nodeRef, cb) => {
        cb({ val: () => ({ type: 'editor-sync' }) });
        return vi.fn();
      }),
    };

    const ch = createRtdbCollabChannel({
      database: {},
      appId: 'app',
      sessionId: 'test:1',
      onMessage,
      dbApi,
    });

    expect(ch.supported).toBe(true);
    expect(dbApi.ref).toHaveBeenCalledOnce();
    expect(onMessage).toHaveBeenCalledWith({ type: 'editor-sync' });
  });

  it('posts payload with set()', async () => {
    const dbApi = {
      ref: vi.fn(() => ({ path: 'x' })),
      set: vi.fn(async () => {}),
      onValue: vi.fn(() => vi.fn()),
    };

    const ch = createRtdbCollabChannel({
      database: {},
      appId: 'app',
      sessionId: 's1',
      onMessage: vi.fn(),
      dbApi,
    });

    await ch.post({ hello: 'world' });
    expect(dbApi.set).toHaveBeenCalledOnce();
  });

  it('calls error callback when listener fails', () => {
    const onError = vi.fn();
    const dbApi = {
      ref: vi.fn(() => ({ path: 'x' })),
      set: vi.fn(async () => {}),
      onValue: vi.fn((nodeRef, cb, errCb) => {
        errCb(new Error('permission-denied'));
        return vi.fn();
      }),
    };

    createRtdbCollabChannel({
      database: {},
      appId: 'app',
      sessionId: 's1',
      onMessage: vi.fn(),
      onError,
      dbApi,
    });

    expect(onError).toHaveBeenCalled();
  });
});
