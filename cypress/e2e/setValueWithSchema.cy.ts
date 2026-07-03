import { describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('form setValue with schema', () => {
  it('should set input value, trigger validation and clear all errors', async () => {
    await renderApp('http://localhost:3000/setValueWithSchema');
    const renderCountStart = getRenderCount();
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'a');
      else await userEvent.type(el, 'a');
    })();
    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    expect(document.querySelectorAll('p')).toHaveLength(1);
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'asdasdasdasd');
      else await userEvent.type(el, 'asdasdasdasd');
    })();

    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'a');
      else await userEvent.type(el, 'a');
    })();
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }
    expect(document.querySelectorAll('p')).toHaveLength(1);
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'asdasdasdasd');
      else await userEvent.type(el, 'asdasdasdasd');
    })();

    await (async () => {
      const el = document.querySelector(
        'input[name="age"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'a2323');
      else await userEvent.type(el, 'a2323');
    })();

    await userEvent.click(document.querySelector('#submit')!);
    expect(document.querySelectorAll('p')).toHaveLength(1);
    {
      const inputs = document.querySelectorAll('input[name="requiredField"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'RequiredField error',
      );
    }

    await userEvent.click(document.querySelector('#setValue')!);
    expect(
      (
        document.querySelector('input[name="requiredField"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('test123456789');
    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);

    expectRenderCountDelta(renderCountStart, 34);
  });
});
