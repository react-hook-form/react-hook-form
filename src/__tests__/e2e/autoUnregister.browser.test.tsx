import { describe, it } from 'vitest';

import * as cy from './cy';
import { renderApp } from './renderApp';

describe('autoUnregister', () => {
  it('should keep all inputs data when inputs get unmounted', async () => {
    renderApp('http://localhost:3000/autoUnregister');
    await cy.type('input[name="test"]', 'test');
    await cy.type('input[name="test1"]', 'test1');
    await cy.check('input[name="test2"]');
    await cy.check('input[name="test3"]');
    await cy.selectOption('select[name="test4"]', 'Bill');
    await cy.click('#input-ReactSelect > div');
    await cy.clickAt('#input-ReactSelect > div > div', 1);

    await cy.click('button');
    await cy.click('button');

    cy.expectValue('input[name="test"]', 'test');
    cy.expectValue('input[name="test1"]', 'test1');
    cy.expectChecked('input[name="test2"]');
    cy.expectChecked('input[name="test3"]');
    cy.expectValue('select[name="test4"]', 'bill');
    cy.expectContains(
      '#input-ReactSelect > div > div > div > div',
      'Strawberry',
    );
  });
});
