import { fireEvent } from '@testing-library/react';
import { userEvent } from 'vitest/browser';

import { renderApp } from '../support/renderApp';

describe('autoUnregister', () => {
  it('should keep all inputs data when inputs get unmounted', async () => {
    await renderApp('http://localhost:3000/autoUnregister');
    await (async () => {
      const el = document.querySelector(
        'input[name="test"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test1');
      else await userEvent.type(el, 'test1');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="test2"]',
      )! as HTMLInputElement;
      if (!el.checked) {
        if (el.type === 'radio') fireEvent.click(el);
        else await userEvent.click(el);
      }
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="test3"]',
      )! as HTMLInputElement;
      if (!el.checked) {
        if (el.type === 'radio') fireEvent.click(el);
        else await userEvent.click(el);
      }
    })();
    await userEvent.selectOptions(
      document.querySelector('select[name="test4"]')!,
      'Bill',
    );
    await userEvent.click(document.querySelector('#input-ReactSelect > div')!);
    await userEvent.click(
      Array.from(
        document.querySelectorAll('#input-ReactSelect > div > div'),
      )[1],
    );

    await userEvent.click(document.querySelector('button')!);
    await userEvent.click(document.querySelector('button')!);

    expect(
      (
        document.querySelector('input[name="test"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('test');
    expect(
      (
        document.querySelector('input[name="test1"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('test1');
    expect(
      (document.querySelector('input[name="test2"]')! as HTMLInputElement)
        .checked,
    ).toBe(true);
    expect(
      (document.querySelector('input[name="test3"]')! as HTMLInputElement)
        .checked,
    ).toBe(true);
    expect(
      (
        document.querySelector('select[name="test4"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('bill');
    expect(
      document.querySelector('#input-ReactSelect > div > div > div > div')!
        .textContent,
    ).toContain('Strawberry');
  });
});
