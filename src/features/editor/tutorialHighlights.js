export function getTutorialStepHighlightClass(showTutorial, tutorialStep, targetStep, activeClass) {
  if (!showTutorial || tutorialStep !== targetStep) {
    return '';
  }

  return activeClass;
}
