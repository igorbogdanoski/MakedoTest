export function mapLegacyJsonRow(raw, id) {
  if (!raw || typeof raw !== 'object') return null;
  const type = raw.type || 'multiple';
  return {
    id,
    type,
    text: raw.text || '',
    options: raw.options || (type === 'multiple' ? ['', '', '', ''] : undefined),
    correct: raw.correct ?? 0,
    points: raw.points || 5,
    difficulty: raw.difficulty || 'medium',
    columns: raw.columns || 2,
    matches: raw.matches || undefined,
    tableData: raw.tableData || undefined,
  };
}

export function mapLegacyJsonImport(rawList, baseTimestamp = Date.now()) {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .map((row, i) => mapLegacyJsonRow(row, baseTimestamp + i))
    .filter((q) => q !== null);
}
