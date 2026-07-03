import { describe, expect, it } from 'vitest';

import * as cy from './cy';
import { getRenderCount, expectRenderCountDelta, renderApp } from './renderApp';

describe('ConditionalField', () => {
  it('should reflect correct form state and data collection', async () => {
    await renderApp('http://localhost:3000/conditionalField');
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

    await cy.selectOption('select[name="selectNumber"]', '1');
    await cy.blur('select[name="selectNumber"]');
    await cy.type('input[name="firstName"]', 'bill');
    await cy.type('input[name="lastName"]', 'luo');
    await cy.blur('input[name="lastName"]');
    cy.expectJson('#state', {
      dirty: ['selectNumber', 'firstName', 'lastName'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['selectNumber', 'firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });
    await cy.click('button#submit');
    cy.expectContains(
      '#result',
      '{"selectNumber":"1","firstName":"bill","lastName":"luo"}',
    );
    cy.expectJson('#state', {
      dirty: ['selectNumber', 'firstName', 'lastName'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['selectNumber', 'firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });
    cy.expectJson('#result', {
      selectNumber: '1',
      firstName: 'bill',
      lastName: 'luo',
    });

    await cy.selectOption('select[name="selectNumber"]', '2');
    cy.expectJson('#state', {
      dirty: ['selectNumber', 'firstName', 'lastName'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['selectNumber', 'firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: false,
    });
    await cy.type('input[name="min"]', '10');
    await cy.type('input[name="max"]', '2');
    await cy.blur('input[name="max"]');
    cy.expectJson('#state', {
      dirty: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });
    await cy.click('button#submit');
    cy.expectJson('#state', {
      dirty: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
      isSubmitted: true,
      submitCount: 2,
      touched: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });
    cy.expectJson('#result', {
      selectNumber: '2',
      firstName: 'bill',
      lastName: 'luo',
      min: '10',
      max: '2',
    });

    await cy.selectOption('select[name="selectNumber"]', '3');
    cy.expectJson('#state', {
      dirty: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
      isSubmitted: true,
      submitCount: 2,
      touched: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });

    await cy.type('input[name="notRequired"]', 'test');
    await cy.blur('input[name="notRequired"]');
    cy.expectJson('#state', {
      dirty: [
        'selectNumber',
        'firstName',
        'lastName',
        'min',
        'max',
        'notRequired',
      ],
      isSubmitted: true,
      submitCount: 2,
      touched: [
        'selectNumber',
        'firstName',
        'lastName',
        'min',
        'max',
        'notRequired',
      ],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });

    await cy.click('button#submit');
    cy.expectJson('#result', {
      selectNumber: '3',
      firstName: 'bill',
      lastName: 'luo',
      min: '10',
      max: '2',
      notRequired: 'test',
    });

    expectRenderCountDelta(renderCountStart, 24);
  });
});
