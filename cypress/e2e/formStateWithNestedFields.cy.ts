import { fireEvent } from '@testing-library/react';
import { describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('form state with nested fields', () => {
  it('should return correct form state with onSubmit mode', async () => {
    await renderApp('http://localhost:3000/formStateWithNestedFields/onSubmit');
    const renderCountStart = getRenderCount();
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: [],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
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
      dirty: ['left.test1'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await userEvent.clear(document.querySelector('input[name="left.test1"]')!);

    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test2"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test2"]',
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
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await userEvent.clear(document.querySelector('input[name="left.test2"]')!);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: true,
      dirty: ['left.test1'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="left.test2"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: true,
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: true,
      submitCount: 2,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });
    expectRenderCountDelta(renderCountStart, 15);
  });

  it('should return correct form state with onChange mode', async () => {
    await renderApp('http://localhost:3000/formStateWithNestedFields/onChange');
    const renderCountStart = getRenderCount();
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: [],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
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
      dirty: ['left.test1'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await userEvent.clear(document.querySelector('input[name="left.test1"]')!);
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test2"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test2"]',
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
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await userEvent.clear(document.querySelector('input[name="left.test2"]')!);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: true,
      dirty: ['left.test1'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="left.test2"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: true,
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: true,
      submitCount: 2,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });
    expectRenderCountDelta(renderCountStart, 13);
  });

  it('should return correct form state with onBlur mode', async () => {
    await renderApp('http://localhost:3000/formStateWithNestedFields/onBlur');
    const renderCountStart = getRenderCount();
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: [],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
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
      dirty: ['left.test1'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await userEvent.clear(document.querySelector('input[name="left.test1"]')!);
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test2"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test2"]',
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
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await userEvent.clear(document.querySelector('input[name="left.test2"]')!);

    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: true,
      dirty: ['left.test1'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="left.test2"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await userEvent.click(document.querySelector('#submit')!);
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: true,
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: true,
      submitCount: 2,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });
    expectRenderCountDelta(renderCountStart, 13);
  });

  it('should reset dirty value when inputs reset back to default with onSubmit mode', async () => {
    await renderApp('http://localhost:3000/formStateWithNestedFields/onSubmit');
    const renderCountStart = getRenderCount();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
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
        'input[name="left.test2"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test2"]',
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
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await userEvent.clear(document.querySelector('input[name="left.test1"]')!);
    await userEvent.clear(document.querySelector('input[name="left.test2"]')!);

    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    expectRenderCountDelta(renderCountStart, 9);
  });

  it('should reset dirty value when inputs reset back to default with onBlur mode', async () => {
    await renderApp('http://localhost:3000/formStateWithNestedFields/onBlur');
    const renderCountStart = getRenderCount();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
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
        'input[name="left.test2"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test2"]',
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
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await userEvent.clear(document.querySelector('input[name="left.test1"]')!);
    await userEvent.clear(document.querySelector('input[name="left.test2"]')!);
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test2"]',
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
      isDirty: false,
      dirty: [],
      isSubmitted: false,

      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });
    expectRenderCountDelta(renderCountStart, 8);
  });

  it('should reset dirty value when inputs reset back to default with onChange mode', async () => {
    await renderApp('http://localhost:3000/formStateWithNestedFields/onChange');
    const renderCountStart = getRenderCount();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
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
        'input[name="left.test2"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test2"]',
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
      dirty: ['left.test1', 'left.test2'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });

    await userEvent.click(document.querySelector('#resetForm')!);

    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: [],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test1"]',
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
        'input[name="left.test2"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="left.test2"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();

    await userEvent.clear(document.querySelector('input[name="left.test1"]')!);
    await userEvent.clear(document.querySelector('input[name="left.test2"]')!);

    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      isDirty: false,
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: ['left.test1', 'left.test2'],
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

    expectRenderCountDelta(renderCountStart, 13);
  });
});
