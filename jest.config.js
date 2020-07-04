/* eslint-disable @typescript-eslint/no-var-requires */
const { defaults: tsjPresets } = require('ts-jest/presets');
const jestPresets = require('@testing-library/react-native/jest-preset');

const getTestMatch = (name) =>
  ['**/+([a-zA-Z])', name, '(spec|test).ts?(x)'].filter(Boolean).join('.');

const common = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.jest.json',
    },
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
};

const web = {
  ...common,
  displayName: 'Web',
  testMatch: [getTestMatch()],
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
};

const server = {
  ...common,
  displayName: 'Server',
  testMatch: [getTestMatch('server')],
  testEnvironment: 'node',
};

const native = {
  ...common,
  displayName: 'Native',
  preset: '@testing-library/react-native',
  testMatch: [getTestMatch('native')],
  transform: {
    ...tsjPresets.transform,
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.jest.json',
      babelConfig: true,
    },
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\](?!react-native)[/\\\\].+',
  ],
  setupFiles: [...jestPresets.setupFiles],
};

module.exports = {
  projects: [web, server, native],
};
