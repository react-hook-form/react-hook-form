import { describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('setValue with react native or web', () => {
  it('should only trigger re-render when form state changed or error triggered', async () => {
    await renderApp('http://localhost:3000/setValueCustomRegister');
    const renderCountStart = getRenderCount();
    expect(document.querySelector('#dirty')!.textContent).toContain('false');
    await userEvent.click(document.querySelector('#TriggerDirty')!);
    expect(document.querySelector('#dirty')!.textContent).toContain('true');
    await userEvent.click(document.querySelector('#TriggerNothing')!);
    await userEvent.click(document.querySelector('#TriggerNothing')!);
    await userEvent.click(document.querySelector('#TriggerNothing')!);
    await userEvent.click(document.querySelector('#TriggerNothing')!);
    await userEvent.click(document.querySelector('#WithError')!);
    await userEvent.click(document.querySelector('#WithError')!);
    await userEvent.click(document.querySelector('#WithoutError')!);
    await userEvent.click(document.querySelector('#WithoutError')!);
    await userEvent.click(document.querySelector('#WithError')!);
    await userEvent.click(document.querySelector('#TriggerNothing')!);
    expectRenderCountDelta(renderCountStart, 7);
  });
});
