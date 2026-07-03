import { fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { renderApp } from '../support/renderApp';

function expectInputError(inputSelector: string, text: string) {
  const inputs = document.querySelectorAll(inputSelector);
  const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
  expect(input?.nextElementSibling?.textContent).toContain(text);
}

async function blurInput(selector: string) {
  const el = document.querySelector(selector)! as HTMLInputElement;
  if (el.type === 'radio' || el.type === 'checkbox') {
    fireEvent.blur(el);
    return;
  }

  await userEvent.click(el);
  await userEvent.click(document.body);
  if (document.activeElement === el) el.blur();
}

describe('delayError', () => {
  it('should delay from errors appear', async () => {
    await renderApp('http://localhost:3000/delayError');
    await userEvent.type(
      document.querySelector('input[name="first"]')! as HTMLInputElement,
      '123',
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
    expectInputError('input[name="first"]', 'First too long.');

    await userEvent.type(
      document.querySelector('input[name="last"]')! as HTMLInputElement,
      '123567',
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
    expectInputError('input[name="last"]', 'Last too long.');

    await blurInput('input[name="last"]');
    await userEvent.click(document.querySelector('button')!);

    await userEvent.clear(document.querySelector('input[name="first"]')!);
    await userEvent.type(document.querySelector('input[name="first"]')!, '123');
    await userEvent.clear(document.querySelector('input[name="last"]')!);
    await userEvent.type(
      document.querySelector('input[name="last"]')!,
      '123567',
    );

    await vi.waitFor(() => {
      expectInputError('input[name="first"]', 'First too long.');
      expectInputError('input[name="last"]', 'Last too long.');
    });

    await userEvent.clear(document.querySelector('input[name="first"]')!);
    await userEvent.type(document.querySelector('input[name="first"]')!, '1');
    await userEvent.clear(document.querySelector('input[name="last"]')!);
    await userEvent.type(document.querySelector('input[name="last"]')!, '12');
    await blurInput('input[name="last"]');

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);

    await userEvent.click(document.querySelector('button')!);

    await userEvent.clear(document.querySelector('input[name="first"]')!);
    await userEvent.type(document.querySelector('input[name="first"]')!, 'aa');
    await userEvent.clear(document.querySelector('input[name="last"]')!);
    await userEvent.type(document.querySelector('input[name="last"]')!, 'a');

    await vi.waitFor(() => {
      expectInputError('input[name="first"]', 'First too long.');
      expectInputError('input[name="last"]', 'Last too long.');
    });

    await userEvent.clear(document.querySelector('input[name="first"]')!);
    await userEvent.type(document.querySelector('input[name="first"]')!, '1');
    await userEvent.clear(document.querySelector('input[name="last"]')!);
    await userEvent.type(document.querySelector('input[name="last"]')!, '12');
    await blurInput('input[name="last"]');

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
  });
});
