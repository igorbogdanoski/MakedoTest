import '@testing-library/jest-dom/vitest';
import { afterAll, beforeAll, vi } from 'vitest';

// Ensure React 18 treats the test environment as act-enabled.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const ACT_WARNING_NEEDLE = 'not wrapped in act';

function containsActWarning(args) {
  return args.some((arg) =>
    String(arg ?? '')
      .toLowerCase()
      .includes(ACT_WARNING_NEEDLE)
  );
}

function createConsoleGuard(original) {
  return (...args) => {
    if (containsActWarning(args)) {
      throw new Error(
        `React act warning detected. Tests must await/wrap state updates.\n${args.join(' ')}`
      );
    }
    original(...args);
  };
}

beforeAll(() => {
  const originalError = console.error.bind(console);
  const originalWarn = console.warn.bind(console);

  vi.spyOn(console, 'error').mockImplementation(createConsoleGuard(originalError));
  vi.spyOn(console, 'warn').mockImplementation(createConsoleGuard(originalWarn));
});

afterAll(() => {
  vi.restoreAllMocks();
});
