import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('ConditionalField', () => {
  it('should reflect correct form state and data collection', async () => {
    await renderApp('http://localhost:3000/conditionalField');
    const renderCountStart = getRenderCount();
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      dirty: [],
      isSubmitted: false,
      submitCount: 0,
      touched: [],
      isDirty: false,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: false,
    });

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
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'bill');
      else await userEvent.type(el, 'bill');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo');
      else await userEvent.type(el, 'luo');
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
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      dirty: ['selectNumber', 'firstName', 'lastName'],
      isSubmitted: false,
      submitCount: 0,
      touched: ['selectNumber', 'firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: false,
      isValid: true,
    });
    await userEvent.click(document.querySelector('button#submit')!);
    expect(document.querySelector('#result')!.textContent).toContain(
      '{"selectNumber":"1","firstName":"bill","lastName":"luo"}',
    );
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      dirty: ['selectNumber', 'firstName', 'lastName'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['selectNumber', 'firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      selectNumber: '1',
      firstName: 'bill',
      lastName: 'luo',
    });

    await userEvent.selectOptions(
      document.querySelector('select[name="selectNumber"]')!,
      '2',
    );
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      dirty: ['selectNumber', 'firstName', 'lastName'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['selectNumber', 'firstName', 'lastName'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: false,
    });
    await (async () => {
      const el = document.querySelector(
        'input[name="min"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '10');
      else await userEvent.type(el, '10');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="max"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, '2');
      else await userEvent.type(el, '2');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="max"]',
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
      dirty: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
      isSubmitted: true,
      submitCount: 1,
      touched: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });
    await userEvent.click(document.querySelector('button#submit')!);
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      dirty: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
      isSubmitted: true,
      submitCount: 2,
      touched: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      selectNumber: '2',
      firstName: 'bill',
      lastName: 'luo',
      min: '10',
      max: '2',
    });

    await userEvent.selectOptions(
      document.querySelector('select[name="selectNumber"]')!,
      '3',
    );
    expect(
      JSON.parse(document.querySelector('#state')!.textContent ?? ''),
    ).toEqual({
      dirty: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
      isSubmitted: true,
      submitCount: 2,
      touched: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="notRequired"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="notRequired"]',
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
      dirty: [
        'selectNumber',
        'firstName',
        'lastName',
        'min',
        'max',
        'notRequired',
      ],
      isSubmitted: true,
      submitCount: 2,
      touched: [
        'selectNumber',
        'firstName',
        'lastName',
        'min',
        'max',
        'notRequired',
      ],
      isDirty: true,
      isSubmitting: false,
      isSubmitSuccessful: true,
      isValid: true,
    });

    await userEvent.click(document.querySelector('button#submit')!);
    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      selectNumber: '3',
      firstName: 'bill',
      lastName: 'luo',
      min: '10',
      max: '2',
      notRequired: 'test',
    });

    expectRenderCountDelta(renderCountStart, 24);
  });
});
