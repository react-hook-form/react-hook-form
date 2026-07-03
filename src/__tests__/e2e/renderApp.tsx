import { render } from '@testing-library/react';

import { AppRoutesAt } from './AppRoutes';

export function renderApp(url: string) {
  const path = new URL(url, 'http://localhost:3000').pathname;

  return render(AppRoutesAt(path));
}

export function parseAppPath(url: string) {
  return new URL(url, 'http://localhost:3000').pathname;
}
