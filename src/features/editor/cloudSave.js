export function buildSavePayload(testInfo, questions, now = new Date()) {
  return {
    testInfo,
    questions,
    updatedAt: now.toISOString(),
  };
}

export function buildVersionSnapshot(testInfo, questions, now = new Date()) {
  return {
    source: 'manual-save',
    createdAt: now.toISOString(),
    snapshot: {
      testInfo,
      questions,
    },
  };
}

export function buildSaveMessage(wasExisting) {
  return wasExisting
    ? 'Тестот е ажуриран и архивиран како нова верзија!'
    : 'Тестот е зачуван во Вашиот облак!';
}
