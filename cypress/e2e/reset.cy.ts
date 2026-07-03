import * as cy from '../support/cy';
import { renderApp } from '../support/renderApp';

describe('form reset', () => {
  it('should be able to re-populate the form while reset', async () => {
    await renderApp('http://localhost:3000/reset');
    await cy.type('input[name="firstName"]', '0 wrong');
    await cy.type('input[name="array.1"]', '1 wrong');
    await cy.type('input[name="objectData.test"]', '2 wrong');
    await cy.type('input[name="lastName"]', 'lastName');
    await cy.type('input[name="deepNest.level1.level2.data"]', 'whatever');

    await cy.click('button');

    cy.expectValue('input[name="firstName"]', 'bill');
    cy.expectValue('input[name="lastName"]', 'luo');
    cy.expectValue('input[name="array.1"]', 'test');
    cy.expectValue('input[name="objectData.test"]', 'data');
    cy.expectValue('input[name="deepNest.level1.level2.data"]', 'hey');
  });

  it('should be able to re-populate the form while reset keeping dirty values', async () => {
    await renderApp('http://localhost:3000/resetKeepDirty');
    cy.expectValue('input[name="firstName"]', '');
    cy.expectValue('input[name="users"]', 'users#0');
    cy.expectValue('input[name="objectData.test"]', '');
    cy.expectValue('input[name="lastName"]', '');
    cy.expectValue('input[name="deepNest.level1.level2.data"]', '');

    await cy.clickButtonContaining('Add item');
    cy.expectValue('input[name="users"]', 'users#1');
    await cy.clickButtonContaining('button');

    cy.expectValue('input[name="firstName"]', 'bill');
    cy.expectValue('input[name="lastName"]', 'luo');
    cy.expectValue('input[name="users"]', 'users#1');
    cy.expectValue('input[name="objectData.test"]', 'data');
    cy.expectValue('input[name="deepNest.level1.level2.data"]', 'hey');
  });
});
