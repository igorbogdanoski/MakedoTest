export const PRESENCE_ACTIVE_MS = 15000;
export const PRESENCE_RECENT_MS = 35000;
export const PRESENCE_STALE_MS = 90000;

function asNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function getPresenceActivityLevel(lastSeenAt, now = Date.now()) {
  const age = Math.max(0, now - asNumber(lastSeenAt));
  if (age <= PRESENCE_ACTIVE_MS) return 'active';
  if (age <= PRESENCE_RECENT_MS) return 'recent';
  if (age <= PRESENCE_STALE_MS) return 'idle';
  return 'stale';
}

export function pruneStalePresenceMap(presenceMap, now = Date.now()) {
  const next = {};
  for (const [actorId, entry] of Object.entries(presenceMap || {})) {
    if (!entry || typeof entry !== 'object') continue;
    const lastSeenAt = asNumber(entry.lastSeenAt);
    const level = getPresenceActivityLevel(lastSeenAt, now);
    if (level === 'stale') continue;
    next[actorId] = { ...entry, lastSeenAt, activity: level };
  }
  return next;
}

export function upsertPresenceEntry(presenceMap, presencePayload, now = Date.now()) {
  if (!presencePayload?.actorId) return pruneStalePresenceMap(presenceMap, now);
  const merged = {
    ...(presenceMap || {}),
    [presencePayload.actorId]: {
      ...presencePayload,
      activity: getPresenceActivityLevel(presencePayload.lastSeenAt, now),
    },
  };
  return pruneStalePresenceMap(merged, now);
}

export function getActiveCollaborators(presenceMap, now = Date.now()) {
  return Object.values(pruneStalePresenceMap(presenceMap, now)).filter(
    (entry) => entry.activity === 'active' || entry.activity === 'recent'
  );
}
