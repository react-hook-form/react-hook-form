import { cleanup, render } from '@testing-library/react';

import { AppRoutesAt } from './AppRoutes';

export function renderApp(url: string) {
  cleanup();
  const path = new URL(url, 'http://localhost:3000').pathname;

  return render(AppRoutesAt(path));
}

export function parseAppPath(url: string) {
  return new URL(url, 'http://localhost:3000').pathname;
}

export function getRenderCount() {
  return Number.parseInt(
    document.querySelector('#renderCount')?.textContent ?? '0',
    10,
  );
}

export function expectRenderCountDelta(from: number, delta: number) {
  const actual = getRenderCount() - from;
  expect(actual).toBeGreaterThanOrEqual(delta - 2);
  expect(actual).toBeLessThanOrEqual(delta + 2);
}
