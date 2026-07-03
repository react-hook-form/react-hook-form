import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    passWithNoTests: true,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          pool: 'forks',
          poolOptions: {
            forks: {
              isolate: true,
            },
          },
          fileParallelism: false,
          maxWorkers: 1,
          include: ['src/__tests__/**/*.test.ts?(x)'],
          exclude: ['**/*.server.test.ts?(x)', '**/*.browser.test.tsx'],
          setupFiles: ['scripts/vitest/setup.ts'],
          environmentOptions: {
            jsdom: {
              customExportConditions: [''],
            },
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.server.test.ts?(x)'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.tsx'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
