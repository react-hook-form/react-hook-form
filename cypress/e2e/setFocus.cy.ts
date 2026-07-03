import { describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { renderApp } from '../support/renderApp';

describe('form setFocus', () => {
  it('should focus input', async () => {
    await renderApp('http://localhost:3000/setFocus');
    await userEvent.click(
      Array.from(document.querySelectorAll('button')).find((el) =>
        el.textContent?.includes('Focus Input'),
      )!,
    );
    expect(document.activeElement).toBe(
      document.querySelector('input[name="focusInput"]')!,
    );
  });

  it('should select input content', async () => {
    await renderApp('http://localhost:3000/setFocus');
    await userEvent.click(
      Array.from(document.querySelectorAll('button')).find((el) =>
        el.textContent?.includes('Select Input Content'),
      )!,
    );
    await userEvent.type(
      document.querySelector('input[name="selectInputContent"]')!,
      'New Value',
    );
    expect(
      (
        document.querySelector('input[name="selectInputContent"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('New Value');
  });

  it('should focus textarea', async () => {
    await renderApp('http://localhost:3000/setFocus');
    await userEvent.click(
      Array.from(document.querySelectorAll('button')).find((el) =>
        el.textContent?.includes('Focus Textarea'),
      )!,
    );
    expect(document.activeElement).toBe(
      document.querySelector('textarea[name="focusTextarea"]')!,
    );
  });

  it('should select textarea content', async () => {
    await renderApp('http://localhost:3000/setFocus');
    await userEvent.click(
      Array.from(document.querySelectorAll('button')).find((el) =>
        el.textContent?.includes('Select Textarea Content'),
      )!,
    );
    await userEvent.type(
      document.querySelector('textarea[name="selectTextareaContent"]')!,
      'New Value',
    );
    expect(
      (
        document.querySelector('textarea[name="selectTextareaContent"]')! as
          | HTMLInputElement
          | HTMLSelectElement
      ).value,
    ).toBe('New Value');
  });
});
