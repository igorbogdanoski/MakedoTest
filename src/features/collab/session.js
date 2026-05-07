import { nanoid } from 'nanoid';
import { decodeEditorStateFromYjsUpdate, encodeEditorStateAsYjsUpdate } from './yjsCodec';

export function buildCollabSessionId({ activeTestId, userId }) {
  if (activeTestId) return `test:${activeTestId}`;
  if (userId) return `draft:${userId}`;
  return `draft:anonymous`;
}

export function buildEditorSyncPayload({ testInfo, questions, activeTestId, actorId }) {
  const yUpdate = encodeEditorStateAsYjsUpdate({
    testInfo,
    questions,
    activeTestId,
  });
  return {
    type: 'editor-sync',
    actorId,
    ts: Date.now(),
    yUpdate,
    data: {
      testInfo,
      questions,
      activeTestId: activeTestId || null,
    },
  };
}

export function parseEditorSyncPayload(payload) {
  if (!payload || payload.type !== 'editor-sync') return null;
  if (!payload.data || !payload.data.testInfo || !Array.isArray(payload.data.questions))
    return null;
  const decoded = Array.isArray(payload.yUpdate)
    ? decodeEditorStateFromYjsUpdate(payload.yUpdate)
    : null;
  return {
    actorId: payload.actorId || null,
    ts: Number(payload.ts || 0),
    testInfo: decoded?.testInfo || payload.data.testInfo,
    questions: decoded?.questions || payload.data.questions,
    activeTestId: decoded?.activeTestId || payload.data.activeTestId || null,
  };
}

export function createActorId() {
  return nanoid(10);
}

export function createBroadcastCollabChannel(sessionId, onMessage) {
  if (typeof BroadcastChannel === 'undefined') {
    return {
      post: () => {},
      close: () => {},
      supported: false,
    };
  }

  const channel = new BroadcastChannel(`makedotest-collab-${sessionId}`);
  const handler = (event) => onMessage(event.data);
  channel.addEventListener('message', handler);

  return {
    post: (payload) => channel.postMessage(payload),
    close: () => {
      channel.removeEventListener('message', handler);
      channel.close();
    },
    supported: true,
  };
}
