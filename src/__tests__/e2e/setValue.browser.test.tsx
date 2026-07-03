import { describe, it } from 'vitest';

import * as cy from './cy';
import { expectRenderCountDelta, getRenderCount, renderApp } from './renderApp';

describe('form setValue', () => {
  it('should set input value, trigger validation and clear all errors', async () => {
    await renderApp('http://localhost:3000/setValue');
    const renderCountStart = getRenderCount();
    cy.expectValue('input[name="firstName"]', 'wrong');
    cy.expectValue('input[name="age"]', '2');
    cy.expectValue('input[name="array.0"]', 'array.0');
    cy.expectValue('input[name="array.1"]', 'array.1');
    cy.expectValue('input[name="array.2"]', 'array.2');
    cy.expectValue('input[name="object.firstName"]', 'firstName');
    cy.expectValue('input[name="object.lastName"]', 'lastName');
    cy.expectValue('input[name="object.middleName"]', 'middleName');
    cy.expectChecked('input[name="radio"]');
    cy.expectChecked('input[name="checkboxArray"][value="2"]');
    cy.expectChecked('input[name="checkboxArray"][value="3"]');
    cy.expectValue('select[name="select"]', 'a');
    cy.expectSelectValues('select[name="multiple"]', ['a', 'b']);
    await cy.waitFor(() => cy.expectContains('#trigger', 'Trigger error'));
    cy.expectNotExist('#lastName');
    cy.expectContains('#nestedValue', 'required');

    await cy.click('#submit');

    cy.expectContains('#lastName', 'Last name error');

    await cy.type('input[name="lastName"]', 'test');
    await cy.type('input[name="trigger"]', 'trigger');
    await cy.type('input[name="nestedValue"]', 'test');

    await cy.click('#submit');
    cy.expectNoParagraphs();
    expectRenderCountDelta(renderCountStart, 6);

    await cy.click('#setMultipleValues');
    cy.expectValue('input[name="array.0"]', 'array[0]1');
    cy.expectValue('input[name="array.1"]', 'array[1]1');
    cy.expectValue('input[name="array.2"]', 'array[2]1');
    cy.expectValue('input[name="object.firstName"]', 'firstName1');
    cy.expectValue('input[name="object.lastName"]', 'lastName1');
    cy.expectValue('input[name="object.middleName"]', 'middleName1');
    cy.expectValue('input[name="nestedValue"]', 'a,b');
    expectRenderCountDelta(renderCountStart, 6);
  });
});
