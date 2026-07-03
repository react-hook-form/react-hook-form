import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@app/app';
import { cleanup, render } from '@testing-library/react';

export async function renderApp(url: string) {
  cleanup();

  const path = new URL(url, 'http://localhost:3000').pathname;

  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

export function parseAppPath(url: string) {
  return new URL(url, 'http://localhost:3000').pathname;
}

export function getRenderCount() {
  const el =
    document.querySelector('#renderCount') ?? document.querySelector('#count');
  return Number.parseInt(el?.textContent ?? '0', 10);
}

export function expectRenderCountDelta(from: number, delta: number) {
  const actual = getRenderCount() - from;
  expect(actual).toBeGreaterThanOrEqual(delta - 2);
  expect(actual).toBeLessThanOrEqual(delta + 2);
}
