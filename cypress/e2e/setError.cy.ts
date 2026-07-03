import { describe, expect, it } from 'vitest';

import * as cy from '../support/cy';
import { renderApp } from '../support/renderApp';

describe('form setError', () => {
  it('should contain 3 errors when page land', async () => {
    await renderApp('http://localhost:3000/setError');

    cy.expectContains('#error0', '0 wrong');
    cy.expectContains('#error1', '1 wrong');
    cy.expectContains('#error2', '2 wrong');
    cy.expectContains('#error3', '3 test');
    cy.expectContains('#error4', '4 required');
    cy.expectContains('#error5', '5 minLength');
    cy.expectContains(
      '#error',
      'testMessageThis is required.Minlength is 10This is requiredThis is minLength',
    );
  });

  it('should clear individual error', async () => {
    await renderApp('http://localhost:3000/setError');
    await cy.click('#clear1');
    await cy.click('#clear2');
    cy.expectContains('#error0', '0 wrong');
  });

  it('should clear an array of errors', async () => {
    await renderApp('http://localhost:3000/setError');
    await cy.click('#clearArray');
    cy.expectContains('#error0', '0 wrong');
  });

  it('should clear every errors', async () => {
    await renderApp('http://localhost:3000/setError');
    await cy.click('#clear');
    expect(cy.$('#errorContainer').children.length).toBe(0);
  });
});
