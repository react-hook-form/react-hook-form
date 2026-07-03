import * as cy from '../support/cy';
import { renderApp } from '../support/renderApp';

describe('defaultValues async', () => {
  it('should populate defaultValue async for inputs', async () => {
    await renderApp('http://localhost:3000/default-values-async');
    await cy.wait(10);

    await cy.waitFor(() => cy.expectValue('input[name="test"]', 'test'));
    cy.expectValue('input[name="test1.firstName"]', 'firstName');
    cy.expectValue('input[name="test1.lastName.0"]', 'lastName0');
    cy.expectValue('input[name="test1.lastName.1"]', 'lastName1');
    cy.expectCheckedAt('input[name="checkbox"]', 0);
    cy.expectCheckedAt('input[name="checkbox"]', 1);

    await cy.clickAt('input[name="checkbox"]', 0);
    await cy.click('#toggle');
    await cy.click('#toggle');

    cy.expectNotCheckedAt('input[name="checkbox"]', 0);
    cy.expectCheckedAt('input[name="checkbox"]', 1);
    await cy.clickAt('input[name="checkbox"]', 1);

    await cy.click('#toggle');
    await cy.click('#toggle');

    cy.expectNotCheckedAt('input[name="checkbox"]', 0);
    cy.expectNotCheckedAt('input[name="checkbox"]', 1);
  });
});
