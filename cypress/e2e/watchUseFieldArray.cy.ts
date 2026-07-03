import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('watchUseFieldArray', () => {
  it('should behaviour correctly when watching the field array', async () => {
    await renderApp('http://localhost:3000/watch-field-array/normal');
    const renderCountStart = getRenderCount();
    await userEvent.click(document.querySelector('#append')!);
    expect(document.querySelector('#result')!.textContent).toContain(
      '[{"name":"2"}]',
    );

    await userEvent.type(
      document.querySelector('#field0')! as HTMLInputElement,
      'test',
    );
    expect(document.querySelector('#result')!.textContent).toContain(
      '[{"name":"2test"}]',
    );

    await userEvent.click(document.querySelector('#prepend')!);
    expect(document.querySelector('#result')!.textContent).toContain(
      '[{"name":"8"},{"name":"2test"}]',
    );

    await userEvent.click(document.querySelector('#append')!);
    await userEvent.click(document.querySelector('#append')!);
    await userEvent.click(document.querySelector('#append')!);
    await userEvent.click(document.querySelector('#update')!);
    expect(document.querySelector('#result')!.textContent).toContain(
      '[{"name":"8"},{"name":"2test"},{"name":"10"},{"name":"updated value"},{"name":"14"}]',
    );

    await userEvent.click(document.querySelector('#swap')!);
    expect(document.querySelector('#result')!.textContent).toContain(
      '[{"name":"8"},{"name":"10"},{"name":"2test"},{"name":"updated value"},{"name":"14"}]',
    );

    await userEvent.click(document.querySelector('#move')!);
    expect(document.querySelector('#result')!.textContent).toContain(
      '[{"name":"2test"},{"name":"8"},{"name":"10"},{"name":"updated value"},{"name":"14"}]',
    );

    await userEvent.click(document.querySelector('#insert')!);
    expect(document.querySelector('#result')!.textContent).toContain(
      '[{"name":"2test"},{"name":"22"},{"name":"8"},{"name":"10"},{"name":"updated value"},{"name":"14"}]',
    );

    await userEvent.click(document.querySelector('#remove')!);
    expect(document.querySelector('#result')!.textContent).toContain(
      '[{"name":"2test"},{"name":"8"},{"name":"10"},{"name":"updated value"},{"name":"14"}]',
    );

    await userEvent.click(document.querySelector('#removeAll')!);
    expect(document.querySelector('#result')!.textContent).toContain('[]');
    expectRenderCountDelta(renderCountStart, 27);
  });

  it('should return empty when items been removed and defaultValues are supplied', async () => {
    await renderApp('http://localhost:3000/watch-field-array/default');
    const renderCountStart = getRenderCount();
    await userEvent.click(document.querySelector('#delete0')!);
    await userEvent.click(document.querySelector('#delete0')!);
    await userEvent.click(document.querySelector('#delete0')!);

    expect(document.querySelector('#result')!.textContent).toContain('[]');
  });
});
