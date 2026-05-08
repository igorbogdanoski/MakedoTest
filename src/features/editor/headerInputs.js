const SCHOOL_HEADER_SEPARATOR = ' ';

export function buildSchoolHeaderValue(testInfo) {
  const schoolType = testInfo?.schoolType || '';
  const school = testInfo?.school || '';
  return [schoolType, school].filter(Boolean).join(SCHOOL_HEADER_SEPARATOR);
}

export function parseSchoolHeaderValue(value) {
  const parts = String(value || '')
    .trim()
    .split(SCHOOL_HEADER_SEPARATOR)
    .filter(Boolean);
  return {
    schoolType: parts[0] || '',
    school: parts.slice(1).join(SCHOOL_HEADER_SEPARATOR),
  };
}

export function applySchoolHeaderInput(testInfo, value) {
  return {
    ...testInfo,
    ...parseSchoolHeaderValue(value),
  };
}
