import { describe, it } from 'vitest';

import * as cy from '../support/cy';
import { renderApp } from '../support/renderApp';

describe('isValid', () => {
  it('should showing valid correctly with build in validation', async () => {
    await renderApp('http://localhost:3000/isValid/build-in/defaultValue');
    cy.expectContains('#isValid', 'false');

    await cy.type('input[name="firstName"]', 'test');
    cy.expectContains('#isValid', 'false');
    await cy.type('input[name="lastName"]', 'test');
    cy.expectContains('#isValid', 'true');
    await cy.click('#toggle');
    cy.expectContains('#isValid', 'false');
    await cy.click('#toggle');
    await cy.waitFor(() => cy.expectContains('#isValid', 'true'));
  });

  it('should showing valid correctly with build in validation and default values supplied', async () => {
    await renderApp('http://localhost:3000/isValid/build-in/defaultValues');
    await cy.waitFor(() => cy.expectContains('#isValid', 'true'));

    await cy.clear('input[name="firstName"]');
    cy.expectContains('#isValid', 'false');
    await cy.click('#toggle');
    cy.expectContains('#isValid', 'false');
  });

  it('should showing valid correctly with schema validation', async () => {
    await renderApp('http://localhost:3000/isValid/schema/defaultValue');
    cy.expectContains('#isValid', 'false');

    await cy.type('input[name="firstName"]', 'test');
    cy.expectContains('#isValid', 'false');
    await cy.type('input[name="lastName"]', 'test');
    cy.expectContains('#isValid', 'true');
    await cy.click('#toggle');
    cy.expectContains('#isValid', 'false');
    await cy.click('#toggle');
    await cy.type('input[name="firstName"]', 'test');
    await cy.waitFor(() => cy.expectContains('#isValid', 'true'));
  });

  it('should showing valid correctly with schema validation and default value supplied', async () => {
    await renderApp('http://localhost:3000/isValid/schema/defaultValues');
    await cy.waitFor(() => cy.expectContains('#isValid', 'true'));

    await cy.clear('input[name="firstName"]');
    cy.expectContains('#isValid', 'false');
    await cy.type('input[name="firstName"]', 'test');
    await cy.waitFor(() => cy.expectContains('#isValid', 'true'));
    await cy.click('#toggle');
    await cy.waitFor(() => cy.expectContains('#isValid', 'false'));
    await cy.click('#toggle');
    await cy.type('input[name="firstName"]', 't');
    await cy.waitFor(() => cy.expectContains('#isValid', 'true'));
  });
});
