import { describe, it, expect, vi } from 'vitest';
import {
  buildCollabSessionId,
  buildEditorSyncPayload,
  buildPresencePayload,
  parseEditorSyncPayload,
  parsePresencePayload,
  createActorId,
  createBroadcastCollabChannel,
} from './session';

describe('collab session helpers', () => {
  it('builds session id from active test', () => {
    expect(buildCollabSessionId({ activeTestId: 'abc', userId: 'u1' })).toBe('test:abc');
  });

  it('falls back to user draft session id', () => {
    expect(buildCollabSessionId({ activeTestId: null, userId: 'u1' })).toBe('draft:u1');
  });

  it('builds and parses valid sync payload', () => {
    const payload = buildEditorSyncPayload({
      actorId: 'actor-1',
      activeTestId: 't1',
      testInfo: { title: 'Тест' },
      questions: [{ id: 1, type: 'essay', text: 'A' }],
    });
    const parsed = parseEditorSyncPayload(payload);
    expect(parsed).toBeTruthy();
    expect(parsed?.actorId).toBe('actor-1');
    expect(parsed?.activeTestId).toBe('t1');
  });

  it('returns null for invalid payload shape', () => {
    expect(parseEditorSyncPayload({ type: 'editor-sync', data: { foo: 1 } })).toBeNull();
  });

  it('builds and parses presence payload', () => {
    const payload = buildPresencePayload({
      actorId: 'actor-2',
      userId: 'u1',
      displayName: 'Teacher A',
      sessionId: 'test:abc',
    });
    const parsed = parsePresencePayload(payload);
    expect(parsed).toBeTruthy();
    expect(parsed?.actorId).toBe('actor-2');
    expect(parsed?.displayName).toBe('Teacher A');
  });

  it('returns null for invalid presence payload', () => {
    expect(parsePresencePayload({ type: 'presence' })).toBeNull();
  });

  it('creates actor id', () => {
    const id = createActorId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(5);
  });

  it('returns unsupported channel when BroadcastChannel is unavailable', () => {
    const original = globalThis.BroadcastChannel;
    // @ts-ignore
    delete globalThis.BroadcastChannel;
    const channel = createBroadcastCollabChannel('s1', vi.fn());
    expect(channel.supported).toBe(false);
    channel.post({});
    channel.publishPresence({});
    channel.close();
    if (original) globalThis.BroadcastChannel = original;
  });
});
