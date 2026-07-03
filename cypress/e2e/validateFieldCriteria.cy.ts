import { describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('validate field criteria', () => {
  it('should validate the form, show all errors and clear all', async () => {
    await renderApp('http://localhost:3000/validate-field-criteria');
    const renderCountStart = getRenderCount();
    await userEvent.click(document.querySelector('button#submit')!);
    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName required',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'te');
      else await userEvent.type(el, 'te');
    })();
    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName minLength',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'testtesttest');
      else await userEvent.type(el, 'testtesttest');
    })();

    {
      const inputs = document.querySelectorAll('input[name="min"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('min required');
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="min"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2');
      else await userEvent.type(el, '2');
    })();
    {
      const inputs = document.querySelectorAll('input[name="min"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('min min');
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="min"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '32');
      else await userEvent.type(el, '32');
    })();
    {
      const inputs = document.querySelectorAll('input[name="min"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('min max');
    }
    await userEvent.clear(document.querySelector('input[name="min"]')!);
    await (async () => {
      const el = document.querySelector(
        'input[name="min"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '10');
      else await userEvent.type(el, '10');
    })();

    {
      const inputs = document.querySelectorAll('input[name="minDate"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'minDate required',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="minDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-07-01');
      else await userEvent.type(el, '2019-07-01');
    })();
    {
      const inputs = document.querySelectorAll('input[name="minDate"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('minDate min');
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="minDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-08-01');
      else await userEvent.type(el, '2019-08-01');
    })();

    {
      const inputs = document.querySelectorAll('input[name="maxDate"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'maxDate required',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="maxDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-09-01');
      else await userEvent.type(el, '2019-09-01');
    })();
    {
      const inputs = document.querySelectorAll('input[name="maxDate"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('maxDate max');
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="maxDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-08-01');
      else await userEvent.type(el, '2019-08-01');
    })();

    {
      const inputs = document.querySelectorAll('input[name="minLength"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'minLength required',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="minLength"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '1');
      else await userEvent.type(el, '1');
    })();
    {
      const inputs = document.querySelectorAll('input[name="minLength"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'minLength minLength',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="minLength"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '12');
      else await userEvent.type(el, '12');
    })();

    {
      const inputs = document.querySelectorAll('select[name="selectNumber"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'selectNumber required',
      );
    }
    await userEvent.selectOptions(
      document.querySelector('select[name="selectNumber"]')!,
      '12',
    );

    {
      const inputs = document.querySelectorAll('input[name="pattern"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'pattern required',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="pattern"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 't');
      else await userEvent.type(el, 't');
    })();
    {
      const inputs = document.querySelectorAll('input[name="pattern"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'pattern pattern',
      );
    }
    expect(
      document.querySelector('input[name="pattern"] + p + p')!.textContent,
    ).toContain('pattern minLength');
    await userEvent.clear(document.querySelector('input[name="pattern"]')!);
    await (async () => {
      const el = document.querySelector(
        'input[name="pattern"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '12345');
      else await userEvent.type(el, '12345');
    })();

    {
      const inputs = document.querySelectorAll('select[name="multiple"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'multiple required',
      );
    }
    expect(
      document.querySelector('select[name="multiple"] + p + p')!.textContent,
    ).toContain('multiple validate');
    await userEvent.selectOptions(
      document.querySelector('select[name="multiple"]')!,
      'optionA',
    );
    await userEvent.selectOptions(
      document.querySelector('select[name="multiple"]')!,
      'optionB',
    );

    {
      const inputs = document.querySelectorAll('input[name="validate"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('validate test');
    }
    expect(
      document.querySelector('input[name="validate"] + p + p')!.textContent,
    ).toContain('validate test1');
    expect(
      document.querySelector('input[name="validate"] + p + p + p')!.textContent,
    ).toContain('validate test2');
    await (async () => {
      const el = document.querySelector(
        'input[name="validate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);

    await userEvent.click(document.querySelector('#trigger')!);
    expect(document.querySelectorAll('p')).toHaveLength(2);
    expect(document.querySelectorAll('b')).toHaveLength(2);

    await userEvent.click(document.querySelector('#clear')!);
    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    expect(document.querySelectorAll('b')).toHaveLength(0);

    expectRenderCountDelta(renderCountStart, 27);
  });
});
