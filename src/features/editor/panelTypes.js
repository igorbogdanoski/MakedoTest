export function getPaperPanelType(paperContentView) {
  if (paperContentView === 'analytics') {
    return 'analytics';
  }
  if (paperContentView === 'verify') {
    return 'verify';
  }
  if (paperContentView === 'answerSheet') {
    return 'answerSheet';
  }
  return 'questions';
}

export function isAnalyticsPanelType(panelType) {
  return panelType === 'analytics';
}

export function isVerifyPanelType(panelType) {
  return panelType === 'verify';
}

export function isAnswerSheetPanelType(panelType) {
  return panelType === 'answerSheet';
}

export function isQuestionsPanelType(panelType) {
  return panelType === 'questions';
}
