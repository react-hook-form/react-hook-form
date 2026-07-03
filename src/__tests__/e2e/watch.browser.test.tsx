import { describe, it } from 'vitest';

import * as cy from './cy';
import { expectRenderCountDelta, getRenderCount, renderApp } from './renderApp';

describe('watch form validation', () => {
  it('should watch all inputs', async () => {
    await renderApp('http://localhost:3000/watch');
    const renderCountStart = getRenderCount();
    cy.expectPreJson('#watchAll', {
      testSingle: '',
      test: ['', ''],
      testObject: { firstName: '', lastName: '' },
      toggle: false,
    });

    cy.expectNotExist('#HideTestSingle');
    await cy.type('input[name="testSingle"]', 'testSingle');
    cy.expectContains('#HideTestSingle', 'Hide Content TestSingle');
    cy.expectPreJson('#watchAll', {
      testSingle: 'testSingle',
      test: ['', ''],
      testObject: { firstName: '', lastName: '' },
      toggle: false,
    });

    await cy.type('input[name="test.0"]', 'bill');
    await cy.type('input[name="test.1"]', 'luo');
    cy.expectContains('#testData', '["bill","luo"]');
    cy.expectPreJson('#testArray', ['bill', 'luo']);

    cy.expectPreJson('#watchAll', {
      testSingle: 'testSingle',
      test: ['bill', 'luo'],
      testObject: { firstName: '', lastName: '' },
      toggle: false,
    });

    await cy.type('input[name="testObject.firstName"]', 'bill');
    await cy.type('input[name="testObject.lastName"]', 'luo');
    cy.expectPreJson('#testObject', {
      firstName: 'bill',
      lastName: 'luo',
    });

    cy.expectPreJson('#testArray', ['bill', 'luo']);

    cy.expectPreJson('#watchAll', {
      testSingle: 'testSingle',
      test: ['bill', 'luo'],
      testObject: { firstName: 'bill', lastName: 'luo' },
      toggle: false,
    });

    cy.expectNotExist('#hideContent');
    await cy.check('input[name="toggle"]');
    cy.expectContains('#hideContent', 'Hide Content');

    cy.expectPreJson('#watchAll', {
      testSingle: 'testSingle',
      test: ['bill', 'luo'],
      testObject: { firstName: 'bill', lastName: 'luo' },
      toggle: true,
    });
  });
});
