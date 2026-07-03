import { describe, it } from 'vitest';

import * as cy from './cy';
import { renderApp } from './renderApp';

describe('form trigger', () => {
  it('should trigger input validation', async () => {
    renderApp('http://localhost:3000/trigger-validation');

    cy.expectEmpty('#testError');
    cy.expectEmpty('#test1Error');
    cy.expectEmpty('#test2Error');

    await cy.click('#single');
    cy.expectContains('#testError', 'required');
    await cy.click('#single');

    await cy.click('#multiple');
    cy.expectContains('#test1Error', 'required');
    cy.expectContains('#test2Error', 'required');

    await cy.click('#multiple');
    cy.expectContains('#renderCount', '6');
  });
});
