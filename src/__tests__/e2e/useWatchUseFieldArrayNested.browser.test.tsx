import { describe, it } from 'vitest';

import * as cy from './cy';
import { expectRenderCountDelta, getRenderCount, renderApp } from './renderApp';

describe('useWatchUseFieldArrayNested', () => {
  it('should watch the correct nested field array', async () => {
    await renderApp('http://localhost:3000/useWatchUseFieldArrayNested');
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

    await cy.click('#nest-remove-0');

    await cy.click('#submit');

    cy.expectJson('#result', [
      {
        firstName: 'Bill',
        keyValue: [
          { name: 'insert' },
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
        keyValue: [
          { name: 'insert' },
          { name: '1a' },
          { name: '1c' },
          { name: 'append' },
        ],
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
        firstName: 'prepend',
        keyValue: [{ name: 'insert' }, { name: 'prepend' }, { name: 'append' }],
      },
      { firstName: 'insert', keyValue: [] },
      { firstName: 'append', keyValue: [] },
      {
        firstName: 'Bill',
        lastName: 'Luo',
        keyValue: [
          { name: 'insert' },
          { name: '1a' },
          { name: '1c' },
          { name: 'append' },
        ],
      },
    ]);

    await cy.click('#nest-update-3');

    cy.expectValue('input[name="test.3.keyValue.2.name"]', 'update');

    cy.expectJson('#result', [
      {
        firstName: 'prepend',
        keyValue: [{ name: 'insert' }, { name: 'prepend' }, { name: 'append' }],
      },
      { firstName: 'insert', keyValue: [] },
      { firstName: 'append', keyValue: [] },
      {
        firstName: 'Bill',
        keyValue: [
          { name: 'insert' },
          { name: '1a' },
          { name: 'update' },
          { name: 'append' },
        ],
        lastName: 'Luo',
      },
    ]);

    await cy.click('#nest-update-0');

    cy.expectJson('#result', [
      {
        firstName: 'prepend',
        keyValue: [{ name: 'insert' }, { name: 'prepend' }, { name: 'update' }],
      },
      { firstName: 'insert', keyValue: [] },
      { firstName: 'append', keyValue: [] },
      {
        firstName: 'Bill',
        lastName: 'Luo',
        keyValue: [
          { name: 'insert' },
          { name: '1a' },
          { name: 'update' },
          { name: 'append' },
        ],
      },
    ]);

    await cy.click('#nest-remove-3');
    await cy.click('#nest-remove-3');

    cy.expectJson('#result', [
      {
        firstName: 'prepend',
        keyValue: [{ name: 'insert' }, { name: 'prepend' }, { name: 'update' }],
      },
      { firstName: 'insert', keyValue: [] },
      { firstName: 'append', keyValue: [] },
      {
        firstName: 'Bill',
        lastName: 'Luo',
        keyValue: [{ name: 'insert' }, { name: 'append' }],
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

    await cy.click('#remove');
    await cy.click('#remove');
    await cy.click('#remove');

    cy.expectJson('#result', [{ firstName: 'prepend', keyValue: [] }]);

    expectRenderCountDelta(renderCountStart, 8);
  });
});
