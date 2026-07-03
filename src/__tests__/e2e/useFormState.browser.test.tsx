import { describe, it } from 'vitest';

import * as cy from './cy';
import { getRenderCount, expectRenderCountDelta, renderApp } from './renderApp';

describe('useFormState', () => {
  it('should subscribed to the form state without re-render the root', async () => {
    await renderApp('http://localhost:3000/useFormState');
    const renderCountStart = getRenderCount();
    await cy.click('button#submit');

    await cy.type('input[name="firstName"]', 'bill');
    await cy.type('input[name="firstName"]', 'a');
    await cy.type('input[name="arrayItem.0.test1"]', 'ab');
    await cy.type('input[name="nestItem.nest1"]', 'ab');
    await cy.type('input[name="lastName"]', 'luo123456');
    await cy.selectOption('select[name="selectNumber"]', '1');
    await cy.blur('select[name="selectNumber"]');
    await cy.type('input[name="pattern"]', 'luo');
    await cy.type('input[name="min"]', '1');
    await cy.type('input[name="max"]', '21');
    await cy.type('input[name="minDate"]', '2019-07-30');
    await cy.type('input[name="maxDate"]', '2019-08-02');
    await cy.clearAndType('input[name="lastName"]', 'luo');
    await cy.type('input[name="minLength"]', 'b');
    await cy.blur('input[name="minLength"]');

    cy.expectJson('#state', {
        isDirty: true,
        touched: [
          'nestItem',
          'firstName',
          'arrayItem',
          'lastName',
          'selectNumber',
          'minLength',
          'pattern',
          'min',
          'max',
          'minDate',
          'maxDate',
        ],
        dirty: [
          'nestItem',
          'arrayItem',
          'firstName',
          'lastName',
          'min',
          'max',
          'minDate',
          'maxDate',
          'minLength',
          'minRequiredLength',
          'selectNumber',
          'pattern',
        ],
        isSubmitted: true,
        isSubmitSuccessful: false,
        submitCount: 1,
        isValid: false,
      });

    await cy.type('input[name="pattern"]', '23');
    await cy.type('input[name="minLength"]', 'bi');
    await cy.type('input[name="minRequiredLength"]', 'bi');
    await cy.clearAndType('input[name="min"]', '11');
    await cy.clearAndType('input[name="max"]', '19');
    await cy.type('input[name="minDate"]', '2019-08-01');
    await cy.type('input[name="maxDate"]', '2019-08-01');

    cy.expectJson('#state', {
        isDirty: true,
        touched: [
          'nestItem',
          'firstName',
          'arrayItem',
          'lastName',
          'selectNumber',
          'minLength',
          'pattern',
          'min',
          'max',
          'minDate',
          'maxDate',
          'minRequiredLength',
        ],
        dirty: [
          'nestItem',
          'arrayItem',
          'firstName',
          'lastName',
          'min',
          'max',
          'minDate',
          'maxDate',
          'minLength',
          'minRequiredLength',
          'selectNumber',
          'pattern',
        ],
        isSubmitted: true,
        isSubmitSuccessful: false,
        submitCount: 1,
        isValid: true,
      });

    await cy.click('#submit');

    cy.expectJson('#state', {
        isDirty: true,
        touched: [
          'nestItem',
          'firstName',
          'arrayItem',
          'lastName',
          'selectNumber',
          'minLength',
          'pattern',
          'min',
          'max',
          'minDate',
          'maxDate',
          'minRequiredLength',
        ],
        dirty: [
          'nestItem',
          'arrayItem',
          'firstName',
          'lastName',
          'min',
          'max',
          'minDate',
          'maxDate',
          'minLength',
          'minRequiredLength',
          'selectNumber',
          'pattern',
        ],
        isSubmitted: true,
        isSubmitSuccessful: true,
        submitCount: 2,
        isValid: true,
      });

    await cy.click('#resetForm');

    cy.expectJson('#state', {
        isDirty: false,
        touched: [],
        dirty: [],
        isSubmitted: false,
        isSubmitSuccessful: false,
        submitCount: 0,
        isValid: true,
      });

    expectRenderCountDelta(renderCountStart, 1);
  });
});
