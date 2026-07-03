import { describe, it } from 'vitest';

import * as cy from '../support/cy';
import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('form state with nested fields', () => {
  it('should return correct form state with onSubmit mode', async () => {
    await renderApp('http://localhost:3000/formStateWithNestedFields/onSubmit');
    const renderCountStart = getRenderCount();
    cy.expectJson('#state', {
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: [],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="left.test1"]', 'test');
    await cy.blur('input[name="left.test1"]');

    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.clear('input[name="left.test1"]');

    cy.expectJson('#state', {
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="left.test1"]', 'test');
    await cy.type('input[name="left.test2"]', 'test');
    await cy.blur('input[name="left.test2"]');
    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await cy.clear('input[name="left.test2"]');

    await cy.click('#submit');
    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="left.test2"]', 'test');
    await cy.click('#submit');
    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: true,
      submitCount: 2,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });
    expectRenderCountDelta(renderCountStart, 15);
  });

  it('should return correct form state with onChange mode', async () => {
    await renderApp('http://localhost:3000/formStateWithNestedFields/onChange');
    const renderCountStart = getRenderCount();
    cy.expectJson('#state', {
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: [],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="left.test1"]', 'test');
    await cy.blur('input[name="left.test1"]');
    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.clear('input[name="left.test1"]');
    cy.expectJson('#state', {
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="left.test1"]', 'test');
    await cy.type('input[name="left.test2"]', 'test');
    await cy.blur('input[name="left.test2"]');
    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await cy.clear('input[name="left.test2"]');

    await cy.click('#submit');
    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="left.test2"]', 'test');
    await cy.click('#submit');
    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: true,
      submitCount: 2,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });
    expectRenderCountDelta(renderCountStart, 13);
  });

  it('should return correct form state with onBlur mode', async () => {
    await renderApp('http://localhost:3000/formStateWithNestedFields/onBlur');
    const renderCountStart = getRenderCount();
    cy.expectJson('#state', {
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: [],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="left.test1"]', 'test');
    await cy.blur('input[name="left.test1"]');
    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.clear('input[name="left.test1"]');
    cy.expectJson('#state', {
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="left.test1"]', 'test');
    await cy.type('input[name="left.test2"]', 'test');
    await cy.blur('input[name="left.test2"]');
    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await cy.clear('input[name="left.test2"]');

    await cy.click('#submit');
    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="left.test2"]', 'test');
    await cy.click('#submit');
    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: true,
      submitCount: 2,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });
    expectRenderCountDelta(renderCountStart, 13);
  });

  it('should reset dirty value when inputs reset back to default with onSubmit mode', async () => {
    await renderApp('http://localhost:3000/formStateWithNestedFields/onSubmit');
    const renderCountStart = getRenderCount();
    await cy.type('input[name="left.test1"]', 'test');
    await cy.blur('input[name="left.test1"]');
    await cy.type('input[name="left.test2"]', 'test');
    await cy.blur('input[name="left.test2"]');

    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await cy.clear('input[name="left.test1"]');
    await cy.clear('input[name="left.test2"]');

    cy.expectJson('#state', {
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    expectRenderCountDelta(renderCountStart, 9);
  });

  it('should reset dirty value when inputs reset back to default with onBlur mode', async () => {
    await renderApp('http://localhost:3000/formStateWithNestedFields/onBlur');
    const renderCountStart = getRenderCount();
    await cy.type('input[name="left.test1"]', 'test');
    await cy.blur('input[name="left.test1"]');
    await cy.type('input[name="left.test2"]', 'test');
    await cy.blur('input[name="left.test2"]');

    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await cy.clear('input[name="left.test1"]');
    await cy.clear('input[name="left.test2"]');
    await cy.blur('input[name="left.test2"]');

    cy.expectJson('#state', {
      isDirty: false,
      dirty: [],
      isSubmitted: false,

      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });
    expectRenderCountDelta(renderCountStart, 8);
  });

  it('should reset dirty value when inputs reset back to default with onChange mode', async () => {
    await renderApp('http://localhost:3000/formStateWithNestedFields/onChange');
    const renderCountStart = getRenderCount();
    await cy.type('input[name="left.test1"]', 'test');
    await cy.blur('input[name="left.test1"]');
    await cy.type('input[name="left.test2"]', 'test');
    await cy.blur('input[name="left.test2"]');

    cy.expectJson('#state', {
      isDirty: true,
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await cy.click('#resetForm');

    cy.expectJson('#state', {
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: [],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await cy.type('input[name="left.test1"]', 'test');
    await cy.blur('input[name="left.test1"]');
    await cy.type('input[name="left.test2"]', 'test');
    await cy.blur('input[name="left.test2"]');

    await cy.clear('input[name="left.test1"]');
    await cy.clear('input[name="left.test2"]');

    cy.expectJson('#state', {
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    expectRenderCountDelta(renderCountStart, 13);
  });
});
