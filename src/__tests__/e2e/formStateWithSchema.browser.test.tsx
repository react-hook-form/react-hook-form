import { describe, it } from 'vitest';

import * as cy from './cy';
import { expectRenderCountDelta, getRenderCount, renderApp } from './renderApp';

describe('form state with schema validation', () => {
  it('should return correct form state with onSubmit mode', async () => {
    await renderApp('http://localhost:3000/formStateWithSchema/onSubmit');
    const renderCountStart = getRenderCount();
    cy.expectJson('#state', {
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: [],
      isDirty: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="firstName"]', 'test');
    cy.blurInput('input[name="firstName"]');
    cy.expectJson('#state', {
      dirty: ['firstName'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.clear('input[name="firstName"]');
    cy.expectJson('#state', {
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName'],
      isDirty: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="firstName"]', 'test');
    await cy.type('input[name="lastName"]', 'test');
    cy.blurInput('input[name="lastName"]');
    cy.expectJson('#state', {
      dirty: ['firstName', 'lastName'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.clear('input[name="lastName"]');

    await cy.click('#submit');
    cy.expectJson('#state', {
      dirty: ['firstName'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="lastName"]', 'test');
    await cy.click('#submit');
    cy.expectJson('#state', {
      dirty: ['firstName', 'lastName'],
      isSubmitted: true,
      submitCount: 2,
      touched: ['firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });
    await cy.selectOption('select[name="select"]', '1');
    expectRenderCountDelta(renderCountStart, 13);
  });

  it('should return correct form state with onChange mode', async () => {
    await renderApp('http://localhost:3000/formState/onChange');
    const renderCountStart = getRenderCount();
    cy.expectJson('#state', {
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: [],
      isDirty: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="firstName"]', 'test');
    await cy.blur('input[name="firstName"]');
    cy.expectJson('#state', {
      dirty: ['firstName'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.clear('input[name="firstName"]');
    cy.expectJson('#state', {
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName'],
      isDirty: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="firstName"]', 'test');
    await cy.type('input[name="lastName"]', 'test');
    await cy.blur('input[name="lastName"]');
    cy.expectJson('#state', {
      dirty: ['firstName', 'lastName'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await cy.clear('input[name="lastName"]');

    await cy.click('#submit');
    cy.expectJson('#state', {
      dirty: ['firstName'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="lastName"]', 'test');
    await cy.click('#submit');
    cy.expectJson('#state', {
      dirty: ['firstName', 'lastName'],
      isSubmitted: true,
      submitCount: 2,
      touched: ['firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });
    expectRenderCountDelta(renderCountStart, 13);
  });

  it('should return correct form state with onBlur mode', async () => {
    await renderApp('http://localhost:3000/formState/onBlur');
    const renderCountStart = getRenderCount();
    cy.expectJson('#state', {
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: [],
      isDirty: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="firstName"]', 'test');
    await cy.blur('input[name="firstName"]');
    cy.expectJson('#state', {
      dirty: ['firstName'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.clear('input[name="firstName"]');
    cy.expectJson('#state', {
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName'],
      isDirty: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="firstName"]', 'test');
    await cy.type('input[name="lastName"]', 'test');
    await cy.blur('input[name="lastName"]');
    cy.expectJson('#state', {
      dirty: ['firstName', 'lastName'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await cy.clear('input[name="lastName"]');

    await cy.click('#submit');
    cy.expectJson('#state', {
      dirty: ['firstName'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="lastName"]', 'test');
    await cy.click('#submit');
    cy.expectJson('#state', {
      dirty: ['firstName', 'lastName'],
      isSubmitted: true,
      submitCount: 2,
      touched: ['firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });
    expectRenderCountDelta(renderCountStart, 13);
  });

  it('should reset dirty value when inputs reset back to default with onSubmit mode', async () => {
    await renderApp('http://localhost:3000/formState/onSubmit');
    const renderCountStart = getRenderCount();
    await cy.type('input[name="firstName"]', 'test');
    await cy.blur('input[name="firstName"]');
    await cy.type('input[name="lastName"]', 'test');
    await cy.blur('input[name="lastName"]');

    cy.expectJson('#state', {
      dirty: ['firstName', 'lastName'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await cy.clear('input[name="firstName"]');
    await cy.clear('input[name="lastName"]');

    cy.expectJson('#state', {
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName', 'lastName'],
      isDirty: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.selectOption('select[name="select"]', 'test1');
    await cy.blur('select[name="select"]');
    cy.expectJson('#state', {
      dirty: ['select'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName', 'lastName', 'select'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });
    await cy.selectOption('select[name="select"]', '');
    cy.expectJson('#state', {
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName', 'lastName', 'select'],
      isDirty: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.click('input[name="checkbox"]');
    await cy.blur('input[name="checkbox"]');
    cy.expectJson('#state', {
      dirty: ['checkbox'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName', 'lastName', 'select', 'checkbox'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });
    await cy.click('input[name="checkbox"]');
    cy.expectJson('#state', {
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName', 'lastName', 'select', 'checkbox'],
      isDirty: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.click('input[name="checkbox-checked"]');
    await cy.blur('input[name="checkbox-checked"]');
    cy.expectJson('#state', {
      dirty: ['checkbox-checked'],
      isSubmitted: false,
      submitCount: 0,
      touched: [
        'firstName',
        'lastName',
        'select',
        'checkbox',
        'checkbox-checked',
      ],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });
    await cy.click('input[name="checkbox-checked"]');
    cy.expectJson('#state', {
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: [
        'firstName',
        'lastName',
        'select',
        'checkbox',
        'checkbox-checked',
      ],
      isDirty: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.click('input[name="radio"]');
    await cy.blur('input[name="radio"]');
    cy.expectJson('#state', {
      dirty: ['radio'],
      isSubmitted: false,
      submitCount: 0,
      touched: [
        'firstName',
        'lastName',
        'select',
        'checkbox',
        'checkbox-checked',
        'radio',
      ],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.selectOption('select[name="select"]', '');
    cy.expectJson('#state', {
      dirty: ['radio'],
      isSubmitted: false,
      submitCount: 0,
      touched: [
        'firstName',
        'lastName',
        'select',
        'checkbox',
        'checkbox-checked',
        'radio',
      ],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });
    expectRenderCountDelta(renderCountStart, 20);
  });

  it('should reset dirty value when inputs reset back to default with onBlur mode', async () => {
    await renderApp('http://localhost:3000/formState/onBlur');
    const renderCountStart = getRenderCount();
    await cy.type('input[name="firstName"]', 'test');
    await cy.blur('input[name="firstName"]');
    await cy.type('input[name="lastName"]', 'test');
    await cy.blur('input[name="lastName"]');

    cy.expectJson('#state', {
      dirty: ['firstName', 'lastName'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await cy.clear('input[name="firstName"]');
    await cy.clear('input[name="lastName"]');
    await cy.blur('input[name="lastName"]');

    cy.expectJson('#state', {
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName', 'lastName'],
      isDirty: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });
    expectRenderCountDelta(renderCountStart, 8);
  });

  it('should reset dirty value when inputs reset back to default with onChange mode', async () => {
    await renderApp('http://localhost:3000/formState/onChange');
    const renderCountStart = getRenderCount();
    await cy.type('input[name="firstName"]', 'test');
    await cy.blur('input[name="firstName"]');
    await cy.type('input[name="lastName"]', 'test');
    await cy.blur('input[name="lastName"]');

    cy.expectJson('#state', {
      dirty: ['firstName', 'lastName'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await cy.click('#resetForm');

    cy.expectJson('#state', {
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: [],
      isDirty: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="firstName"]', 'test');
    await cy.blur('input[name="firstName"]');
    await cy.type('input[name="lastName"]', 'test');
    await cy.blur('input[name="lastName"]');

    await cy.clear('input[name="firstName"]');
    await cy.clear('input[name="lastName"]');

    cy.expectJson('#state', {
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['firstName', 'lastName'],
      isDirty: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });
    expectRenderCountDelta(renderCountStart, 13);
  });
});
