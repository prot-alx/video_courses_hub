// Temporary simplified middleware file
// TODO: Fix TypeScript issues and restore full middleware functionality

export const createLoggerMiddleware = () => {
  console.log("Logger middleware temporarily disabled");
  return null;
};

export const createStorageSync = () => {
  console.log("Storage sync temporarily disabled");
  return null;
};

export const withValidation = <T>(store: T): T => {
  return store;
};
