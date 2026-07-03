import { describe, it } from 'vitest';

import * as cy from './cy';
import { expectRenderCountDelta, getRenderCount, renderApp } from './renderApp';

describe('form setValue with schema', () => {
  it('should set input value, trigger validation and clear all errors', async () => {
    await renderApp('http://localhost:3000/setValueWithSchema');
    const renderCountStart = getRenderCount();
    await cy.type('input[name="firstName"]', 'a');
    cy.expectInputError('input[name="firstName"]', 'firstName error');
    cy.expectParagraphCount(1);
    await cy.type('input[name="firstName"]', 'asdasdasdasd');

    await cy.type('input[name="lastName"]', 'a');
    cy.expectInputError('input[name="lastName"]', 'lastName error');
    cy.expectParagraphCount(1);
    await cy.type('input[name="lastName"]', 'asdasdasdasd');

    await cy.type('input[name="age"]', 'a2323');

    await cy.click('#submit');
    cy.expectParagraphCount(1);
    cy.expectInputError('input[name="requiredField"]', 'RequiredField error');

    await cy.click('#setValue');
    cy.expectValue('input[name="requiredField"]', 'test123456789');
    cy.expectNoParagraphs();

    expectRenderCountDelta(renderCountStart, 34);
  });
});
