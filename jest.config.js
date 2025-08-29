/** @type {import('jest').Config} */
export const preset = 'ts-jest';
export const testEnvironment = 'jsdom';
export const roots = ['<rootDir>/src'];
export const testMatch = [
  '**/__tests__/**/*.test.(ts|tsx|js)',
  '**/*.(test|spec).(ts|tsx|js)'
];
export const transform = {
  '^.+\\.(ts|tsx)$': ['ts-jest', {
    tsconfig: {
      jsx: 'react-jsx',
    },
  }],
};
export const moduleNameMapper = {
  '^@/(.*)$': '<rootDir>/src/$1',
};
export const collectCoverageFrom = [
  'src/**/*.{ts,tsx}',
  '!src/**/*.d.ts',
  '!src/**/*.config.ts',
];
export const setupFilesAfterEnv = ['<rootDir>/src/__tests__/setup.ts'];