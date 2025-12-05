module.exports = {
    testEnvironment: 'node',
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    testTimeout: 30000,
    detectOpenHandles: true,
    setupFilesAfterEnv: ['./tests/setup.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    maxWorkers: 1
  };