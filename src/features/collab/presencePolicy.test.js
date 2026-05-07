import { describe, it, expect } from 'vitest';
import {
  PRESENCE_ACTIVE_MS,
  PRESENCE_RECENT_MS,
  PRESENCE_STALE_MS,
  getPresenceActivityLevel,
  pruneStalePresenceMap,
  upsertPresenceEntry,
  getActiveCollaborators,
} from './presencePolicy';

describe('presencePolicy', () => {
  it('classifies activity windows', () => {
    const now = 1_000_000;
    expect(getPresenceActivityLevel(now - 1000, now)).toBe('active');
    expect(getPresenceActivityLevel(now - (PRESENCE_ACTIVE_MS + 1000), now)).toBe('recent');
    expect(getPresenceActivityLevel(now - (PRESENCE_RECENT_MS + 1000), now)).toBe('idle');
    expect(getPresenceActivityLevel(now - (PRESENCE_STALE_MS + 1000), now)).toBe('stale');
  });

  it('prunes stale entries and enriches activity', () => {
    const now = 2_000_000;
    const pruned = pruneStalePresenceMap(
      {
        a1: { actorId: 'a1', lastSeenAt: now - 2000 },
        a2: { actorId: 'a2', lastSeenAt: now - (PRESENCE_STALE_MS + 5000) },
      },
      now
    );

    expect(Object.keys(pruned)).toEqual(['a1']);
    expect(pruned.a1.activity).toBe('active');
  });

  it('upserts payload and prunes stale map', () => {
    const now = 3_000_000;
    const next = upsertPresenceEntry(
      {
        old: { actorId: 'old', lastSeenAt: now - (PRESENCE_STALE_MS + 1) },
      },
      { actorId: 'new', lastSeenAt: now - 1000, displayName: 'Teacher' },
      now
    );

    expect(next.old).toBeUndefined();
    expect(next.new.displayName).toBe('Teacher');
    expect(next.new.activity).toBe('active');
  });

  it('returns only active/recent collaborators', () => {
    const now = 4_000_000;
    const list = getActiveCollaborators(
      {
        a: { actorId: 'a', lastSeenAt: now - 1000 },
        b: { actorId: 'b', lastSeenAt: now - (PRESENCE_RECENT_MS + 1000) },
      },
      now
    );
    expect(list).toHaveLength(1);
    expect(list[0].actorId).toBe('a');
  });
});
