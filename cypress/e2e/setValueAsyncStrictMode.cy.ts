import { describe, it } from 'vitest';

import * as cy from '../support/cy';
import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('form setValueAsyncStrictMode', () => {
  it('should set async input value correctly', async () => {
    await renderApp('http://localhost:3000/setValueAsyncStrictMode');
    const renderCountStart = getRenderCount();
    await cy.wait(100);
    await cy.click('#submit');
    cy.expectContains('p', '["test","A","B","C","D"]');
  });
});
