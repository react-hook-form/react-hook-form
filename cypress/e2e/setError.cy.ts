import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { renderApp } from '../support/renderApp';

describe('form setError', () => {
  it('should contain 3 errors when page land', async () => {
    await renderApp('http://localhost:3000/setError');

    expect(document.querySelector('#error0')!.textContent).toContain('0 wrong');
    expect(document.querySelector('#error1')!.textContent).toContain('1 wrong');
    expect(document.querySelector('#error2')!.textContent).toContain('2 wrong');
    expect(document.querySelector('#error3')!.textContent).toContain('3 test');
    expect(document.querySelector('#error4')!.textContent).toContain(
      '4 required',
    );
    expect(document.querySelector('#error5')!.textContent).toContain(
      '5 minLength',
    );
    expect(document.querySelector('#error')!.textContent).toContain(
      'testMessageThis is required.Minlength is 10This is requiredThis is minLength',
    );
  });

  it('should clear individual error', async () => {
    await renderApp('http://localhost:3000/setError');
    await userEvent.click(document.querySelector('#clear1')!);
    await userEvent.click(document.querySelector('#clear2')!);
    expect(document.querySelector('#error0')!.textContent).toContain('0 wrong');
  });

  it('should clear an array of errors', async () => {
    await renderApp('http://localhost:3000/setError');
    await userEvent.click(document.querySelector('#clearArray')!);
    expect(document.querySelector('#error0')!.textContent).toContain('0 wrong');
  });

  it('should clear every errors', async () => {
    await renderApp('http://localhost:3000/setError');
    await userEvent.click(document.querySelector('#clear')!);
    expect(document.querySelector('#errorContainer')!.children.length).toBe(0);
  });
});
