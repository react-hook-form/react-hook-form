import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('controller basic form validation', () => {
  it('should validate the form and reset the form', async () => {
    await renderApp('http://localhost:3000/controller/onSubmit');
    const renderCountStart = getRenderCount();
    await userEvent.click(document.querySelector('#submit')!);

    expect(document.querySelector('#TextField')!.textContent).toContain(
      'TextField Error',
    );
    expect(document.querySelector('#RadioGroup')!.textContent).toContain(
      'RadioGroup Error',
    );
    expect(document.querySelector('#Checkbox')!.textContent).toContain(
      'Checkbox Error',
    );
    expect(document.querySelector('#Select')!.textContent).toContain(
      'Select Error',
    );
    expect(document.querySelector('#switch')!.textContent).toContain(
      'switch Error',
    );

    await userEvent.click(document.querySelector('#input-checkbox input')!);
    await userEvent.click(
      Array.from(document.querySelectorAll('input[name="gender1"]'))[0],
    );
    await (async () => {
      const el = document.querySelector(
        '#input-textField input',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await userEvent.click(document.querySelector('#input-select > div > div')!);
    await userEvent.click(document.querySelector('.MuiPopover-root ul > li')!);
    await userEvent.click(document.querySelector('#input-switch input')!);
    await userEvent.click(document.querySelector('#input-ReactSelect > div')!);
    await userEvent.click(
      Array.from(
        document.querySelectorAll('#input-ReactSelect > div > div'),
      )[1],
    );

    expect(
      Array.from(document.querySelectorAll('.container > p')).filter((p) =>
        p.textContent?.includes('Error'),
      ),
    ).toHaveLength(0);
    expectRenderCountDelta(renderCountStart, 8);
  });

  it('should validate the form with onBlur mode and reset the form', async () => {
    await renderApp('http://localhost:3000/controller/onBlur');
    const renderCountStart = getRenderCount();
    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    await (async () => {
      const el = document.querySelector(
        '#input-checkbox input',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        '#input-checkbox input',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    await vi.waitFor(() =>
      expect(document.querySelector('#Checkbox')!.textContent).toContain(
        'Checkbox Error',
      ),
    );

    await (async () => {
      const el = document.querySelector(
        '#input-textField input',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        '#input-textField input',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    expect(document.querySelector('#TextField')!.textContent).toContain(
      'TextField Error',
    );

    fireEvent.focus(document.querySelector('#input-select > div > div')!);
    fireEvent.blur(document.querySelector('#input-select > div > div')!);
    await vi.waitFor(() =>
      expect(document.querySelector('#Select')!.textContent).toContain(
        'Select Error',
      ),
    );

    await (async () => {
      const el = document.querySelector(
        '#input-switch input',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.focus(el);
      else await userEvent.click(el);
    })();
    await (async () => {
      const el = document.querySelector(
        '#input-switch input',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();
    await vi.waitFor(() =>
      expect(document.querySelector('#switch')!.textContent).toContain(
        'switch Error',
      ),
    );

    await userEvent.click(document.querySelector('#input-checkbox input')!);
    await (async () => {
      const el = document.querySelector(
        '#input-textField input',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await userEvent.click(document.querySelector('#input-select > div > div')!);
    await userEvent.click(document.querySelector('.MuiPopover-root ul > li')!);
    await userEvent.click(document.querySelector('#input-switch input')!);
    await (async () => {
      const el = document.querySelector(
        '#input-switch input',
      )! as HTMLInputElement;
      if (el.type === 'radio' || el.type === 'checkbox') fireEvent.blur(el);
      else {
        await userEvent.click(el);
        await userEvent.click(document.body);
        if (document.activeElement === el) el.blur();
      }
    })();

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    expectRenderCountDelta(renderCountStart, 9);
  });

  it('should validate the form with onChange mode and reset the form', async () => {
    await renderApp('http://localhost:3000/controller/onChange');
    const renderCountStart = getRenderCount();
    await userEvent.click(document.querySelector('#input-checkbox input')!);
    await userEvent.click(document.querySelector('#input-checkbox input')!);
    expect(document.querySelector('#Checkbox')!.textContent).toContain(
      'Checkbox Error',
    );

    await (async () => {
      const el = document.querySelector(
        '#input-textField input',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await userEvent.clear(document.querySelector('#input-textField input')!);
    expect(document.querySelector('#TextField')!.textContent).toContain(
      'TextField Error',
    );

    await userEvent.click(document.querySelector('#input-switch input')!);
    await userEvent.click(document.querySelector('#input-switch input')!);
    expect(document.querySelector('#switch')!.textContent).toContain(
      'switch Error',
    );

    await userEvent.click(document.querySelector('#input-checkbox input')!);
    await (async () => {
      const el = document.querySelector(
        '#input-textField input',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await userEvent.click(document.querySelector('#input-switch input')!);

    expect(
      Array.from(document.querySelectorAll('p')).filter((p) =>
        p.textContent?.includes('error'),
      ),
    ).toHaveLength(0);
    expectRenderCountDelta(renderCountStart, 7);
  });
});
