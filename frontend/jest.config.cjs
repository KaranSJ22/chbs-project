module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  moduleNameMapper: {
    // 1. Handle CSS imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // 2. Handle Image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/tests/__mocks__/fileMock.js',

    // 3. NEW: Fix for "import.meta" error
    // Any import ending in "config/api" will be redirected to our mock file
    '^.*/config/api$': '<rootDir>/src/tests/__mocks__/apiMock.js',
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
};