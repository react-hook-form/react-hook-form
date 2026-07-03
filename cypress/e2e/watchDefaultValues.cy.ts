import { describe, it } from 'vitest';

import { renderApp } from '../support/renderApp';

describe('watchDefaultValues', () => {
  it('should return default value with watch', async () => {
    await renderApp('http://localhost:3000/watch-default-values');

    expect(document.querySelector('#watchAll')!.textContent).toContain(
      '{"test":"test","test1":{"firstName":"firstName","lastName":["lastName0","lastName1"],"deep":{"nest":"nest"}},"flatName[1]":{"whatever":"flat"}}',
    );
    expect(document.querySelector('#array')!.textContent).toContain(
      '["test",{"whatever":"flat"}]',
    );
    expect(document.querySelector('#getArray')!.textContent).toContain(
      '["lastName0","lastName1"]',
    );
    expect(document.querySelector('#object')!.textContent).toContain(
      '["test","firstName"]',
    );
    expect(document.querySelector('#single')!.textContent).toContain(
      '"firstName"',
    );
    expect(document.querySelector('#singleDeepArray')!.textContent).toContain(
      '"lastName0"',
    );
  });
});
