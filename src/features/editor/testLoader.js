export const LOAD_TEST_CONFIRM_MESSAGE =
  'Дали сте сигурни дека сакате да го вчитате овој тест? Моменталните промени ќе бидат изгубени.';

export const DELETE_TEST_CONFIRM_MESSAGE = 'Избриши тест?';

export function buildLoadTestState(test) {
  if (!test || typeof test !== 'object') return null;
  return {
    activeTestId: test.id ?? null,
    questions: Array.isArray(test.questions) ? test.questions : [],
    testInfo: test.testInfo && typeof test.testInfo === 'object' ? test.testInfo : {},
  };
}
