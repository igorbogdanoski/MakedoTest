const STEM_SUBJECT = 'stem';
const LANGUAGE_SUBJECT = 'languages';
const STEM_INDICATOR_CLASS = 'bg-indigo-400';
const LANGUAGE_INDICATOR_CLASS = 'bg-blue-400';

export function shouldShowSubjectIndicator(subjects) {
  if (!Array.isArray(subjects)) {
    return false;
  }

  return subjects.includes(STEM_SUBJECT) || subjects.includes(LANGUAGE_SUBJECT);
}

export function getSubjectIndicatorClass(subjects) {
  if (!Array.isArray(subjects)) {
    return LANGUAGE_INDICATOR_CLASS;
  }

  return subjects.includes(STEM_SUBJECT) ? STEM_INDICATOR_CLASS : LANGUAGE_INDICATOR_CLASS;
}
