import { describe, it } from 'vitest';

import * as cy from './cy';
import { expectRenderCountDelta, getRenderCount, renderApp } from './renderApp';

describe('useFieldArrayNested', () => {
  it('should work correctly with nested field array', async () => {
    await renderApp('http://localhost:3000/useFieldArrayNested');
    const renderCountStart = getRenderCount();
    await cy.click('#nest-append-0');
    await cy.click('#nest-prepend-0');
    await cy.click('#nest-insert-0');
    await cy.click('#nest-swap-0');
    await cy.click('#nest-move-0');

    cy.expectValue('input[name="test.0.keyValue.0.name"]', 'insert');
    cy.expectValue('input[name="test.0.keyValue.1.name"]', 'prepend');
    cy.expectValue('input[name="test.0.keyValue.2.name"]', '1a');
    cy.expectValue('input[name="test.0.keyValue.3.name"]', '1c');
    cy.expectValue('input[name="test.0.keyValue.4.name"]', 'append');

    await cy.click('#nest-remove-0');
    cy.expectValue('input[name="test.0.keyValue.2.name"]', '1c');
    cy.expectValue('input[name="test.0.keyValue.3.name"]', 'append');

    cy.expectJson('#dirty-nested-0', {
      test: [
        {
          keyValue: [
            { name: true },
            { name: true },
            { name: true },
            { name: true },
          ],
        },
      ],
    });

    cy.expectJson('#touched-nested-0', {
      test: [{ keyValue: [{ name: true }, null, null, { name: true }] }],
    });

    await cy.click('#submit');

    cy.expectJson('#result', {
      test: [
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
      ],
    });

    await cy.click('#prepend');

    cy.expectJson('#dirty-nested-0', {
      test: [
        {
          keyValue: [{ name: true }, { name: true }],
          firstName: true,
          lastName: true,
        },
        {
          firstName: true,
          lastName: true,
          keyValue: [
            { name: true },
            { name: true },
            { name: true },
            { name: true },
          ],
        },
      ],
    });

    cy.expectJson('#touched-nested-0', {
      test: [null, { keyValue: [{ name: true }, null, null, { name: true }] }],
    });

    await cy.click('#append');
    await cy.click('#swap');
    await cy.click('#insert');

    cy.expectJson('#touched-nested-0', {
      test: [
        { firstName: true },
        null,
        { firstName: true },
        { keyValue: [{ name: true }, null, null, { name: true }] },
      ],
    });

    cy.expectJson('#dirty-nested-0', {
      test: [
        {
          firstName: true,
          keyValue: [{ name: true }, { name: true }],
          lastName: true,
        },
        { firstName: true },
        { firstName: true },
        {
          firstName: true,
          lastName: true,
          keyValue: [
            { name: true },
            { name: true },
            { name: true },
            { name: true },
          ],
        },
      ],
    });

    await cy.click('#submit');

    cy.expectJson('#result', {
      test: [
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
      ],
    });

    await cy.click('#nest-append-0');
    await cy.click('#nest-prepend-0');
    await cy.click('#nest-insert-0');
    await cy.click('#nest-swap-0');
    await cy.click('#nest-move-0');

    cy.expectLength('input', 11);

    await cy.click('#nest-remove-3');
    await cy.click('#nest-remove-3');

    cy.expectValue('input[name="test.3.keyValue.0.name"]', 'insert');
    cy.expectValue('input[name="test.3.keyValue.1.name"]', 'append');

    cy.expectJson('#dirty-nested-0', {
      test: [
        {
          firstName: true,
          keyValue: [{ name: true }, { name: true }, { name: true }],
          lastName: true,
        },
        { firstName: true },
        { firstName: true },
        {
          firstName: true,
          lastName: true,
          keyValue: [{ name: true }, { name: true }],
        },
      ],
    });

    await cy.click('#nest-update-0');

    cy.expectValue('input[name="test.0.keyValue.0.name"]', 'update');

    await cy.click('#submit');

    cy.expectJson('#result', {
      test: [
        {
          firstName: 'prepend',
          keyValue: [
            { name: 'update' },
            { name: 'prepend' },
            { name: 'append' },
          ],
        },
        { firstName: 'insert', keyValue: [] },
        { firstName: 'append', keyValue: [] },
        {
          firstName: 'Bill',
          keyValue: [{ name: 'insert' }, { name: 'append' }],
          lastName: 'Luo',
        },
      ],
    });

    await cy.click('#nest-remove-all-3');
    await cy.click('#nest-remove-all-2');
    await cy.click('#nest-remove-all-1');
    await cy.click('#nest-remove-all-0');

    cy.expectContains(
      '#touched-nested-2',
      '{"test":[{"firstName":true,"keyValue":[]},{"firstName":true},{"firstName":true},{"keyValue":[]}]}',
    );

    cy.expectJson('#dirty-nested-2', {
      test: [
        {
          firstName: true,
          keyValue: [{ name: true }, { name: true }],
          lastName: true,
        },
        { firstName: true },
        { firstName: true },
        { firstName: true, lastName: true },
      ],
    });

    await cy.click('#submit');

    cy.expectJson('#result', {
      test: [
        { firstName: 'prepend', keyValue: [] },
        { firstName: 'insert', keyValue: [] },
        { firstName: 'append', keyValue: [] },
        { firstName: 'Bill', keyValue: [], lastName: 'Luo' },
      ],
    });

    await cy.click('#remove');
    await cy.click('#remove');
    await cy.click('#remove');

    cy.expectJson('#dirty-nested-0', {
      test: [
        {
          firstName: true,
          keyValue: [{ name: true }, { name: true }],
          lastName: true,
        },
      ],
    });

    await cy.click('#submit');
    cy.expectContains(
      '#result',
      '{"test":[{"firstName":"prepend","keyValue":[]}]}',
    );

    await cy.click('#update');

    cy.expectValue('input[name="test.0.firstName"]', 'updateFirstName');
    cy.expectValue('input[name="test.0.keyValue.0.name"]', 'updateFirstName1');
    cy.expectValue('input[name="test.0.keyValue.1.name"]', 'updateFirstName2');

    await cy.click('#removeAll');

    cy.expectNotExist('#dirty-nested-0');

    cy.expectNotExist('#touched-nested-0');

    await cy.click('#submit');
    cy.expectContains('#result', '{"test":[]}');

    expectRenderCountDelta(renderCountStart, 16);
  });
});
