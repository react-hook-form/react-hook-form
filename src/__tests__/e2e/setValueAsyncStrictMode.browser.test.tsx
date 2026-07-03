import { describe, it } from 'vitest';

import * as cy from './cy';
import { renderApp } from './renderApp';

describe('form setValueAsyncStrictMode', () => {
  it('should set async input value correctly', async () => {
    renderApp('http://localhost:3000/setValueAsyncStrictMode');

    await cy.wait(100);
    await cy.click('#submit');
    cy.expectContains('p', '["test","A","B","C","D"]');
  });
});
