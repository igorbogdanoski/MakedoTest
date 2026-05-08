export function shouldShowGradingScale(testInfo) {
  return !!testInfo?.showScale;
}

export function shouldShowSmartBadge(subject) {
  return (subject?.length ?? 0) > 5;
}

export function getSmartBadgeText(subject) {
  if (!subject || subject.length <= 5) return '';
  return subject.split(' ')[0];
}
