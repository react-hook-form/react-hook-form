import { fireEvent } from '@testing-library/react';
import { describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('useFieldArrayUnregister', () => {
  it('should behaviour correctly', async () => {
    await renderApp('http://localhost:3000/UseFieldArrayUnregister');
    const renderCountStart = getRenderCount();
    await userEvent.clear(document.querySelector('#field0')!);
    await userEvent.type(document.querySelector('#field0')!, 'bill');

    await (async () => {
      const el = document.querySelector(
        'input[name="data.0.conditional"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();

    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [{ name: true, conditional: true }, null, null],
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="data.0.conditional"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();

    expect(
      JSON.parse(document.querySelector('#touched')!.textContent ?? ''),
    ).toEqual([{ name: true, conditional: true }]);

    await userEvent.click(document.querySelector('#prepend')!);

    expect(
      document.querySelector('input[name="data.0.conditional"]'),
    ).toBeNull();
    expect(
      (
        document.querySelector('input[name="data.1.conditional"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('');

    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: true, conditional: true },
        { name: true, conditional: true },
        { name: true },
        { name: true },
      ],
    });

    expect(
      JSON.parse(document.querySelector('#touched')!.textContent ?? ''),
    ).toEqual([null, { name: true, conditional: true }]);

    await (async () => {
      const el = document.querySelector(
        'input[name="data.0.name"]',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();

    await userEvent.click(document.querySelector('#swap')!);

    expect(
      document.querySelector('input[name="data.1.conditional"]'),
    ).toBeNull();
    expect(
      (
        document.querySelector('input[name="data.2.conditional"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('');

    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: true },
        null,
        { name: true, conditional: true },
        { name: true },
      ],
    });

    expect(
      JSON.parse(document.querySelector('#touched')!.textContent ?? ''),
    ).toEqual([
      { name: true },
      null,
      { name: true, conditional: true },
      { name: true },
    ]);

    await userEvent.click(document.querySelector('#insert')!);

    await userEvent.click(document.querySelector('#insert')!);

    await (async () => {
      const el = document.querySelector(
        'input[name="data.4.name"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();

    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: true },
        { name: true, conditional: true },
        { name: true },
        { name: true },
        { name: true, conditional: true },
        { name: true },
      ],
    });

    expect(
      JSON.parse(document.querySelector('#touched')!.textContent ?? ''),
    ).toEqual([
      { name: true },
      { name: true },
      { name: true },
      null,
      { name: true, conditional: true },
      { name: true },
    ]);

    await userEvent.click(document.querySelector('#move')!);

    await userEvent.clear(document.querySelector('input[name="data.2.name"]')!);
    await userEvent.type(
      document.querySelector('input[name="data.2.name"]')!,
      'bill',
    );

    expect(
      JSON.parse(document.querySelector('#dirtyFields')!.textContent ?? ''),
    ).toEqual({
      data: [
        { name: true },
        { name: true },
        { name: true, conditional: true },
        { name: true },
        { name: true },
        { name: true },
      ],
    });

    expect(
      JSON.parse(document.querySelector('#touched')!.textContent ?? ''),
    ).toEqual([
      { name: true },
      { name: true },
      { name: true, conditional: true },
      { name: true },
      null,
      { name: true },
    ]);

    await userEvent.click(document.querySelector('#delete1')!);

    const submitData = Array.from(document.querySelectorAll('ul > li')).map(
      (li) => {
        const nameInput = li.querySelector(
          'input[name$=".name"]',
        ) as HTMLInputElement;
        const conditionalInput = li.querySelector(
          'input[name$=".conditional"]',
        ) as HTMLInputElement | null;
        return conditionalInput
          ? { name: nameInput.value, conditional: conditionalInput.value }
          : { name: nameInput.value };
      },
    );
    await userEvent.click(document.querySelector('#submit')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: submitData,
    });

    await (async () => {
      const el = document.querySelector(
        'input[name="data.3.name"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();

    const submitData2 = Array.from(document.querySelectorAll('ul > li')).map(
      (li) => {
        const nameInput = li.querySelector(
          'input[name$=".name"]',
        ) as HTMLInputElement;
        const conditionalInput = li.querySelector(
          'input[name$=".conditional"]',
        ) as HTMLInputElement | null;
        return conditionalInput
          ? { name: nameInput.value, conditional: conditionalInput.value }
          : { name: nameInput.value };
      },
    );
    await userEvent.click(document.querySelector('#submit')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: submitData2,
    });

    await userEvent.click(document.querySelector('#delete3')!);

    const submitData3 = Array.from(document.querySelectorAll('ul > li')).map(
      (li) => {
        const nameInput = li.querySelector(
          'input[name$=".name"]',
        ) as HTMLInputElement;
        const conditionalInput = li.querySelector(
          'input[name$=".conditional"]',
        ) as HTMLInputElement | null;
        return conditionalInput
          ? { name: nameInput.value, conditional: conditionalInput.value }
          : { name: nameInput.value };
      },
    );
    await userEvent.click(document.querySelector('#submit')!);

    expect(
      JSON.parse(document.querySelector('#result')!.textContent ?? ''),
    ).toEqual({
      data: submitData3,
    });

    expectRenderCountDelta(renderCountStart, 29);
  });
});
