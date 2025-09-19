/* eslint-disable @typescript-eslint/no-require-imports */
const config = require('./jest.config');

module.exports = {
  ...config,
  projects: config.projects.map((project) => ({
    ...project,
    transform: {
      ...project.transform,
      '^.+\\.tsx?$': 'babel-jest',
    },
  })),
};
