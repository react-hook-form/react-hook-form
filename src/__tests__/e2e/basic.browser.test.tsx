import { describe, expect, it } from 'vitest';

import * as cy from './cy';
import { getRenderCount, expectRenderCountDelta, renderApp } from './renderApp';

describe('basic form validation', () => {
  it('should validate the form and reset the form', async () => {
    await renderApp('http://localhost:3000/basic/onSubmit');
    const renderCountStart = getRenderCount();
    await cy.click('button#submit');

    expect(document.activeElement).toHaveAttribute('name', 'nestItem.nest1');

    cy.expectInputError('input[name="firstName"]', 'firstName error');
    cy.expectInputError('input[name="nestItem.nest1"]', 'nest 1 error');
    cy.expectInputError('input[name="arrayItem.0.test1"]', 'array item 1 error');
    cy.expectInputError('input[name="lastName"]', 'lastName error');
    cy.expectInputError('select[name="selectNumber"]', 'selectNumber error');
    cy.expectInputError('select[name="multiple"]', 'multiple error');
    cy.expectInputError('input[name="minRequiredLength"]', 'minRequiredLength error');
    cy.expectInputError('input[name="radio"]', 'radio error');
    cy.expectInputError('input[name="checkbox"]', 'checkbox error');
    cy.expectInputError('input[name="checkboxArray"]', 'checkboxArray error');
    cy.expectInputError('input[name="validate"]', 'validate error');

    await cy.type('input[name="firstName"]', 'bill');
    await cy.type('input[name="firstName"]', 'a');
    await cy.type('input[name="arrayItem.0.test1"]', 'ab');
    await cy.type('input[name="nestItem.nest1"]', 'ab');
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
    await cy.type('input[name="validate"]', 'test');

    cy.expectInputError('input[name="pattern"]', 'pattern error');
    cy.expectInputError('input[name="minLength"]', 'minLength error');
    cy.expectInputError('input[name="min"]', 'min error');
    cy.expectInputError('input[name="max"]', 'max error');
    cy.expectInputError('input[name="minDate"]', 'minDate error');
    cy.expectInputError('input[name="maxDate"]', 'maxDate error');

    await cy.type('input[name="pattern"]', '23');
    await cy.type('input[name="minLength"]', 'bi');
    await cy.type('input[name="minRequiredLength"]', 'bi');
    await cy.selectOption('select[name="multiple"]', ['optionA']);
    await cy.check('input[name="radio"]', '1');
    await cy.clearAndType('input[name="min"]', '11');
    await cy.clearAndType('input[name="max"]', '19');
    await cy.type('input[name="minDate"]', '2019-08-01');
    await cy.type('input[name="maxDate"]', '2019-08-01');
    await cy.check('input[name="checkbox"]');
    await cy.check('input[name="checkboxArray"]', '3');
    await cy.selectOption('select[name="multiple"]', ['optionA', 'optionB']);

    cy.expectNoParagraphs();

    await cy.click('#submit');

    cy.expectPreJson('pre', {
      nestItem: { nest1: 'ab' },
      arrayItem: [{ test1: 'ab' }],
      firstName: 'billa',
      lastName: 'luo',
      min: '11',
      max: '19',
      minDate: '2019-08-01',
      maxDate: '2019-08-01',
      minLength: 'bbi',
      minRequiredLength: 'bi',
      selectNumber: '1',
      pattern: 'luo23',
      radio: '1',
      checkbox: true,
      checkboxArray: ['3'],
      multiple: ['optionA', 'optionB'],
      validate: 'test',
    });
    await cy.click('#submit');

    await cy.click('#resetForm');
    cy.expectEmptyValue('input[name="firstName"]');
    cy.expectEmptyValue('input[name="lastName"]');
    cy.expectValue('select[name="selectNumber"]', '');
    cy.expectEmptyValue('input[name="minRequiredLength"]');
    cy.expectEmptyValue('input[name="radio"]');
    cy.expectEmptyValue('input[name="max"]');
    cy.expectEmptyValue('input[name="min"]');
    cy.expectEmptyValue('input[name="minLength"]');
    cy.expectEmptyValue('input[name="checkbox"]');
    cy.expectEmptyValue('input[name="pattern"]');
    cy.expectEmptyValue('input[name="minDate"]');
    cy.expectEmptyValue('input[name="maxDate"]');
    cy.expectContains('#on-invalid-called-times', '1');
    expectRenderCountDelta(renderCountStart, 34);
  });

  it('should validate the form with onTouched mode', async () => {
    await renderApp('http://localhost:3000/basic/onTouched');
    const renderCountStart = getRenderCount();
    await cy.focus('input[name="nestItem.nest1"]');
    await cy.type('input[name="nestItem.nest1"]', 'test');
    await cy.clear('input[name="nestItem.nest1"]');
    cy.expectNoParagraphs();
    await cy.blur('input[name="nestItem.nest1"]');
    cy.expectInputError('input[name="nestItem.nest1"]', 'nest 1 error');

    await cy.focus('input[name="arrayItem.0.test1"]');
    await cy.blur('input[name="arrayItem.0.test1"]');
    cy.expectInputError('input[name="arrayItem.0.test1"]', 'array item 1 error');

    await cy.focus('select[name="selectNumber"]');
    await cy.blur('select[name="selectNumber"]');
    cy.expectInputError('select[name="selectNumber"]', 'selectNumber error');
    await cy.selectOption('select[name="selectNumber"]', '1');

    await cy.focus('input[name="radio"]');
    await cy.blur('input[name="radio"]');
    await cy.check('input[name="radio"]', '1');

    await cy.focus('input[name="checkbox"]');
    await cy.blur('input[name="checkbox"]');
    await cy.check('input[name="checkbox"]');
    await cy.blur('input[name="checkbox"]');

    await cy.type('input[name="nestItem.nest1"]', 'test');
    await cy.type('input[name="arrayItem.0.test1"]', 'test');

    cy.expectNoParagraphs();
    expectRenderCountDelta(renderCountStart, 10);
  });

  it('should validate the form with onBlur mode and reset the form', async () => {
    await renderApp('http://localhost:3000/basic/onBlur');
    const renderCountStart = getRenderCount();
    await cy.focus('input[name="nestItem.nest1"]');
    await cy.blur('input[name="nestItem.nest1"]');
    cy.expectInputError('input[name="nestItem.nest1"]', 'nest 1 error');
    await cy.type('input[name="nestItem.nest1"]', 'a');

    await cy.focus('input[name="arrayItem.0.test1"]');
    await cy.blur('input[name="arrayItem.0.test1"]');
    cy.expectInputError('input[name="arrayItem.0.test1"]', 'array item 1 error');
    await cy.type('input[name="arrayItem.0.test1"]', 'a');

    await cy.focus('input[name="firstName"]');
    await cy.blur('input[name="firstName"]');
    cy.expectInputError('input[name="firstName"]', 'firstName error');
    await cy.type('input[name="firstName"]', 'bill');

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
    await cy.type('input[name="minLength"]', 'b');
    await cy.blur('input[name="minLength"]');
    cy.expectInputError('input[name="minLength"]', 'minLength error');
    cy.expectInputError('input[name="min"]', 'min error');
    cy.expectInputError('input[name="max"]', 'max error');
    cy.expectInputError('input[name="minDate"]', 'minDate error');
    cy.expectInputError('input[name="maxDate"]', 'maxDate error');

    await cy.type('input[name="pattern"]', '23');
    await cy.type('input[name="minLength"]', 'bi');
    await cy.type('input[name="minRequiredLength"]', 'bi');
    await cy.selectOption('select[name="multiple"]', ['optionA']);
    await cy.focus('input[name="radio"]');
    await cy.blur('input[name="radio"]');
    await cy.check('input[name="radio"]', '1');
    await cy.clearAndType('input[name="min"]', '11');
    await cy.clearAndType('input[name="max"]', '19');
    await cy.type('input[name="minDate"]', '2019-08-01');
    await cy.type('input[name="maxDate"]', '2019-08-01');
    await cy.focus('input[name="checkbox"]');
    await cy.blur('input[name="checkbox"]');
    await cy.check('input[name="checkbox"]');
    await cy.blur('input[name="checkbox"]');
    cy.fireChange('select[name="selectNumber"]', '1');

    await cy.click('#resetForm');
    cy.expectEmptyValue('input[name="firstName"]');
    cy.expectEmptyValue('input[name="lastName"]');
    cy.expectValue('select[name="selectNumber"]', '');
    cy.expectEmptyValue('input[name="minRequiredLength"]');
    cy.expectEmptyValue('input[name="radio"]');
    cy.expectEmptyValue('input[name="max"]');
    cy.expectEmptyValue('input[name="min"]');
    cy.expectEmptyValue('input[name="minLength"]');
    cy.expectEmptyValue('input[name="checkbox"]');
    cy.expectEmptyValue('input[name="pattern"]');
    cy.expectEmptyValue('input[name="minDate"]');
    cy.expectEmptyValue('input[name="maxDate"]');
    expectRenderCountDelta(renderCountStart, 25);
  });

  it('should validate the form with onChange mode and reset the form', async () => {
    await renderApp('http://localhost:3000/basic/onChange');
    const renderCountStart = getRenderCount();
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
    await cy.selectOption('select[name="multiple"]', ['optionA']);
    await cy.check('input[name="radio"]', '1');
    await cy.clearAndType('input[name="min"]', '11');
    await cy.clearAndType('input[name="max"]', '19');
    await cy.type('input[name="minDate"]', '2019-08-01');
    await cy.type('input[name="maxDate"]', '2019-08-01');
    await cy.check('input[name="checkbox"]');

    cy.expectNoParagraphs();

    await cy.click('#resetForm');
    cy.expectEmptyValue('input[name="firstName"]');
    cy.expectEmptyValue('input[name="lastName"]');
    cy.expectValue('select[name="selectNumber"]', '');
    cy.expectEmptyValue('input[name="minRequiredLength"]');
    cy.expectEmptyValue('input[name="radio"]');
    cy.expectEmptyValue('input[name="max"]');
    cy.expectEmptyValue('input[name="min"]');
    cy.expectEmptyValue('input[name="minLength"]');
    cy.expectEmptyValue('input[name="checkbox"]');
    cy.expectEmptyValue('input[name="pattern"]');
    cy.expectEmptyValue('input[name="minDate"]');
    cy.expectEmptyValue('input[name="maxDate"]');
    expectRenderCountDelta(renderCountStart, 21);
  });
});
