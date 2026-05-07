import { onValue, ref, set } from 'firebase/database';

function sanitizeSessionId(sessionId) {
  return String(sessionId || 'default').replace(/(\.|#|\$|\[|\]|\/)/g, '_');
}

function buildPath(appId, sessionId) {
  const safeSession = sanitizeSessionId(sessionId);
  return `artifacts/${appId}/collab/${safeSession}/latest`;
}

export function createRtdbCollabChannel({
  database,
  appId,
  sessionId,
  onMessage,
  onError,
  dbApi = { ref, set, onValue },
}) {
  if (!database || !appId || !sessionId) {
    return {
      post: () => {},
      close: () => {},
      supported: false,
    };
  }

  const nodeRef = dbApi.ref(database, buildPath(appId, sessionId));
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

  return {
    post: async (payload) => {
      await dbApi.set(nodeRef, payload);
    },
    close: () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    },
    supported: true,
  };
}
