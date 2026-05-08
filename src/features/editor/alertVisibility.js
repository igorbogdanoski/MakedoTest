export function shouldShowDuplicateAlert(duplicateAlert) {
  return !!duplicateAlert;
}

export function shouldShowLastEditBadge(lastRemoteEdit) {
  return !!lastRemoteEdit;
}

export function shouldShowConflictHint(conflictHint) {
  return !!conflictHint;
}
