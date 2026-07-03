import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const migratedTests: string[] = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'scripts/vitest/migrated-tests.json'),
    'utf-8',
  ),
);

const unitTests = migratedTests.filter(
  (path) => !path.includes('.server.test.'),
);
const serverTests = migratedTests.filter((path) =>
  path.includes('.server.test.'),
);
const noMatch = ['src/__tests__/__never__/**'];

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    passWithNoTests: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: unitTests.length ? unitTests : noMatch,
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
          include: serverTests.length ? serverTests : noMatch,
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
