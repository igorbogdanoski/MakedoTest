export function determinePaperContentView(view) {
  if (view === 'analytics') {
    return 'analytics';
  }

  if (view === 'verify') {
    return 'verify';
  }

  if (view === 'answerSheet') {
    return 'answerSheet';
  }

  return 'default';
}

export function getPaperContentContainerClass(contentView) {
  const baseClass = 'relative z-10 flex-grow';

  if (contentView === 'answerSheet') {
    return `${baseClass} space-y-20`;
  }

  return baseClass;
}
