import "@testing-library/jest-dom";

// Подавляем предупреждения act() в тестах
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: (string | string[])[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: An update to")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
