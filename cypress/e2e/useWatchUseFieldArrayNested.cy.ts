import { describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('useWatchUseFieldArrayNested', () => {
  it('should watch the correct nested field array', async () => {
    await renderApp('http://localhost:3000/useWatchUseFieldArrayNested');
    const renderCountStart = getRenderCount();
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual([
      {
        firstName: 'Bill',
        keyValue: [{ name: '1a' }, { name: '1c' }],
        lastName: 'Luo',
      },
    ]);

    await userEvent.click(document.querySelector('#nest-append-0')!);
    await userEvent.click(document.querySelector('#nest-prepend-0')!);
    await userEvent.click(document.querySelector('#nest-insert-0')!);
    await userEvent.click(document.querySelector('#nest-swap-0')!);
    await userEvent.click(document.querySelector('#nest-move-0')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual([
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

    await userEvent.click(document.querySelector('#nest-remove-0')!);

    await userEvent.click(document.querySelector('#submit')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual([
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

    await userEvent.click(document.querySelector('#prepend')!);
    await userEvent.click(document.querySelector('#append')!);
    await userEvent.click(document.querySelector('#swap')!);
    await userEvent.click(document.querySelector('#insert')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual([
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

    await userEvent.click(document.querySelector('#nest-append-0')!);
    await userEvent.click(document.querySelector('#nest-prepend-0')!);
    await userEvent.click(document.querySelector('#nest-insert-0')!);
    await userEvent.click(document.querySelector('#nest-swap-0')!);
    await userEvent.click(document.querySelector('#nest-move-0')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual([
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

    await userEvent.click(document.querySelector('#nest-update-3')!);

    expect(
      (
        document.querySelector('input[name="test.3.keyValue.2.name"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('update');

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual([
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

    await userEvent.click(document.querySelector('#nest-update-0')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual([
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

    await userEvent.click(document.querySelector('#nest-remove-3')!);
    await userEvent.click(document.querySelector('#nest-remove-3')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual([
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

    await userEvent.click(document.querySelector('#nest-remove-all-3')!);
    await userEvent.click(document.querySelector('#nest-remove-all-2')!);
    await userEvent.click(document.querySelector('#nest-remove-all-1')!);
    await userEvent.click(document.querySelector('#nest-remove-all-0')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual([
      { firstName: 'prepend', keyValue: [] },
      { firstName: 'insert', keyValue: [] },
      { firstName: 'append', keyValue: [] },
      { firstName: 'Bill', lastName: 'Luo', keyValue: [] },
    ]);

    await userEvent.click(document.querySelector('#remove')!);
    await userEvent.click(document.querySelector('#remove')!);
    await userEvent.click(document.querySelector('#remove')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual([{ firstName: 'prepend', keyValue: [] }]);

    expectRenderCountDelta(renderCountStart, 8);
  });
});
