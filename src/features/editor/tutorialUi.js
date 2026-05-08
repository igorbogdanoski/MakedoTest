const ACTIVE_DOT_CLASS = 'w-10 bg-indigo-600';
const INACTIVE_DOT_CLASS = 'w-2 bg-slate-200';

export function getTutorialProgressDotClass(index, tutorialStep) {
  return index === tutorialStep ? ACTIVE_DOT_CLASS : INACTIVE_DOT_CLASS;
}

export function shouldAdvanceTutorialStep(tutorialStep, totalSteps) {
  return tutorialStep < totalSteps - 1;
}

export function getTutorialNextButtonLabel(tutorialStep, totalSteps) {
  return shouldAdvanceTutorialStep(tutorialStep, totalSteps) ? 'Следно' : 'Започни';
}
