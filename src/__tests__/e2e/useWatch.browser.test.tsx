import { describe, it } from 'vitest';

import * as cy from './cy';
import { expectRenderCountDelta, getRenderCount, renderApp } from './renderApp';

describe('useWatch', () => {
  it('should only trigger render when interact with input 1', async () => {
    await renderApp('http://localhost:3000/useWatch');
    const renderCountStart = getRenderCount();
    const parentStart = cy.getCounterText('#parentCounter');
    const childStart = cy.getCounterText('#childCounter');
    const grandChildStart = cy.getCounterText('#grandChildCounter');
    const grandChild1Start = cy.getCounterText('#grandChild1Counter');
    const grandChild2Start = cy.getCounterText('#grandChild2Counter');

    await cy.type('input[name="test"]', 't');

    cy.expectCounterDelta('#parentCounter', parentStart, 1);
    cy.expectCounterDelta('#childCounter', childStart, 1);
    cy.expectCounterDelta('#grandChildCounter', grandChildStart, 1);
    cy.expectCounterDelta('#grandChild1Counter', grandChild1Start, 1);
    cy.expectCounterDelta('#grandChild2Counter', grandChild2Start, 1);
    cy.expectContains('#grandchild01', 't');
    cy.expectContains('#grandchild00', 't');

    await cy.type('input[name="test"]', 'h');
    cy.expectContains('#grandchild00', 'th');
    cy.expectContains('#grandchild01', 'th');
    cy.expectContains('#grandchild2', 't');
  });

  it('should only trigger render when interact with input 2', async () => {
    await renderApp('http://localhost:3000/useWatch');
    const renderCountStart = getRenderCount();
    const parentStart = cy.getCounterText('#parentCounter');
    const childStart = cy.getCounterText('#childCounter');
    const grandChildStart = cy.getCounterText('#grandChildCounter');
    const grandChild1Start = cy.getCounterText('#grandChild1Counter');
    const grandChild2Start = cy.getCounterText('#grandChild2Counter');

    await cy.type('input[name="test1"]', 'h');

    cy.expectCounterDelta('#parentCounter', parentStart, 1);
    cy.expectCounterDelta('#childCounter', childStart, 1);
    cy.expectCounterDelta('#grandChildCounter', grandChildStart, 1);
    cy.expectCounterDelta('#grandChild1Counter', grandChild1Start, 1);
    cy.expectCounterDelta('#grandChild2Counter', grandChild2Start, 1);

    await cy.type('input[name="test1"]', 'h');
    await cy.type('input[name="test"]', 'h');
    cy.expectContains('#grandchild00', 'h');
    cy.expectContains('#grandchild01', 'h');
    cy.expectContains('#grandchild1', 'hh');
    cy.expectContains('#grandchild2', 'hhh');
  });

  it('should only trigger render when interact with input 3', async () => {
    await renderApp('http://localhost:3000/useWatch');
    const renderCountStart = getRenderCount();
    const parentStart = cy.getCounterText('#parentCounter');
    const childStart = cy.getCounterText('#childCounter');
    const grandChildStart = cy.getCounterText('#grandChildCounter');
    const grandChild1Start = cy.getCounterText('#grandChild1Counter');
    const grandChild2Start = cy.getCounterText('#grandChild2Counter');

    await cy.type('input[name="test2"]', 'e');

    cy.expectCounterDelta('#parentCounter', parentStart, 1);
    cy.expectCounterDelta('#childCounter', childStart, 1);
    cy.expectCounterDelta('#grandChildCounter', grandChildStart, 1);
    cy.expectCounterDelta('#grandChild1Counter', grandChild1Start, 1);
    cy.expectCounterDelta('#grandChild2Counter', grandChild2Start, 1);

    await cy.type('input[name="test2"]', 'eh');

    await cy.type('input[name="test1"]', 'eh');
    await cy.type('input[name="test"]', 'eh');
    cy.expectContains('#grandchild00', 'eh');
    cy.expectContains('#grandchild01', 'eh');
    cy.expectContains('#grandchild1', 'eh');
    cy.expectContains('#grandchild2', 'eheheeh');
  });
});
