import { describe, it } from 'vitest';

import * as cy from '../support/cy';
import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('form trigger', () => {
  it('should trigger input validation', async () => {
    await renderApp('http://localhost:3000/trigger-validation');
    const renderCountStart = getRenderCount();
    cy.expectEmpty('#testError');
    cy.expectEmpty('#test1Error');
    cy.expectEmpty('#test2Error');

    await cy.click('#single');
    cy.expectContains('#testError', 'required');
    await cy.click('#single');

    await cy.click('#multiple');
    cy.expectContains('#test1Error', 'required');
    cy.expectContains('#test2Error', 'required');

    await cy.click('#multiple');
    expectRenderCountDelta(renderCountStart, 5);
  });
});
