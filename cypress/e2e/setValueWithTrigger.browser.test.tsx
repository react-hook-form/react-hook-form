import { describe, it } from 'vitest';

import * as cy from '../support/cy';
import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('form setValue with trigger', () => {
  it('should set input value and trigger validation', async () => {
    await renderApp('http://localhost:3000/setValueWithTrigger');
    const renderCountStart = getRenderCount();
    await cy.type('input[name="firstName"]', 'a');
    cy.expectInputError('input[name="firstName"]', 'minLength 10');
    await cy.clear('input[name="firstName"]');
    cy.expectInputError('input[name="firstName"]', 'required');
    await cy.type('input[name="firstName"]', 'clear1234567');

    await cy.type('input[name="lastName"]', 'a');
    cy.expectInputError('input[name="lastName"]', 'too short');
    await cy.type('input[name="lastName"]', 'fsdfsdfsd');
    cy.expectInputError('input[name="lastName"]', 'error message');
    await cy.clear('input[name="lastName"]');
    await cy.type('input[name="lastName"]', 'bill');

    cy.expectNoParagraphs();
    expectRenderCountDelta(renderCountStart, 30);
  });
});
