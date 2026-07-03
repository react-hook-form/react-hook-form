import { describe, it } from 'vitest';

import * as cy from '../support/cy';
import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('useFieldArrayUnregister', () => {
  it('should behaviour correctly', async () => {
    await renderApp('http://localhost:3000/UseFieldArrayUnregister');
    const renderCountStart = getRenderCount();
    await cy.clearAndType('#field0', 'bill');

    await cy.type('input[name="data.0.conditional"]', 'test');

    cy.expectJson('#dirtyFields', {
      data: [{ name: true, conditional: true }, null, null],
    });

    await cy.blur('input[name="data.0.conditional"]');

    cy.expectJson('#touched', [{ name: true, conditional: true }]);

    await cy.click('#prepend');

    cy.expectNotExist('input[name="data.0.conditional"]');
    cy.expectValue('input[name="data.1.conditional"]', '');

    cy.expectJson('#dirtyFields', {
      data: [
        { name: true, conditional: true },
        { name: true, conditional: true },
        { name: true },
        { name: true },
      ],
    });

    cy.expectJson('#touched', [null, { name: true, conditional: true }]);

    await cy.blur('input[name="data.0.name"]');

    await cy.click('#swap');

    cy.expectNotExist('input[name="data.1.conditional"]');
    cy.expectValue('input[name="data.2.conditional"]', '');

    cy.expectJson('#dirtyFields', {
      data: [
        { name: true },
        null,
        { name: true, conditional: true },
        { name: true },
      ],
    });

    cy.expectJson('#touched', [
      { name: true },
      null,
      { name: true, conditional: true },
      { name: true },
    ]);

    await cy.click('#insert');

    await cy.click('#insert');

    await cy.type('input[name="data.4.name"]', 'test');

    cy.expectJson('#dirtyFields', {
      data: [
        { name: true },
        { name: true, conditional: true },
        { name: true },
        { name: true },
        { name: true, conditional: true },
        { name: true },
      ],
    });

    cy.expectJson('#touched', [
      { name: true },
      { name: true },
      { name: true },
      null,
      { name: true, conditional: true },
      { name: true },
    ]);

    await cy.click('#move');

    await cy.clearAndType('input[name="data.2.name"]', 'bill');

    cy.expectJson('#dirtyFields', {
      data: [
        { name: true },
        { name: true },
        { name: true, conditional: true },
        { name: true },
        { name: true },
        { name: true },
      ],
    });

    cy.expectJson('#touched', [
      { name: true },
      { name: true },
      { name: true, conditional: true },
      { name: true },
      null,
      { name: true },
    ]);

    await cy.click('#delete1');

    const submitData = cy.getFieldArraySubmitData();
    await cy.click('#submit');

    cy.expectJson('#result', {
      data: submitData,
    });

    await cy.type('input[name="data.3.name"]', 'test');

    const submitData2 = cy.getFieldArraySubmitData();
    await cy.click('#submit');

    cy.expectJson('#result', {
      data: submitData2,
    });

    await cy.click('#delete3');

    const submitData3 = cy.getFieldArraySubmitData();
    await cy.click('#submit');

    cy.expectJson('#result', {
      data: submitData3,
    });

    expectRenderCountDelta(renderCountStart, 29);
  });
});
