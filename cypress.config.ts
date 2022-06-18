import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      /* eslint-disable-next-line */
      return require('./cypress/plugins/index.ts')(on, config);
    },
    baseUrl: 'http://localhost:3000/',
  },
});
