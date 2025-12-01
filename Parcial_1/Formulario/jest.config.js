module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'Controladores/**/*.js',
      'rutas/**/*.js'
    ],
    testMatch: [
      '**/tests/**/*.test.js'
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    verbose: true
  };