import { describe, it } from 'vitest';

import * as cy from './cy';
import { renderApp } from './renderApp';

describe('watchDefaultValues', () => {
  it('should return default value with watch', async () => {
    await renderApp('http://localhost:3000/watch-default-values');

    cy.expectContains(
      '#watchAll',
      '{"test":"test","test1":{"firstName":"firstName","lastName":["lastName0","lastName1"],"deep":{"nest":"nest"}},"flatName[1]":{"whatever":"flat"}}',
    );
    cy.expectContains('#array', '["test",{"whatever":"flat"}]');
    cy.expectContains('#getArray', '["lastName0","lastName1"]');
    cy.expectContains('#object', '["test","firstName"]');
    cy.expectContains('#single', '"firstName"');
    cy.expectContains('#singleDeepArray', '"lastName0"');
  });
});
