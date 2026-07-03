import { fireEvent } from '@testing-library/react';
import { userEvent } from 'vitest/browser';

import { renderApp } from '../support/renderApp';

describe('watch form validation', () => {
  it('should watch all inputs', async () => {
    await renderApp('http://localhost:3000/watch');
    expect(
      JSON.parse(document.querySelector('#watchAll')!.textContent ?? ''),
    ).toEqual({
      testSingle: '',
      test: ['', ''],
      testObject: { firstName: '', lastName: '' },
      toggle: false,
    });

    expect(document.querySelector('#HideTestSingle')).toBeNull();
    await (async () => {
      const el = document.querySelector(
        'input[name="testSingle"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'testSingle');
      else await userEvent.type(el, 'testSingle');
    })();
    expect(document.querySelector('#HideTestSingle')!.textContent).toContain(
      'Hide Content TestSingle',
    );
    expect(
      JSON.parse(document.querySelector('#watchAll')!.textContent ?? ''),
    ).toEqual({
      testSingle: 'testSingle',
      test: ['', ''],
      testObject: { firstName: '', lastName: '' },
      toggle: false,
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="test.0"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'bill');
      else await userEvent.type(el, 'bill');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="test.1"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo');
      else await userEvent.type(el, 'luo');
    })();
    expect(document.querySelector('#testData')!.textContent).toContain(
      '["bill","luo"]',
    );
    expect(
      JSON.parse(document.querySelector('#testArray')!.textContent ?? ''),
    ).toEqual(['bill', 'luo']);

    expect(
      JSON.parse(document.querySelector('#watchAll')!.textContent ?? ''),
    ).toEqual({
      testSingle: 'testSingle',
      test: ['bill', 'luo'],
      testObject: { firstName: '', lastName: '' },
      toggle: false,
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="testObject.firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'bill');
      else await userEvent.type(el, 'bill');
    })();
    await (async () => {
      const el = document.querySelector(
        'input[name="testObject.lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'luo');
      else await userEvent.type(el, 'luo');
    })();
    expect(
      JSON.parse(document.querySelector('#testObject')!.textContent ?? ''),
    ).toEqual({
      firstName: 'bill',
      lastName: 'luo',
    });

    expect(
      JSON.parse(document.querySelector('#testArray')!.textContent ?? ''),
    ).toEqual(['bill', 'luo']);

    expect(
      JSON.parse(document.querySelector('#watchAll')!.textContent ?? ''),
    ).toEqual({
      testSingle: 'testSingle',
      test: ['bill', 'luo'],
      testObject: { firstName: 'bill', lastName: 'luo' },
      toggle: false,
    });

    expect(document.querySelector('#hideContent')).toBeNull();
    await (async () => {
      const el = document.querySelector(
        'input[name="toggle"]',
      )! as HTMLInputElement;
      if (!el.checked) {
        if (el.type === 'radio') fireEvent.click(el);
        else await userEvent.click(el);
      }
    })();
    expect(document.querySelector('#hideContent')!.textContent).toContain(
      'Hide Content',
    );

    expect(
      JSON.parse(document.querySelector('#watchAll')!.textContent ?? ''),
    ).toEqual({
      testSingle: 'testSingle',
      test: ['bill', 'luo'],
      testObject: { firstName: 'bill', lastName: 'luo' },
      toggle: true,
    });
  });
});
