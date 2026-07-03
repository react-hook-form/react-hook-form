import { fireEvent } from '@testing-library/react';
import { describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('useFormState', () => {
  it('should subscribed to the form state without re-render the root', async () => {
    await renderApp('http://localhost:3000/useFormState');
    const renderCountStart = getRenderCount();
    await userEvent.click(document.querySelector('button#submit')!);

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
    await userEvent.selectOptions(
      document.querySelector('select[name="selectNumber"]')!,
      '1',
    );
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

    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: true,
      touched: [
        'nestItem',
        'firstName',
        'arrayItem',
        'lastName',
        'selectNumber',
        'minLength',
        'pattern',
        'min',
        'max',
        'minDate',
        'maxDate',
      ],
      dirty: [
        'nestItem',
        'arrayItem',
        'firstName',
        'lastName',
        'min',
        'max',
        'minDate',
        'maxDate',
        'minLength',
        'minRequiredLength',
        'selectNumber',
        'pattern',
      ],
      isSubmitted: true,
      isSubmitSuccessful: false,
      submitCount: 1,
      isValid: false,
    });

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

    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: true,
      touched: [
        'nestItem',
        'firstName',
        'arrayItem',
        'lastName',
        'selectNumber',
        'minLength',
        'pattern',
        'min',
        'max',
        'minDate',
        'maxDate',
        'minRequiredLength',
      ],
      dirty: [
        'nestItem',
        'arrayItem',
        'firstName',
        'lastName',
        'min',
        'max',
        'minDate',
        'maxDate',
        'minLength',
        'minRequiredLength',
        'selectNumber',
        'pattern',
      ],
      isSubmitted: true,
      isSubmitSuccessful: false,
      submitCount: 1,
      isValid: true,
    });

    await userEvent.click(document.querySelector('#submit')!);

    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: true,
      touched: [
        'nestItem',
        'firstName',
        'arrayItem',
        'lastName',
        'selectNumber',
        'minLength',
        'pattern',
        'min',
        'max',
        'minDate',
        'maxDate',
        'minRequiredLength',
      ],
      dirty: [
        'nestItem',
        'arrayItem',
        'firstName',
        'lastName',
        'min',
        'max',
        'minDate',
        'maxDate',
        'minLength',
        'minRequiredLength',
        'selectNumber',
        'pattern',
      ],
      isSubmitted: true,
      isSubmitSuccessful: true,
      submitCount: 2,
      isValid: true,
    });

    await userEvent.click(document.querySelector('#resetForm')!);

    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: false,
      touched: [],
      dirty: [],
      isSubmitted: false,
      isSubmitSuccessful: false,
      submitCount: 0,
      isValid: true,
    });

    expectRenderCountDelta(renderCountStart, 1);
  });
});
