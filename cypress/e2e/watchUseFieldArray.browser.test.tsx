import { describe, it } from 'vitest';

import * as cy from '../support/cy';
import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('watchUseFieldArray', () => {
  it('should behaviour correctly when watching the field array', async () => {
    await renderApp('http://localhost:3000/watch-field-array/normal');
    const renderCountStart = getRenderCount();
    await cy.click('#append');
    cy.expectContains('#result', '[{"name":"2"}]');

    await cy.type('#field0', 'test');
    cy.expectContains('#result', '[{"name":"2test"}]');

    await cy.click('#prepend');
    cy.expectContains('#result', '[{"name":"8"},{"name":"2test"}]');

    await cy.click('#append');
    await cy.click('#append');
    await cy.click('#append');
    await cy.click('#update');
    cy.expectContains(
      '#result',
      '[{"name":"8"},{"name":"2test"},{"name":"10"},{"name":"updated value"},{"name":"14"}]',
    );

    await cy.click('#swap');
    cy.expectContains(
      '#result',
      '[{"name":"8"},{"name":"10"},{"name":"2test"},{"name":"updated value"},{"name":"14"}]',
    );

    await cy.click('#move');
    cy.expectContains(
      '#result',
      '[{"name":"2test"},{"name":"8"},{"name":"10"},{"name":"updated value"},{"name":"14"}]',
    );

    await cy.click('#insert');
    cy.expectContains(
      '#result',
      '[{"name":"2test"},{"name":"22"},{"name":"8"},{"name":"10"},{"name":"updated value"},{"name":"14"}]',
    );

    await cy.click('#remove');
    cy.expectContains(
      '#result',
      '[{"name":"2test"},{"name":"8"},{"name":"10"},{"name":"updated value"},{"name":"14"}]',
    );

    await cy.click('#removeAll');
    cy.expectContains('#result', '[]');
    expectRenderCountDelta(renderCountStart, 27);
  });

  it('should return empty when items been removed and defaultValues are supplied', async () => {
    await renderApp('http://localhost:3000/watch-field-array/default');
    const renderCountStart = getRenderCount();
    await cy.click('#delete0');
    await cy.click('#delete0');
    await cy.click('#delete0');

    cy.expectContains('#result', '[]');
  });
});
