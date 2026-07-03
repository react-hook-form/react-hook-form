import { describe, it } from 'vitest';

import * as cy from './cy';
import { getRenderCount, expectRenderCountDelta, renderApp } from './renderApp';

describe('watchUseFieldArrayNested', () => {
  it('should watch the correct nested field array', async () => {
    await renderApp('http://localhost:3000/watchUseFieldArrayNested');
    const renderCountStart = getRenderCount();
    cy.expectJson('#result', [
        {
          firstName: 'Bill',
          keyValue: [{ name: '1a' }, { name: '1c' }],
          lastName: 'Luo',
        },
      ]);

    await cy.click('#nest-append-0');
    await cy.click('#nest-prepend-0');
    await cy.click('#nest-insert-0');
    await cy.click('#nest-swap-0');
    await cy.click('#nest-move-0');

    cy.expectJson('#result', [
        {
          firstName: 'Bill',
          keyValue: [
            { name: 'insert' },
            { name: 'prepend' },
            { name: '1a' },
            { name: '1c' },
            { name: 'append' },
          ],
          lastName: 'Luo',
        },
      ]);

    await cy.click('#nest-update-0');

    cy.expectJson('#result', [
        {
          firstName: 'Bill',
          keyValue: [
            { name: 'billUpdate' },
            { name: 'prepend' },
            { name: '1a' },
            { name: '1c' },
            { name: 'append' },
          ],
          lastName: 'Luo',
        },
      ]);

    await cy.click('#nest-remove-0');

    await cy.click('#submit');

    cy.expectJson('#result', [
        {
          firstName: 'Bill',
          keyValue: [
            { name: 'billUpdate' },
            { name: '1a' },
            { name: '1c' },
            { name: 'append' },
          ],
          lastName: 'Luo',
        },
      ]);

    await cy.click('#prepend');
    await cy.click('#append');
    await cy.click('#swap');
    await cy.click('#insert');

    cy.expectJson('#result', [
        { firstName: 'prepend', keyValue: [] },
        { firstName: 'insert', keyValue: [] },
        { firstName: 'append', keyValue: [] },
        {
          firstName: 'Bill',
          lastName: 'Luo',
          keyValue: [
            { name: 'billUpdate' },
            { name: '1a' },
            { name: '1c' },
            { name: 'append' },
          ],
        },
      ]);

    await cy.click('#nest-append-0');
    await cy.click('#nest-prepend-0');
    await cy.click('#nest-insert-0');
    await cy.click('#nest-swap-0');
    await cy.click('#nest-move-0');

    cy.expectJson('#result', [
        {
          firstName: 'prepend',
          keyValue: [
            { name: 'insert' },
            { name: 'prepend' },
            { name: 'append' },
          ],
        },
        { firstName: 'insert', keyValue: [] },
        { firstName: 'append', keyValue: [] },
        {
          firstName: 'Bill',
          lastName: 'Luo',
          keyValue: [
            { name: 'billUpdate' },
            { name: '1a' },
            { name: '1c' },
            { name: 'append' },
          ],
        },
      ]);

    await cy.click('#nest-remove-3');
    await cy.click('#nest-remove-3');

    cy.expectJson('#result', [
        {
          firstName: 'prepend',
          keyValue: [
            { name: 'insert' },
            { name: 'prepend' },
            { name: 'append' },
          ],
        },
        { firstName: 'insert', keyValue: [] },
        { firstName: 'append', keyValue: [] },
        {
          firstName: 'Bill',
          lastName: 'Luo',
          keyValue: [{ name: 'billUpdate' }, { name: 'append' }],
        },
      ]);

    await cy.click('#nest-remove-all-3');
    await cy.click('#nest-remove-all-2');
    await cy.click('#nest-remove-all-1');
    await cy.click('#nest-remove-all-0');

    cy.expectJson('#result', [
        { firstName: 'prepend', keyValue: [] },
        { firstName: 'insert', keyValue: [] },
        { firstName: 'append', keyValue: [] },
        { firstName: 'Bill', lastName: 'Luo', keyValue: [] },
      ]);

    await cy.click('#update');

    cy.expectJson('#result', [
        { firstName: 'BillUpdate', keyValue: [] },
        { firstName: 'insert', keyValue: [] },
        { firstName: 'append', keyValue: [] },
        { firstName: 'Bill', lastName: 'Luo', keyValue: [] },
      ]);

    await cy.click('#remove');
    await cy.click('#remove');
    await cy.click('#remove');

    cy.expectJson('#result', [
        { firstName: 'BillUpdate', keyValue: [] },
      ]);

    expectRenderCountDelta(renderCountStart, 35);

    await cy.click('#removeAll');

    cy.expectContains('#result', '[]');
  });
});
