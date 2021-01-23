/* eslint-disable @typescript-eslint/no-var-requires */
const { defaults: tsjPresets } = require('ts-jest/presets');
const jestPresets = require('@testing-library/react-native/jest-preset');

const common = {
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  rootDir: '.',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
    },
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
};

const web = {
  ...common,
  displayName: {
    name: 'Web',
    color: 'cyan',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/scripts/jest/setup.ts'],
};

const server = {
  ...common,
  displayName: {
    name: 'Server',
    color: 'blue',
  },
  testMatch: ['**/+([a-zA-Z]).server.(spec|test).ts?(x)'],
  testEnvironment: 'node',
};

const native = {
  ...common,
  displayName: {
    name: 'Native',
    color: 'magenta',
  },
  preset: '@testing-library/react-native',
  testMatch: ['**/+([a-zA-Z]).native.(spec|test).ts?(x)'],
  transform: {
    ...tsjPresets.transform,
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
      babelConfig: true,
    },
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\](?!react-native)[/\\\\].+',
  ],
  setupFiles: [...jestPresets.setupFiles],
  setupFilesAfterEnv: ['<rootDir>/scripts/jest/setup.native.ts'],
};

const getProjects = () => {
  const testEnv = process.env.TEST_ENV;
  if (!testEnv) {
    return [web, server, native];
  }

  switch (testEnv) {
    case 'web':
      return [web];
    case 'server':
      return [server];
    case 'native':
      return [native];
  }
};

module.exports = {
  collectCoverageFrom: [
    '**/**/*.{ts,tsx}',
    '!**/**/*.test.{ts,tsx}',
    '!**/src/types/**',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  projects: getProjects(),
};
