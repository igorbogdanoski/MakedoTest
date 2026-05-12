export function toggleTestInfoFlag(testInfo, key) {
  if (!testInfo || typeof testInfo !== 'object' || typeof key !== 'string' || !key) {
    return testInfo;
  }
  return { ...testInfo, [key]: !testInfo[key] };
}

export function setTestInfoField(testInfo, key, value) {
  if (!testInfo || typeof testInfo !== 'object' || typeof key !== 'string' || !key) {
    return testInfo;
  }
  return { ...testInfo, [key]: value };
}

export function applyNextLayout(testInfo, getNextLayout) {
  if (!testInfo || typeof testInfo !== 'object' || typeof getNextLayout !== 'function') {
    return testInfo;
  }
  return { ...testInfo, layout: getNextLayout(testInfo.layout) };
}
