import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { vi } from 'vitest';

export async function renderApp(url: string) {
  cleanup();
  vi.resetModules();

  window.history.replaceState({}, '', new URL(url).pathname);
  const { default: App } = await import('@app/app');

  return render(<App />);
}
