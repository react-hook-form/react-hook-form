/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('./jest.config');

module.exports = {
  ...config,
  projects: config.projects.map((project) => ({
    ...project,
    moduleNameMapper: {
      ...(project.moduleNameMapper ?? {}),
      'react-compiler-runtime-polyfill':
        '<rootDir>/scripts/jest/react-compiler-runtime-polyfill.js',
    },
    transform: {
      ...project.transform,
      '^.+\\.tsx?$': 'babel-jest',
    },
  })),
};
