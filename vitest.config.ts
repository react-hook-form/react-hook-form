import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-hook-form': resolve(__dirname, 'src/index.ts'),
    },
  },
  test: {
    globals: true,
    passWithNoTests: true,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/types/**',
        'src/**/__tests__/**',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          pool: 'forks',
          isolate: true,
          fileParallelism: false,
          maxWorkers: 1,
          include: ['src/__tests__/**/*.test.ts?(x)'],
          exclude: [
            '**/*.server.test.ts?(x)',
            'cypress/**',
            '**/*.browser.test.tsx',
          ],
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
        resolve: {
          alias: {
            'react-hook-form': resolve(__dirname, 'dist/index.esm.mjs'),
          },
        },
        test: {
          name: 'browser',
          include: ['cypress/e2e/**/*.cy.ts', 'src/**/*.browser.test.tsx'],
          testTimeout: 30000,
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
