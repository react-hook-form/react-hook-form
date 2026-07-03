import { describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('useFieldArrayNested', () => {
  it('should work correctly with nested field array', async () => {
    await renderApp('http://localhost:3000/useFieldArrayNested');
    const renderCountStart = getRenderCount();
    await userEvent.click(document.querySelector('#nest-append-0')!);
    await userEvent.click(document.querySelector('#nest-prepend-0')!);
    await userEvent.click(document.querySelector('#nest-insert-0')!);
    await userEvent.click(document.querySelector('#nest-swap-0')!);
    await userEvent.click(document.querySelector('#nest-move-0')!);

    expect(
      (
        document.querySelector('input[name="test.0.keyValue.0.name"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('insert');
    expect(
      (
        document.querySelector('input[name="test.0.keyValue.1.name"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('prepend');
    expect(
      (
        document.querySelector('input[name="test.0.keyValue.2.name"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('1a');
    expect(
      (
        document.querySelector('input[name="test.0.keyValue.3.name"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('1c');
    expect(
      (
        document.querySelector('input[name="test.0.keyValue.4.name"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('append');

    await userEvent.click(document.querySelector('#nest-remove-0')!);
    expect(
      (
        document.querySelector('input[name="test.0.keyValue.2.name"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('1c');
    expect(
      (
        document.querySelector('input[name="test.0.keyValue.3.name"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('append');

    expect(
      JSON.parse(document.querySelector('#dirty-nested-0')!.textContent ?? ''),
    ).toEqual({
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

    expect(
      JSON.parse(
        document.querySelector('#touched-nested-0')!.textContent ?? '',
      ),
    ).toEqual({
      test: [{ keyValue: [{ name: true }, null, null, { name: true }] }],
    });

    await userEvent.click(document.querySelector('#submit')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
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

    await userEvent.click(document.querySelector('#prepend')!);

    expect(
      JSON.parse(document.querySelector('#dirty-nested-0')!.textContent ?? ''),
    ).toEqual({
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

    expect(
      JSON.parse(
        document.querySelector('#touched-nested-0')!.textContent ?? '',
      ),
    ).toEqual({
      test: [null, { keyValue: [{ name: true }, null, null, { name: true }] }],
    });

    await userEvent.click(document.querySelector('#append')!);
    await userEvent.click(document.querySelector('#swap')!);
    await userEvent.click(document.querySelector('#insert')!);

    expect(
      JSON.parse(
        document.querySelector('#touched-nested-0')!.textContent ?? '',
      ),
    ).toEqual({
      test: [
        { firstName: true },
        null,
        { firstName: true },
        { keyValue: [{ name: true }, null, null, { name: true }] },
      ],
    });

    expect(
      JSON.parse(document.querySelector('#dirty-nested-0')!.textContent ?? ''),
    ).toEqual({
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

    await userEvent.click(document.querySelector('#submit')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
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

    await userEvent.click(document.querySelector('#nest-append-0')!);
    await userEvent.click(document.querySelector('#nest-prepend-0')!);
    await userEvent.click(document.querySelector('#nest-insert-0')!);
    await userEvent.click(document.querySelector('#nest-swap-0')!);
    await userEvent.click(document.querySelector('#nest-move-0')!);

    expect(document.querySelectorAll('input')).toHaveLength(11);

    await userEvent.click(document.querySelector('#nest-remove-3')!);
    await userEvent.click(document.querySelector('#nest-remove-3')!);

    expect(
      (
        document.querySelector('input[name="test.3.keyValue.0.name"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('insert');
    expect(
      (
        document.querySelector('input[name="test.3.keyValue.1.name"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('append');

    expect(
      JSON.parse(document.querySelector('#dirty-nested-0')!.textContent ?? ''),
    ).toEqual({
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

    await userEvent.click(document.querySelector('#nest-update-0')!);

    expect(
      (
        document.querySelector('input[name="test.0.keyValue.0.name"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('update');

    await userEvent.click(document.querySelector('#submit')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
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

    await userEvent.click(document.querySelector('#nest-remove-all-3')!);
    await userEvent.click(document.querySelector('#nest-remove-all-2')!);
    await userEvent.click(document.querySelector('#nest-remove-all-1')!);
    await userEvent.click(document.querySelector('#nest-remove-all-0')!);

    expect(document.querySelector('#touched-nested-2')!.textContent).toContain(
      '{"test":[{"firstName":true,"keyValue":[]},{"firstName":true},{"firstName":true},{"keyValue":[]}]}',
    );

    expect(
      JSON.parse(document.querySelector('#dirty-nested-2')!.textContent ?? ''),
    ).toEqual({
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

    await userEvent.click(document.querySelector('#submit')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      test: [
        { firstName: 'prepend', keyValue: [] },
        { firstName: 'insert', keyValue: [] },
        { firstName: 'append', keyValue: [] },
        { firstName: 'Bill', keyValue: [], lastName: 'Luo' },
      ],
    });

    await userEvent.click(document.querySelector('#remove')!);
    await userEvent.click(document.querySelector('#remove')!);
    await userEvent.click(document.querySelector('#remove')!);

    expect(
      JSON.parse(document.querySelector('#dirty-nested-0')!.textContent ?? ''),
    ).toEqual({
      test: [
        {
          firstName: true,
          keyValue: [{ name: true }, { name: true }],
          lastName: true,
        },
      ],
    });

    await userEvent.click(document.querySelector('#submit')!);
    expect(document.querySelector('#result')!.textContent).toContain(
      '{"test":[{"firstName":"prepend","keyValue":[]}]}',
    );

    await userEvent.click(document.querySelector('#update')!);

    expect(
      (
        document.querySelector('input[name="test.0.firstName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('updateFirstName');
    expect(
      (
        document.querySelector('input[name="test.0.keyValue.0.name"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('updateFirstName1');
    expect(
      (
        document.querySelector('input[name="test.0.keyValue.1.name"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('updateFirstName2');

    await userEvent.click(document.querySelector('#removeAll')!);

    expect(document.querySelector('#dirty-nested-0')).toBeNull();

    expect(document.querySelector('#touched-nested-0')).toBeNull();

    await userEvent.click(document.querySelector('#submit')!);
    expect(document.querySelector('#result')!.textContent).toContain(
      '{"test":[]}',
    );

    expectRenderCountDelta(renderCountStart, 16);
  });
});
