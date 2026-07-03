import { describe, it } from 'vitest';

import * as cy from './cy';
import { getRenderCount, expectRenderCountDelta, renderApp } from './renderApp';

describe('re-validate mode', () => {
  it('should re-validate the form only onSubmit with mode onSubmit and reValidateMode onSubmit', async () => {
    await renderApp('http://localhost:3000/re-validate-mode/onSubmit/onSubmit');
    const renderCountStart = getRenderCount();
    await cy.click('button#submit');

    cy.expectInputError('input[name="firstName"]', 'firstName error');
    cy.expectInputError('input[name="lastName"]', 'lastName error');

    await cy.type('input[name="firstName"]', 'luo123456');
    await cy.type('input[name="lastName"]', 'luo12');

    cy.expectInputError('input[name="firstName"]', 'firstName error');
    cy.expectInputError('input[name="lastName"]', 'lastName error');

    await cy.click('button#submit');

    cy.expectNoParagraphs();
    expectRenderCountDelta(renderCountStart, 3);
  });

  it('should re-validate the form only onBlur with mode onSubmit and reValidateMode onBlur', async () => {
    await renderApp('http://localhost:3000/re-validate-mode/onSubmit/onBlur');
    const renderCountStart = getRenderCount();
    await cy.focus('input[name="firstName"]');
    await cy.blur('input[name="firstName"]');

    await cy.focus('input[name="lastName"]');
    await cy.blur('input[name="lastName"]');
    cy.expectNoParagraphs();

    await cy.click('button#submit');

    cy.expectInputError('input[name="firstName"]', 'firstName error');
    cy.expectInputError('input[name="lastName"]', 'lastName error');

    await cy.type('input[name="firstName"]', 'luo123456');
    cy.expectInputError('input[name="firstName"]', 'firstName error');
    await cy.blur('input[name="firstName"]');
    await cy.type('input[name="lastName"]', 'luo12');
    cy.expectInputError('input[name="lastName"]', 'lastName error');
    await cy.blur('input[name="lastName"]');

    cy.expectNoParagraphs();
    expectRenderCountDelta(renderCountStart, 4);
  });

  it('should re-validate the form only onSubmit with mode onBlur and reValidateMode onSubmit', async () => {
    await renderApp('http://localhost:3000/re-validate-mode/onBlur/onSubmit');
    const renderCountStart = getRenderCount();
    await cy.click('button#submit');

    cy.expectInputError('input[name="firstName"]', 'firstName error');
    cy.expectInputError('input[name="lastName"]', 'lastName error');

    await cy.type('input[name="firstName"]', 'luo123456');
    cy.expectInputError('input[name="firstName"]', 'firstName error');
    await cy.blur('input[name="firstName"]');
    await cy.type('input[name="lastName"]', 'luo12');
    cy.expectInputError('input[name="lastName"]', 'lastName error');
    await cy.blur('input[name="lastName"]');

    cy.expectInputError('input[name="firstName"]', 'firstName error');
    cy.expectInputError('input[name="lastName"]', 'lastName error');

    await cy.click('button#submit');

    cy.expectNoParagraphs();
    expectRenderCountDelta(renderCountStart, 3);
  });

  it('should re-validate the form only onSubmit with mode onChange and reValidateMode onSubmit', async () => {
    await renderApp('http://localhost:3000/re-validate-mode/onChange/onSubmit');
    const renderCountStart = getRenderCount();
    await cy.click('button#submit');

    cy.expectInputError('input[name="firstName"]', 'firstName error');
    cy.expectInputError('input[name="lastName"]', 'lastName error');

    await cy.type('input[name="firstName"]', 'luo123456');
    cy.expectInputError('input[name="firstName"]', 'firstName error');
    await cy.type('input[name="lastName"]', 'luo12');
    cy.expectInputError('input[name="lastName"]', 'lastName error');

    cy.expectInputError('input[name="firstName"]', 'firstName error');
    cy.expectInputError('input[name="lastName"]', 'lastName error');

    await cy.click('button#submit');

    cy.expectNoParagraphs();
    expectRenderCountDelta(renderCountStart, 3);
  });

  it('should re-validate the form onBlur only with mode onBlur and reValidateMode onBlur', async () => {
    await renderApp('http://localhost:3000/re-validate-mode/onBlur/onBlur');
    const renderCountStart = getRenderCount();
    await cy.focus('input[name="firstName"]');
    await cy.blur('input[name="firstName"]');
    cy.expectInputError('input[name="firstName"]', 'firstName error');
    await cy.focus('input[name="lastName"]');
    await cy.blur('input[name="lastName"]');
    cy.expectInputError('input[name="lastName"]', 'lastName error');

    await cy.type('input[name="firstName"]', 'luo123456');
    cy.expectInputError('input[name="firstName"]', 'firstName error');
    await cy.blur('input[name="firstName"]');
    await cy.type('input[name="lastName"]', 'luo12');
    cy.expectInputError('input[name="lastName"]', 'lastName error');
    await cy.blur('input[name="lastName"]');

    cy.expectNoParagraphs();
    expectRenderCountDelta(renderCountStart, 5);
  });

  it('should re-validate the form onChange with mode onBlur and reValidateMode onChange', async () => {
    await renderApp('http://localhost:3000/re-validate-mode/onBlur/onChange');
    const renderCountStart = getRenderCount();
    await cy.focus('input[name="firstName"]');
    await cy.blur('input[name="firstName"]');
    cy.expectInputError('input[name="firstName"]', 'firstName error');
    await cy.focus('input[name="lastName"]');
    await cy.blur('input[name="lastName"]');
    cy.expectInputError('input[name="lastName"]', 'lastName error');

    await cy.clear('input[name="firstName"]');
    await cy.clear('input[name="lastName"]');

    await cy.click('button#submit');

    await cy.type('input[name="firstName"]', 'luo123456');
    await cy.type('input[name="lastName"]', 'luo12');

    cy.expectNoParagraphs();
    expectRenderCountDelta(renderCountStart, 6);
  });
});
