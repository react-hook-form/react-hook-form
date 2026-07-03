import { describe, it } from 'vitest';

import * as cy from './cy';
import { getRenderCount, expectRenderCountDelta, renderApp } from './renderApp';

describe('validate field criteria', () => {
  it('should validate the form, show all errors and clear all', async () => {
    await renderApp('http://localhost:3000/validate-field-criteria');
    const renderCountStart = getRenderCount();
    await cy.click('button#submit');
    cy.expectInputError('input[name="firstName"]', 'firstName required');
    await cy.type('input[name="firstName"]', 'te');
    cy.expectInputError('input[name="firstName"]', 'firstName minLength');
    await cy.type('input[name="firstName"]', 'testtesttest');

    cy.expectInputError('input[name="min"]', 'min required');
    await cy.type('input[name="min"]', '2');
    cy.expectInputError('input[name="min"]', 'min min');
    await cy.type('input[name="min"]', '32');
    cy.expectInputError('input[name="min"]', 'min max');
    await cy.clear('input[name="min"]');
    await cy.type('input[name="min"]', '10');

    cy.expectInputError('input[name="minDate"]', 'minDate required');
    await cy.type('input[name="minDate"]', '2019-07-01');
    cy.expectInputError('input[name="minDate"]', 'minDate min');
    await cy.type('input[name="minDate"]', '2019-08-01');

    cy.expectInputError('input[name="maxDate"]', 'maxDate required');
    await cy.type('input[name="maxDate"]', '2019-09-01');
    cy.expectInputError('input[name="maxDate"]', 'maxDate max');
    await cy.type('input[name="maxDate"]', '2019-08-01');

    cy.expectInputError('input[name="minLength"]', 'minLength required');
    await cy.type('input[name="minLength"]', '1');
    cy.expectInputError('input[name="minLength"]', 'minLength minLength');
    await cy.type('input[name="minLength"]', '12');

    cy.expectInputError('select[name="selectNumber"]', 'selectNumber required');
    await cy.selectOption('select[name="selectNumber"]', '12');

    cy.expectInputError('input[name="pattern"]', 'pattern required');
    await cy.type('input[name="pattern"]', 't');
    cy.expectInputError('input[name="pattern"]', 'pattern pattern');
    cy.expectContains('input[name="pattern"] + p + p', 'pattern minLength');
    await cy.clear('input[name="pattern"]');
    await cy.type('input[name="pattern"]', '12345');

    cy.expectInputError('select[name="multiple"]', 'multiple required');
    cy.expectContains('select[name="multiple"] + p + p', 'multiple validate');
    await cy.selectOption('select[name="multiple"]', 'optionA');
    await cy.selectOption('select[name="multiple"]', 'optionB');

    cy.expectInputError('input[name="validate"]', 'validate test');
    cy.expectContains('input[name="validate"] + p + p', 'validate test1');
    cy.expectContains('input[name="validate"] + p + p + p', 'validate test2');
    await cy.type('input[name="validate"]', 'test');

    cy.expectNoParagraphs();

    await cy.click('#trigger');
    cy.expectParagraphCount(2);
    cy.expectBoldCount(2);

    await cy.click('#clear');
    cy.expectNoParagraphs();
    cy.expectBoldCount(0);

    expectRenderCountDelta(renderCountStart, 27);
  });
});
