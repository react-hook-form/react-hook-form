import { describe, it } from 'vitest';

import * as cy from './cy';
import { expectRenderCountDelta, getRenderCount, renderApp } from './renderApp';

describe('manual register form validation', () => {
  it('should validate the form', async () => {
    await renderApp('http://localhost:3000/manual-register-form');
    const renderCountStart = getRenderCount();
    await cy.click('#submit');

    cy.expectInputError('input[name="firstName"]', 'firstName error');
    cy.expectInputError('input[name="lastName"]', 'lastName error');
    cy.expectInputError('select[name="selectNumber"]', 'selectNumber error');
    cy.expectInputError(
      'input[name="minRequiredLength"]',
      'minRequiredLength error',
    );
    cy.expectInputError('input[name="radio"]', 'radio error');

    await cy.type('input[name="firstName"]', 'bill');
    await cy.type('input[name="lastName"]', 'luo123456');
    cy.expectInputError('input[name="lastName"]', 'lastName error');
    await cy.selectOption('select[name="selectNumber"]', '1');
    await cy.type('input[name="pattern"]', 'luo');
    await cy.type('input[name="min"]', '1');
    await cy.type('input[name="max"]', '21');
    await cy.type('input[name="minDate"]', '2019-07-30');
    await cy.type('input[name="maxDate"]', '2019-08-02');
    await cy.clearAndType('input[name="lastName"]', 'luo');
    await cy.type('input[name="minLength"]', 'b');

    cy.expectInputError('input[name="pattern"]', 'pattern error');
    cy.expectInputError('input[name="minLength"]', 'minLength error');
    cy.expectInputError('input[name="min"]', 'min error');
    cy.expectInputError('input[name="max"]', 'max error');
    cy.expectInputError('input[name="minDate"]', 'minDate error');
    cy.expectInputError('input[name="maxDate"]', 'maxDate error');

    await cy.type('input[name="pattern"]', '23');
    await cy.type('input[name="minLength"]', 'bi');
    await cy.type('input[name="minRequiredLength"]', 'bi');
    await cy.check('input[name="radio"]', '1');
    await cy.clearAndType('input[name="min"]', '11');
    await cy.clearAndType('input[name="max"]', '19');
    await cy.type('input[name="minDate"]', '2019-08-01');
    await cy.type('input[name="maxDate"]', '2019-08-01');
    await cy.check('input[name="checkbox"]');

    cy.expectNoParagraphs();
    expectRenderCountDelta(renderCountStart, 45);
  });
});
