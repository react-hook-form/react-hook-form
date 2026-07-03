import { describe, it } from 'vitest';
import { vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { renderApp } from '../support/renderApp';

describe('isValid', () => {
  it('should showing valid correctly with build in validation', async () => {
    await renderApp('http://localhost:3000/isValid/build-in/defaultValue');
    expect(document.querySelector('#isValid')!.textContent).toContain('false');

    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    expect(document.querySelector('#isValid')!.textContent).toContain('false');
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    expect(document.querySelector('#isValid')!.textContent).toContain('true');
    await userEvent.click(document.querySelector('#toggle')!);
    expect(document.querySelector('#isValid')!.textContent).toContain('false');
    await userEvent.click(document.querySelector('#toggle')!);
    await vi.waitFor(() =>
      expect(document.querySelector('#isValid')!.textContent).toContain('true'),
    );
  });

  it('should showing valid correctly with build in validation and default values supplied', async () => {
    await renderApp('http://localhost:3000/isValid/build-in/defaultValues');
    await vi.waitFor(() =>
      expect(document.querySelector('#isValid')!.textContent).toContain('true'),
    );

    await userEvent.clear(document.querySelector('input[name="firstName"]')!);
    expect(document.querySelector('#isValid')!.textContent).toContain('false');
    await userEvent.click(document.querySelector('#toggle')!);
    expect(document.querySelector('#isValid')!.textContent).toContain('false');
  });

  it('should showing valid correctly with schema validation', async () => {
    await renderApp('http://localhost:3000/isValid/schema/defaultValue');
    expect(document.querySelector('#isValid')!.textContent).toContain('false');

    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    expect(document.querySelector('#isValid')!.textContent).toContain('false');
    await (async () => {
      const el = document.querySelector(
        'input[name="lastName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    expect(document.querySelector('#isValid')!.textContent).toContain('true');
    await userEvent.click(document.querySelector('#toggle')!);
    expect(document.querySelector('#isValid')!.textContent).toContain('false');
    await userEvent.click(document.querySelector('#toggle')!);
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await vi.waitFor(() =>
      expect(document.querySelector('#isValid')!.textContent).toContain('true'),
    );
  });

  it('should showing valid correctly with schema validation and default value supplied', async () => {
    await renderApp('http://localhost:3000/isValid/schema/defaultValues');
    await vi.waitFor(() =>
      expect(document.querySelector('#isValid')!.textContent).toContain('true'),
    );

    await userEvent.clear(document.querySelector('input[name="firstName"]')!);
    expect(document.querySelector('#isValid')!.textContent).toContain('false');
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 'test');
      else await userEvent.type(el, 'test');
    })();
    await vi.waitFor(() =>
      expect(document.querySelector('#isValid')!.textContent).toContain('true'),
    );
    await userEvent.click(document.querySelector('#toggle')!);
    await vi.waitFor(() =>
      expect(document.querySelector('#isValid')!.textContent).toContain(
        'false',
      ),
    );
    await userEvent.click(document.querySelector('#toggle')!);
    await (async () => {
      const el = document.querySelector(
        'input[name="firstName"]',
      )! as HTMLInputElement;
      if (el.type === 'date') await userEvent.fill(el, 't');
      else await userEvent.type(el, 't');
    })();
    await vi.waitFor(() =>
      expect(document.querySelector('#isValid')!.textContent).toContain('true'),
    );
  });
});
