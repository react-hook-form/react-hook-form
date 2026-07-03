import { fireEvent } from '@testing-library/react';
import { describe, it } from 'vitest';
import { vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('basicSchemaValidation form validation', () => {
  it('should validate the form with onSubmit mode', async () => {
    await renderApp('http://localhost:3000/basic-schema-validation/onSubmit');
    const renderCountStart = getRenderCount();
    await userEvent.click(document.querySelector('button')!);

    expect(document.activeElement).toHaveAttribute('name', 'firstName');

    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }
    {
      const inputs = document.querySelectorAll('select[name="selectNumber"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'selectNumber error',
      );
    }
    {
      const inputs = document.querySelectorAll(
        'input[name="minRequiredLength"]',
      );
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'minRequiredLength error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="radio"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('radio error');
    }

    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'bill');
      else await userEvent.type(el, 'bill');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo123456');
      else await userEvent.type(el, 'luo123456');
    })();
    await userEvent.selectOptions(
      document.querySelector('select[name="selectNumber"]')!,
      '1',
    );
    await (async () => {
      const el = document.querySelector(
        'input[name="pattern"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo');
      else await userEvent.type(el, 'luo');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="min"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '1');
      else await userEvent.type(el, '1');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="max"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '21');
      else await userEvent.type(el, '21');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="minDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-07-30');
      else await userEvent.type(el, '2019-07-30');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="maxDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-08-02');
      else await userEvent.type(el, '2019-08-02');
    })();
    await userEvent.clear(document.querySelector('input[name="lastName"]')!);
    await userEvent.type(
      document.querySelector('input[name="lastName"]')!,
      'luo',
    );
    await (async () => {
      const el = document.querySelector(
        'input[name="minLength"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'b');
      else await userEvent.type(el, 'b');
    })();
    {
      const inputs = document.querySelectorAll('input[name="minLength"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'minLength error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="pattern"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('pattern error');
    }
    {
      const inputs = document.querySelectorAll('input[name="min"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('min error');
    }
    {
      const inputs = document.querySelectorAll('input[name="max"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('max error');
    }
    {
      const inputs = document.querySelectorAll('input[name="minDate"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('minDate error');
    }
    {
      const inputs = document.querySelectorAll('input[name="maxDate"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('maxDate error');
    }

    await (async () => {
      const el = document.querySelector(
        'input[name="pattern"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '23');
      else await userEvent.type(el, '23');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="minLength"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'bi');
      else await userEvent.type(el, 'bi');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="minRequiredLength"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'bi');
      else await userEvent.type(el, 'bi');
    })();
    await (async () => {
      const el = document.querySelector(
        `${'input[name="radio"]'}[value="${'1'}"]`,
      )! as HTMLInputElement;
      if (!el.checked) {
        if (el.type === 'radio') fireEvent.click(el);
        else await userEvent.click(el);
      }
    })();
    await userEvent.clear(document.querySelector('input[name="min"]')!);
    await userEvent.type(document.querySelector('input[name="min"]')!, '11');
    await userEvent.clear(document.querySelector('input[name="max"]')!);
    await userEvent.type(document.querySelector('input[name="max"]')!, '19');
    await (async () => {
      const el = document.querySelector(
        'input[name="minDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-08-01');
      else await userEvent.type(el, '2019-08-01');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="maxDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-08-01');
      else await userEvent.type(el, '2019-08-01');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="maxDate"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="checkbox"]',
      )! as HTMLInputElement;
      if (!el.checked) {
        if (el.type === 'radio') fireEvent.click(el);
        else await userEvent.click(el);
      }
    })();

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    expectRenderCountDelta(renderCountStart, 24);
  });

  it('should validate the form with onBlur mode', async () => {
    await renderApp('http://localhost:3000/basic-schema-validation/onBlur');
    const renderCountStart = getRenderCount();
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'bill');
      else await userEvent.type(el, 'bill');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo123456');
      else await userEvent.type(el, 'luo123456');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'select[name="selectNumber"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'select[name="selectNumber"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    {
      const inputs = document.querySelectorAll('select[name="selectNumber"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'selectNumber error',
      );
    }
    await userEvent.selectOptions(
      document.querySelector('select[name="selectNumber"]')!,
      '1',
    );
    await (async () => {
      const el = document.querySelector(
        'input[name="pattern"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo');
      else await userEvent.type(el, 'luo');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="min"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '1');
      else await userEvent.type(el, '1');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="max"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '21');
      else await userEvent.type(el, '21');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="minDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-07-30');
      else await userEvent.type(el, '2019-07-30');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="maxDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-08-02');
      else await userEvent.type(el, '2019-08-02');
    })();
    await userEvent.clear(document.querySelector('input[name="lastName"]')!);
    await userEvent.type(
      document.querySelector('input[name="lastName"]')!,
      'luo',
    );
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="minLength"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'b');
      else await userEvent.type(el, 'b');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="minLength"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();

    {
      const inputs = document.querySelectorAll('input[name="pattern"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('pattern error');
    }
    {
      const inputs = document.querySelectorAll('input[name="minLength"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'minLength error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="min"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('min error');
    }
    {
      const inputs = document.querySelectorAll('input[name="max"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('max error');
    }
    {
      const inputs = document.querySelectorAll('input[name="minDate"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('minDate error');
    }
    {
      const inputs = document.querySelectorAll('input[name="maxDate"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('maxDate error');
    }

    await (async () => {
      const el = document.querySelector(
        'input[name="pattern"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '23');
      else await userEvent.type(el, '23');
    })();
    await userEvent.clear(document.querySelector('input[name="minLength"]')!);
    await userEvent.type(
      document.querySelector('input[name="minLength"]')!,
      'bi',
    );
    await (async () => {
      const el = document.querySelector(
        'input[name="minRequiredLength"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'bi');
      else await userEvent.type(el, 'bi');
    })();
    await (async () => {
      const el = Array.from(
        document.querySelectorAll('input[name="radio"]'),
      )[0] as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = Array.from(
        document.querySelectorAll('input[name="radio"]'),
      )[0] as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    await vi.waitFor(() => {
      const inputs = document.querySelectorAll('input[name="radio"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('radio error');
    });
    await (async () => {
      const el = document.querySelector(
        `${'input[name="radio"]'}[value="${'1'}"]`,
      )! as HTMLInputElement;
      if (!el.checked) {
        if (el.type === 'radio') fireEvent.click(el);
        else await userEvent.click(el);
      }
    })();
    await (async () => {
      const el = Array.from(
        document.querySelectorAll('input[name="radio"]'),
      )[0] as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    await userEvent.clear(document.querySelector('input[name="min"]')!);
    await userEvent.type(document.querySelector('input[name="min"]')!, '11');
    await userEvent.clear(document.querySelector('input[name="max"]')!);
    await userEvent.type(document.querySelector('input[name="max"]')!, '19');
    await (async () => {
      const el = document.querySelector(
        'input[name="minDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-08-01');
      else await userEvent.type(el, '2019-08-01');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="maxDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-08-01');
      else await userEvent.type(el, '2019-08-01');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="maxDate"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="minRequiredLength"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="checkbox"]',
      )! as HTMLInputElement;
      if (!el.checked) {
        if (el.type === 'radio') fireEvent.click(el);
        else await userEvent.click(el);
      }
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="checkbox"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();

    await vi.waitFor(() =>
      expect(
        Array.from(document.querySelectorAll('p')).filter((p) =>
          p.textContent?.includes('error'),
        ),
      ).toHaveLength(0),
    );
  });

  it('should validate the form with onChange mode', async () => {
    await renderApp('http://localhost:3000/basic-schema-validation/onChange');
    const renderCountStart = getRenderCount();
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'bill');
      else await userEvent.type(el, 'bill');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo123456');
      else await userEvent.type(el, 'luo123456');
    })();
    await userEvent.clear(document.querySelector('input[name="lastName"]')!);
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo123456');
      else await userEvent.type(el, 'luo123456');
    })();
    {
      const inputs = document.querySelectorAll('input[name="lastName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'lastName error',
      );
    }
    await userEvent.selectOptions(
      document.querySelector('select[name="selectNumber"]')!,
      '1',
    );
    await userEvent.selectOptions(
      document.querySelector('select[name="selectNumber"]')!,
      '',
    );
    {
      const inputs = document.querySelectorAll('select[name="selectNumber"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'selectNumber error',
      );
    }
    await userEvent.selectOptions(
      document.querySelector('select[name="selectNumber"]')!,
      '1',
    );
    await (async () => {
      const el = document.querySelector(
        'input[name="pattern"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo');
      else await userEvent.type(el, 'luo');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="min"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '1');
      else await userEvent.type(el, '1');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="max"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '21');
      else await userEvent.type(el, '21');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="minDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-07-30');
      else await userEvent.type(el, '2019-07-30');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="maxDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-08-02');
      else await userEvent.type(el, '2019-08-02');
    })();
    await userEvent.clear(document.querySelector('input[name="lastName"]')!);
    await userEvent.type(
      document.querySelector('input[name="lastName"]')!,
      'luo',
    );
    await (async () => {
      const el = document.querySelector(
        'input[name="minLength"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'b');
      else await userEvent.type(el, 'b');
    })();

    {
      const inputs = document.querySelectorAll('input[name="pattern"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('pattern error');
    }
    {
      const inputs = document.querySelectorAll('input[name="minLength"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'minLength error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="min"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('min error');
    }
    {
      const inputs = document.querySelectorAll('input[name="max"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('max error');
    }
    {
      const inputs = document.querySelectorAll('input[name="minDate"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('minDate error');
    }
    {
      const inputs = document.querySelectorAll('input[name="maxDate"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('maxDate error');
    }

    await (async () => {
      const el = document.querySelector(
        'input[name="pattern"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '23');
      else await userEvent.type(el, '23');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="minLength"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'bi');
      else await userEvent.type(el, 'bi');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="minRequiredLength"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'bi');
      else await userEvent.type(el, 'bi');
    })();
    await (async () => {
      const el = Array.from(
        document.querySelectorAll('input[name="radio"]'),
      )[0] as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        `${'input[name="radio"]'}[value="${'1'}"]`,
      )! as HTMLInputElement;
      if (!el.checked) {
        if (el.type === 'radio') fireEvent.click(el);
        else await userEvent.click(el);
      }
    })();
    await userEvent.clear(document.querySelector('input[name="min"]')!);
    await userEvent.type(document.querySelector('input[name="min"]')!, '11');
    await userEvent.clear(document.querySelector('input[name="max"]')!);
    await userEvent.type(document.querySelector('input[name="max"]')!, '19');
    await (async () => {
      const el = document.querySelector(
        'input[name="minDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-08-01');
      else await userEvent.type(el, '2019-08-01');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="maxDate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2019-08-01');
      else await userEvent.type(el, '2019-08-01');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="checkbox"]',
      )! as HTMLInputElement;
      if (!el.checked) {
        if (el.type === 'radio') fireEvent.click(el);
        else await userEvent.click(el);
      }
    })();

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    expectRenderCountDelta(renderCountStart, 26);
  });
});
