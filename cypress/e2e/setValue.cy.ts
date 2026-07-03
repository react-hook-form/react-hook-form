import { describe, it } from 'vitest';
import { vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('form setValue', () => {
  it('should set input value, trigger validation and clear all errors', async () => {
    await renderApp('http://localhost:3000/setValue');
    const renderCountStart = getRenderCount();
    expect(
      (
        document.querySelector('input[name="firstName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('wrong');
    expect(
      (
        document.querySelector('input[name="age"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('2');
    expect(
      (
        document.querySelector('input[name="array.0"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('array.0');
    expect(
      (
        document.querySelector('input[name="array.1"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('array.1');
    expect(
      (
        document.querySelector('input[name="array.2"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('array.2');
    expect(
      (
        document.querySelector('input[name="object.firstName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('firstName');
    expect(
      (
        document.querySelector('input[name="object.lastName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('lastName');
    expect(
      (
        document.querySelector('input[name="object.middleName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('middleName');
    expect(
      (document.querySelector('input[name="radio"]')! as HTMLInputElement)
        .checked,
    ).toBe(true);
    expect(
      (
        document.querySelector(
          'input[name="checkboxArray"][value="2"]',
        )! as HTMLInputElement
      ).checked,
    ).toBe(true);
    expect(
      (
        document.querySelector(
          'input[name="checkboxArray"][value="3"]',
        )! as HTMLInputElement
      ).checked,
    ).toBe(true);
    expect(
      (
        document.querySelector('select[name="select"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('a');
    expect(
      Array.from(
        (
          document.querySelector(
            'select[name="multiple"]',
          )! as HTMLSelectElement
        ).selectedOptions,
      ).map((option) => option.value),
    ).toEqual([...['a', 'b']]);
    await vi.waitFor(() =>
      expect(document.querySelector('#trigger')!.textContent).toContain(
        'Trigger error',
      ),
    );
    expect(document.querySelector('#lastName')).toBeNull();
    expect(document.querySelector('#nestedValue')!.textContent).toContain(
      'required',
    );

    await userEvent.click(document.querySelector('#submit')!);

    expect(document.querySelector('#lastName')!.textContent).toContain(
      'Last name error',
    );

    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="trigger"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'trigger');
      else await userEvent.type(el, 'trigger');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="nestedValue"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    expectRenderCountDelta(renderCountStart, 6);

    await userEvent.click(document.querySelector('#setMultipleValues')!);
    expect(
      (
        document.querySelector('input[name="array.0"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('array[0]1');
    expect(
      (
        document.querySelector('input[name="array.1"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('array[1]1');
    expect(
      (
        document.querySelector('input[name="array.2"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('array[2]1');
    expect(
      (
        document.querySelector('input[name="object.firstName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('firstName1');
    expect(
      (
        document.querySelector('input[name="object.lastName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('lastName1');
    expect(
      (
        document.querySelector('input[name="object.middleName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('middleName1');
    expect(
      (
        document.querySelector('input[name="nestedValue"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('a,b');
    expectRenderCountDelta(renderCountStart, 6);
  });
});
