export function buildCollabStatusBadgeText(collabSupported, collabTransport, collabSessionId) {
  if (!collabSupported) {
    return 'Collab unsupported';
  }

  const transportLabel = collabTransport === 'cloud' ? 'RTDB' : 'Local';
  return `${transportLabel} • ${collabSessionId}`;
}

export function buildOnlineCollaboratorsBadgeText(activeCollaborators, maxNames = 2) {
  const count = activeCollaborators.length;
  if (count === 0) {
    return 'Online 0';
  }

  const names = activeCollaborators
    .slice(0, maxNames)
    .map((p) => p.displayName || 'Teacher')
    .join(', ');

  return `Online ${count} • ${names}`;
}

export function buildLastEditBadgeText(lastRemoteEdit, nowMs, formatDuration) {
  const age = formatDuration(nowMs - lastRemoteEdit.ts);
  return `Last edit: ${lastRemoteEdit.displayName} ${age}`;
}
