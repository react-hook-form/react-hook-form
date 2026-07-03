import { userEvent } from 'vitest/browser';

import { renderApp } from '../support/renderApp';

describe('form reset', () => {
  it('should be able to re-populate the form while reset', async () => {
    await renderApp('http://localhost:3000/reset');
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '0 wrong');
      else await userEvent.type(el, '0 wrong');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="array.1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '1 wrong');
      else await userEvent.type(el, '1 wrong');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="objectData.test"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2 wrong');
      else await userEvent.type(el, '2 wrong');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'lastName');
      else await userEvent.type(el, 'lastName');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="deepNest.level1.level2.data"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'whatever');
      else await userEvent.type(el, 'whatever');
    })();

    await userEvent.click(document.querySelector('button')!);

    expect(
      (
        document.querySelector('input[name="firstName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('bill');
    expect(
      (
        document.querySelector('input[name="lastName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('luo');
    expect(
      (
        document.querySelector('input[name="array.1"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('test');
    expect(
      (
        document.querySelector('input[name="objectData.test"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('data');
    expect(
      (
        document.querySelector('input[name="deepNest.level1.level2.data"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('hey');
  });

  it('should be able to re-populate the form while reset keeping dirty values', async () => {
    await renderApp('http://localhost:3000/resetKeepDirty');
    expect(
      (
        document.querySelector('input[name="firstName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('');
    expect(
      (
        document.querySelector('input[name="users"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('users#0');
    expect(
      (
        document.querySelector('input[name="objectData.test"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('');
    expect(
      (
        document.querySelector('input[name="lastName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('');
    expect(
      (
        document.querySelector('input[name="deepNest.level1.level2.data"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('');

    await userEvent.click(
      Array.from(document.querySelectorAll('button')).find((el) =>
        el.textContent?.includes('Add item'),
      )!,
    );
    expect(
      (
        document.querySelector('input[name="users"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('users#1');
    await userEvent.click(
      Array.from(document.querySelectorAll('button')).find((el) =>
        el.textContent?.includes('button'),
      )!,
    );

    expect(
      (
        document.querySelector('input[name="firstName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('bill');
    expect(
      (
        document.querySelector('input[name="lastName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('luo');
    expect(
      (
        document.querySelector('input[name="users"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('users#1');
    expect(
      (
        document.querySelector('input[name="objectData.test"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('data');
    expect(
      (
        document.querySelector('input[name="deepNest.level1.level2.data"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('hey');
  });
});
