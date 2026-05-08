export const GRADING_SCALE_GRADES = [5, 4, 3, 2];

export function getGradingScaleGradesForDisplay() {
  return [...GRADING_SCALE_GRADES];
}

export function getGradingScaleThresholds(totalPoints) {
  return {
    5: Math.ceil(totalPoints * 0.9),
    4: Math.ceil(totalPoints * 0.75),
    3: Math.ceil(totalPoints * 0.6),
    2: Math.ceil(totalPoints * 0.45),
  };
}
