import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Browser-mode config, isolated from the Jest suite via the `.browser.test.tsx`
// pattern. Real-browser rendering is required to reproduce the <Activity> bug:
// jsdom/happy-dom flush the offscreen subtree and mask it.
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.browser.test.tsx'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
});
