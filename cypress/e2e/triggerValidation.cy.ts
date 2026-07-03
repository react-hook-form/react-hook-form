import { describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('form trigger', () => {
  it('should trigger input validation', async () => {
    await renderApp('http://localhost:3000/trigger-validation');
    const renderCountStart = getRenderCount();
    expect(document.querySelector('#testError')!.textContent).toBe('');
    expect(document.querySelector('#test1Error')!.textContent).toBe('');
    expect(document.querySelector('#test2Error')!.textContent).toBe('');

    await userEvent.click(document.querySelector('#single')!);
    expect(document.querySelector('#testError')!.textContent).toContain(
      'required',
    );
    await userEvent.click(document.querySelector('#single')!);

    await userEvent.click(document.querySelector('#multiple')!);
    expect(document.querySelector('#test1Error')!.textContent).toContain(
      'required',
    );
    expect(document.querySelector('#test2Error')!.textContent).toContain(
      'required',
    );

    await userEvent.click(document.querySelector('#multiple')!);
    expectRenderCountDelta(renderCountStart, 5);
  });
});
