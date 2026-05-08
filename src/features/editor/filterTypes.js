function getSubjectFlags(subject = '') {
  const subj = String(subject).toLowerCase();
  return {
    isSTEM:
      subj.includes('мат') || subj.includes('физ') || subj.includes('хем') || subj.includes('наук'),
    isLang: subj.includes('мак') || subj.includes('анг') || subj.includes('јаз'),
    isGeo: subj.includes('гео'),
  };
}

function isSubjectRelevant(type, flags) {
  return (
    (flags.isSTEM && type.subjects.includes('stem')) ||
    (flags.isLang && type.subjects.includes('languages')) ||
    (flags.isGeo && type.subjects.includes('geometry'))
  );
}

export function buildFilteredQuestionTypes({
  questionTypes = [],
  typeSearch = '',
  subject = '',
  activeCategory = 'all',
}) {
  let types = [...questionTypes];

  if (typeSearch) {
    const search = typeSearch.toLowerCase();
    types = types.filter((type) => type.label.toLowerCase().includes(search));
  }

  const subjectFlags = getSubjectFlags(subject);

  types.sort((a, b) => {
    const aRelevant = isSubjectRelevant(a, subjectFlags);
    const bRelevant = isSubjectRelevant(b, subjectFlags);

    if (aRelevant && !bRelevant) return -1;
    if (!aRelevant && bRelevant) return 1;

    return (b.priority || 0) - (a.priority || 0);
  });

  if (activeCategory === 'all') {
    return types;
  }

  return types.filter(
    (type) => type.subjects.includes(activeCategory) || type.subjects.includes('all')
  );
}
