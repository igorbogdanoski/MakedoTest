import { onValue, ref, set, remove } from 'firebase/database';

function sanitizeSessionId(sessionId) {
  return String(sessionId || 'default').replace(/(\.|#|\$|\[|\]|\/)/g, '_');
}

function buildPath(appId, sessionId) {
  const safeSession = sanitizeSessionId(sessionId);
  return `artifacts/${appId}/collab/${safeSession}/latest`;
}

function buildPresencePath(appId, sessionId) {
  const safeSession = sanitizeSessionId(sessionId);
  return `artifacts/${appId}/collab/${safeSession}/presence`;
}

export function createRtdbCollabChannel({
  database,
  appId,
  sessionId,
  onMessage,
  onPresence,
  onError,
  actorId,
  dbApi = { ref, set, onValue, remove },
}) {
  if (!database || !appId || !sessionId) {
    return {
      post: () => {},
      close: () => {},
      supported: false,
    };
  }

  const nodeRef = dbApi.ref(database, buildPath(appId, sessionId));
  const presenceRootRef = dbApi.ref(database, buildPresencePath(appId, sessionId));
  const ownPresenceRef = actorId
    ? dbApi.ref(database, `${buildPresencePath(appId, sessionId)}/${sanitizeSessionId(actorId)}`)
    : null;

  const unsubscribe = dbApi.onValue(
    nodeRef,
    (snapshot) => {
      const value = snapshot?.val?.() ?? null;
      if (value) onMessage(value);
    },
    (error) => {
      if (typeof onError === 'function') {
        onError(error);
      }
    }
  );

  let unsubscribePresence = () => {};
  if (typeof onPresence === 'function') {
    unsubscribePresence =
      dbApi.onValue(
        presenceRootRef,
        (snapshot) => {
          const value = snapshot?.val?.() ?? {};
          onPresence(value);
        },
        (error) => {
          if (typeof onError === 'function') {
            onError(error);
          }
        }
      ) || (() => {});
  }

  return {
    post: async (payload) => {
      await dbApi.set(nodeRef, payload);
    },
    publishPresence: async (presencePayload) => {
      if (!ownPresenceRef) return;
      await dbApi.set(ownPresenceRef, presencePayload);
    },
    close: () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      if (typeof unsubscribePresence === 'function') unsubscribePresence();
      if (ownPresenceRef && typeof dbApi.remove === 'function') {
        dbApi.remove(ownPresenceRef).catch(() => {});
      }
    },
    supported: true,
  };
}
