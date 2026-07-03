import { describe, it } from 'vitest';

import * as cy from './cy';
import { getRenderCount, expectRenderCountDelta, renderApp } from './renderApp';

describe('useFieldArray', () => {
  it('should behaviour correctly without defaultValues', async () => {
    await renderApp('http://localhost:3000/useFieldArray/normal');
    const renderCountStart = getRenderCount();
    await cy.click('#appendAsync');

    await cy.waitFor(() => cy.expectFocusedAttr('id', 'field0'));

    cy.expectLiInputValue(0, 'appendAsync');

    await cy.waitFor(() => cy.expectFocusedAttr('id', 'field0'));

    await cy.click('#prependAsync');

    await cy.waitFor(() => cy.expectLiInputValue(0, 'prependAsync'));

    await cy.click('#insertAsync');

    await cy.waitFor(() => cy.expectFocusedAttr('id', 'field1'));

    cy.expectValue('#field1', 'insertAsync');

    await cy.click('#swapAsync');

    await cy.waitFor(() => cy.expectValue('#field0', 'insertAsync'));
    cy.expectValue('#field1', 'prependAsync');

    await cy.click('#moveAsync');

    await cy.waitFor(() => cy.expectValue('#field1', 'insertAsync'));
    cy.expectValue('#field0', 'prependAsync');

    await cy.click('#updateAsync');

    await cy.waitFor(() => cy.expectValue('#field0', 'updateAsync'));

    await cy.click('#replaceAsync');

    await cy.wait(100);
    const replaceValues = cy.getReplaceFieldValues();
    cy.expectLiInputValue(0, replaceValues[0]);
    cy.expectLiInputValue(1, replaceValues[1]);
    cy.expectLiInputValue(2, replaceValues[2]);
    cy.expectLiInputValue(3, replaceValues[3]);

    await cy.click('#removeAsync');

    await cy.click('#resetAsync');

    await cy.waitFor(() => cy.expectNotExist('ul > li'));
  });
});
