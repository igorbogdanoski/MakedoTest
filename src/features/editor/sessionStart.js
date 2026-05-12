export function buildSessionStart(testInfo, subject) {
  const nextTestInfo = subject ? { ...testInfo, subject } : testInfo;
  return {
    nextTestInfo,
    nextView: 'editor',
  };
}
