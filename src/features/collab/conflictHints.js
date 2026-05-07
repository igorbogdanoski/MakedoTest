export function buildConflictHint({ hadLocalDivergence, remoteDisplayName }) {
  if (!hadLocalDivergence) {
    return `${remoteDisplayName || 'Колега'} направи промени во оваа сесија.`;
  }
  return `${remoteDisplayName || 'Колега'} внесе промени додека имавте локални измени. Проверете го резултатот и користете Undo ако треба.`;
}

export function formatLastEditAgeMs(ageMs) {
  const ms = Number(ageMs || 0);
  if (ms < 5000) return 'токму сега';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `пред ${sec}s`;
  const min = Math.round(sec / 60);
  return `пред ${min}m`;
}
