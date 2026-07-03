import { userEvent } from 'vitest/browser';

import { renderApp } from '../support/renderApp';

describe('form setValueAsyncStrictMode', () => {
  it('should set async input value correctly', async () => {
    await renderApp('http://localhost:3000/setValueAsyncStrictMode');
    await new Promise((resolve) => setTimeout(resolve, 100));
    await userEvent.click(document.querySelector('#submit')!);
    expect(document.querySelector('p')!.textContent).toContain(
      '["test","A","B","C","D"]',
    );
  });
});
