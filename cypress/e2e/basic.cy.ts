import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('basic form validation', () => {
  it('should validate the form and reset the form', async () => {
    await renderApp('http://localhost:3000/basic/onSubmit');
    const renderCountStart = getRenderCount();
    await userEvent.click(document.querySelector('button#submit')!);

    expect(document.activeElement).toHaveAttribute('name', 'nestItem.nest1');

    {
      const inputs = document.querySelectorAll('input[name="firstName"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'firstName error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="nestItem.nest1"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('nest 1 error');
    }
    {
      const inputs = document.querySelectorAll(
        'input[name="arrayItem.0.test1"]',
      );
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'array item 1 error',
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
      const inputs = document.querySelectorAll('select[name="multiple"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'multiple error',
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
    {
      const inputs = document.querySelectorAll('input[name="checkbox"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'checkbox error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="checkboxArray"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'checkboxArray error',
      );
    }
    {
      const inputs = document.querySelectorAll('input[name="validate"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'validate error',
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
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'a');
      else await userEvent.type(el, 'a');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="arrayItem.0.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'ab');
      else await userEvent.type(el, 'ab');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="nestItem.nest1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'ab');
      else await userEvent.type(el, 'ab');
    })();
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
    await (async () => {
      const el = document.querySelector(
        'input[name="validate"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
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
    await userEvent.selectOptions(
      document.querySelector('select[name="multiple"]')!,
      ['optionA'],
    );
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
    await (async () => {
      const el = document.querySelector(
        `${'input[name="checkboxArray"]'}[value="${'3'}"]`,
      )! as HTMLInputElement;
      if (!el.checked) {
        if (el.type === 'radio') fireEvent.click(el);
        else await userEvent.click(el);
      }
    })();
    await userEvent.selectOptions(
      document.querySelector('select[name="multiple"]')!,
      ['optionA', 'optionB'],
    );

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);

    await userEvent.click(document.querySelector('#submit')!);

    expect(
      JSON.parse(document.querySelector('pre')!.textContent ?? ''),
    ).toEqual({
      nestItem: { nest1: 'ab' },
      arrayItem: [{ test1: 'ab' }],
      firstName: 'billa',
      lastName: 'luo',
      min: '11',
      max: '19',
      minDate: '2019-08-01',
      maxDate: '2019-08-01',
      minLength: 'bbi',
      minRequiredLength: 'bi',
      selectNumber: '1',
      pattern: 'luo23',
      radio: '1',
      checkbox: true,
      checkboxArray: ['3'],
      multiple: ['optionA', 'optionB'],
      validate: 'test',
    });
    await userEvent.click(document.querySelector('#submit')!);

    await userEvent.click(document.querySelector('#resetForm')!);
    {
      const el = document.querySelector('input[name="firstName"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="lastName"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    expect(
      (
        document.querySelector('select[name="selectNumber"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('');
    {
      const el = document.querySelector('input[name="minRequiredLength"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="radio"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="max"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="min"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="minLength"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="checkbox"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="pattern"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="minDate"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="maxDate"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    expect(
      document.querySelector('#on-invalid-called-times')!.textContent,
    ).toContain('1');
    expectRenderCountDelta(renderCountStart, 34);
  });

  it('should validate the form with onTouched mode', async () => {
    await renderApp('http://localhost:3000/basic/onTouched');
    const renderCountStart = getRenderCount();
    await (async () => {
      const el = document.querySelector(
        'input[name="nestItem.nest1"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="nestItem.nest1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await userEvent.clear(
      document.querySelector('input[name="nestItem.nest1"]')!,
    );
    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    await (async () => {
      const el = document.querySelector(
        'input[name="nestItem.nest1"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    {
      const inputs = document.querySelectorAll('input[name="nestItem.nest1"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('nest 1 error');
    }

    await (async () => {
      const el = document.querySelector(
        'input[name="arrayItem.0.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="arrayItem.0.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    {
      const inputs = document.querySelectorAll(
        'input[name="arrayItem.0.test1"]',
      );
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'array item 1 error',
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
        'input[name="radio"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="radio"]',
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
        `${'input[name="radio"]'}[value="${'1'}"]`,
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
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
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

    await (async () => {
      const el = document.querySelector(
        'input[name="nestItem.nest1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="arrayItem.0.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    expectRenderCountDelta(renderCountStart, 10);
  });

  it('should validate the form with onBlur mode and reset the form', async () => {
    await renderApp('http://localhost:3000/basic/onBlur');
    const renderCountStart = getRenderCount();
    await (async () => {
      const el = document.querySelector(
        'input[name="nestItem.nest1"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="nestItem.nest1"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    {
      const inputs = document.querySelectorAll('input[name="nestItem.nest1"]');
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain('nest 1 error');
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="nestItem.nest1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'a');
      else await userEvent.type(el, 'a');
    })();

    await (async () => {
      const el = document.querySelector(
        'input[name="arrayItem.0.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="arrayItem.0.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    {
      const inputs = document.querySelectorAll(
        'input[name="arrayItem.0.test1"]',
      );
      const input = inputs.length > 1 ? inputs[inputs.length - 1] : inputs[0];
      expect(input?.nextElementSibling?.textContent).toContain(
        'array item 1 error',
      );
    }
    await (async () => {
      const el = document.querySelector(
        'input[name="arrayItem.0.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'a');
      else await userEvent.type(el, 'a');
    })();

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
    await userEvent.selectOptions(
      document.querySelector('select[name="multiple"]')!,
      ['optionA'],
    );
    await (async () => {
      const el = document.querySelector(
        'input[name="radio"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="radio"]',
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
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
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
    fireEvent.change(document.querySelector('select[name="selectNumber"]')!, {
      target: { value: '1' },
    });

    await userEvent.click(document.querySelector('#resetForm')!);
    {
      const el = document.querySelector('input[name="firstName"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="lastName"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    expect(
      (
        document.querySelector('select[name="selectNumber"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('');
    {
      const el = document.querySelector('input[name="minRequiredLength"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="radio"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="max"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="min"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="minLength"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="checkbox"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="pattern"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="minDate"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="maxDate"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    expectRenderCountDelta(renderCountStart, 25);
  });

  it('should validate the form with onChange mode and reset the form', async () => {
    await renderApp('http://localhost:3000/basic/onChange');
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
    await userEvent.selectOptions(
      document.querySelector('select[name="multiple"]')!,
      ['optionA'],
    );
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

    await userEvent.click(document.querySelector('#resetForm')!);
    {
      const el = document.querySelector('input[name="firstName"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="lastName"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    expect(
      (
        document.querySelector('select[name="selectNumber"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('');
    {
      const el = document.querySelector('input[name="minRequiredLength"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="radio"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="max"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="min"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="minLength"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="checkbox"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="pattern"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="minDate"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    {
      const el = document.querySelector('input[name="maxDate"]')! as
        | HTMLInputElement
        | HTMLSelectElement;
      if (el instanceof HTMLInputElement && el.type === 'radio') {
        expect(
          document.querySelector(`input[name="${el.name}"]:checked`),
        ).toBeNull();
      } else if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        expect(el.checked).toBe(false);
      } else {
        expect(el.value).toBe('');
      }
    }
    expectRenderCountDelta(renderCountStart, 21);
  });
});
