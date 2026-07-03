import { describe, it } from 'vitest';

import * as cy from './cy';
import { getRenderCount, expectRenderCountDelta, renderApp } from './renderApp';

describe('customSchemaValidation form validation', () => {
  it('should validate the form with onSubmit mode', async () => {
    await renderApp('http://localhost:3000/customSchemaValidation/onSubmit');
    const renderCountStart = getRenderCount();
    await cy.click('button');

    cy.expectFocusedAttr('name', 'firstName');

    cy.expectInputError('input[name="firstName"]', 'firstName error');
    cy.expectInputError('input[name="lastName"]', 'lastName error');
    cy.expectInputError('select[name="selectNumber"]', 'selectNumber error');
    cy.expectInputError('input[name="minRequiredLength"]', 'minRequiredLength error');
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
    await cy.type('input[name="minLength"]', '2');
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
    expectRenderCountDelta(renderCountStart, 25);
  });

  it('should validate the form with onBlur mode', async () => {
    await renderApp('http://localhost:3000/customSchemaValidation/onBlur');
    const renderCountStart = getRenderCount();
    await cy.focus('input[name="firstName"]');
    await cy.blur('input[name="firstName"]');
    cy.expectInputError('input[name="firstName"]', 'firstName error');
    await cy.type('input[name="firstName"]', 'bill');
    await cy.focus('input[name="lastName"]');
    await cy.blur('input[name="lastName"]');
    cy.expectInputError('input[name="lastName"]', 'lastName error');
    await cy.type('input[name="lastName"]', 'luo123456');
    await cy.blur('input[name="lastName"]');
    cy.expectInputError('input[name="lastName"]', 'lastName error');
    await cy.focus('select[name="selectNumber"]');
    await cy.blur('select[name="selectNumber"]');
    cy.expectInputError('select[name="selectNumber"]', 'selectNumber error');
    await cy.selectOption('select[name="selectNumber"]', '1');
    await cy.type('input[name="pattern"]', 'luo');
    await cy.type('input[name="min"]', '1');
    await cy.type('input[name="max"]', '21');
    await cy.type('input[name="minDate"]', '2019-07-30');
    await cy.type('input[name="maxDate"]', '2019-08-02');
    await cy.clearAndType('input[name="lastName"]', 'luo');
    await cy.blur('input[name="lastName"]');
    await cy.type('input[name="minLength"]', '2');
    await cy.blur('input[name="minLength"]');

    cy.expectInputError('input[name="minLength"]', 'minLength error');
    cy.expectInputError('input[name="min"]', 'min error');
    cy.expectInputError('input[name="max"]', 'max error');
    cy.expectInputError('input[name="minDate"]', 'minDate error');
    cy.expectInputError('input[name="maxDate"]', 'maxDate error');

    await cy.type('input[name="pattern"]', '23');
    await cy.clearAndType('input[name="minLength"]', 'bi');
    await cy.type('input[name="minRequiredLength"]', 'bi');
    await cy.focusAt('input[name="radio"]', 0);
    await cy.blurAt('input[name="radio"]', 0);
    await cy.waitFor(() =>
      cy.expectInputError('input[name="radio"]', 'radio error'),
    );
    await cy.check('input[name="radio"]', '1');
    await cy.blurAt('input[name="radio"]', 0);
    await cy.clearAndType('input[name="min"]', '11');
    await cy.clearAndType('input[name="max"]', '19');
    await cy.type('input[name="minDate"]', '2019-08-01');
    await cy.type('input[name="maxDate"]', '2019-08-01');
    await cy.blur('input[name="maxDate"]');
    await cy.blur('input[name="minRequiredLength"]');
    await cy.check('input[name="checkbox"]');
    await cy.blur('input[name="checkbox"]');

    await cy.waitFor(() => cy.expectNoErrorMessages());
  });

  it('should validate the form with onChange mode', async () => {
    await renderApp('http://localhost:3000/customSchemaValidation/onChange');
    const renderCountStart = getRenderCount();
    await cy.type('input[name="firstName"]', 'bill');
    await cy.focus('input[name="lastName"]');
    await cy.type('input[name="lastName"]', 'luo123456');
    await cy.clear('input[name="lastName"]');
    cy.expectInputError('input[name="lastName"]', 'lastName error');
    await cy.type('input[name="lastName"]', 'luo123456');
    cy.expectInputError('input[name="lastName"]', 'lastName error');
    await cy.selectOption('select[name="selectNumber"]', '1');
    await cy.selectOption('select[name="selectNumber"]', '');
    cy.expectInputError('select[name="selectNumber"]', 'selectNumber error');
    await cy.selectOption('select[name="selectNumber"]', '1');
    await cy.type('input[name="pattern"]', 'luo');
    await cy.type('input[name="min"]', '1');
    await cy.type('input[name="max"]', '21');
    await cy.type('input[name="minDate"]', '2019-07-30');
    await cy.type('input[name="maxDate"]', '2019-08-02');
    await cy.clearAndType('input[name="lastName"]', 'luo');
    await cy.type('input[name="minLength"]', '2');

    cy.expectInputError('input[name="minLength"]', 'minLength error');
    cy.expectInputError('input[name="min"]', 'min error');
    cy.expectInputError('input[name="max"]', 'max error');
    cy.expectInputError('input[name="minDate"]', 'minDate error');
    cy.expectInputError('input[name="maxDate"]', 'maxDate error');

    await cy.type('input[name="pattern"]', '23');
    await cy.type('input[name="minLength"]', 'bi');
    await cy.type('input[name="minRequiredLength"]', 'bi');
    await cy.focusAt('input[name="radio"]', 0);
    await cy.check('input[name="radio"]', '1');
    await cy.clearAndType('input[name="min"]', '11');
    await cy.clearAndType('input[name="max"]', '19');
    await cy.type('input[name="minDate"]', '2019-08-01');
    await cy.type('input[name="maxDate"]', '2019-08-01');
    await cy.check('input[name="checkbox"]');

    cy.expectNoParagraphs();
    expectRenderCountDelta(renderCountStart, 22);
  });
});
