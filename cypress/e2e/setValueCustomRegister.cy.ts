import { describe, it } from 'vitest';

import * as cy from '../support/cy';
import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('setValue with react native or web', () => {
  it('should only trigger re-render when form state changed or error triggered', async () => {
    await renderApp('http://localhost:3000/setValueCustomRegister');
    const renderCountStart = getRenderCount();
    cy.expectContains('#dirty', 'false');
    await cy.click('#TriggerDirty');
    cy.expectContains('#dirty', 'true');
    await cy.click('#TriggerNothing');
    await cy.click('#TriggerNothing');
    await cy.click('#TriggerNothing');
    await cy.click('#TriggerNothing');
    await cy.click('#WithError');
    await cy.click('#WithError');
    await cy.click('#WithoutError');
    await cy.click('#WithoutError');
    await cy.click('#WithError');
    await cy.click('#TriggerNothing');
    expectRenderCountDelta(renderCountStart, 7);
  });
});
