import { userEvent } from 'vitest/browser';

import { renderApp } from '../support/renderApp';

describe('defaultValues', () => {
  it('should populate defaultValue for inputs', async () => {
    await renderApp('http://localhost:3000/default-values');
    expect(
      (
        document.querySelector('input[name="test"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('test');
    expect(
      (
        document.querySelector('input[name="test1.firstName"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('firstName');
    expect(
      (
        document.querySelector('input[name="test1.lastName.0"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('lastName0');
    expect(
      (
        document.querySelector('input[name="test1.lastName.1"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('lastName1');
    expect(
      (
        Array.from(
          document.querySelectorAll('input[name="checkbox"]'),
        )[0] as HTMLInputElement
      ).checked,
    ).toBe(true);
    expect(
      (
        Array.from(
          document.querySelectorAll('input[name="checkbox"]'),
        )[1] as HTMLInputElement
      ).checked,
    ).toBe(true);

    await userEvent.click(
      Array.from(document.querySelectorAll('input[name="checkbox"]'))[0],
    );
    await userEvent.click(document.querySelector('#toggle')!);
    await userEvent.click(document.querySelector('#toggle')!);

    expect(
      (
        Array.from(
          document.querySelectorAll('input[name="checkbox"]'),
        )[0] as HTMLInputElement
      ).checked,
    ).toBe(false);
    expect(
      (
        Array.from(
          document.querySelectorAll('input[name="checkbox"]'),
        )[1] as HTMLInputElement
      ).checked,
    ).toBe(true);
    await userEvent.click(
      Array.from(document.querySelectorAll('input[name="checkbox"]'))[1],
    );

    await userEvent.click(document.querySelector('#toggle')!);
    await userEvent.click(document.querySelector('#toggle')!);

    expect(
      (
        Array.from(
          document.querySelectorAll('input[name="checkbox"]'),
        )[0] as HTMLInputElement
      ).checked,
    ).toBe(false);
    expect(
      (
        Array.from(
          document.querySelectorAll('input[name="checkbox"]'),
        )[1] as HTMLInputElement
      ).checked,
    ).toBe(false);
  });
});
