import * as cy from '../support/cy';
import { renderApp } from '../support/renderApp';

describe('delayError', () => {
  it('should delay from errors appear', async () => {
    await renderApp('http://localhost:3000/delayError');
    await cy.type('input[name="first"]', '123');
    await cy.wait(100);
    cy.expectInputError('input[name="first"]', 'First too long.');

    await cy.type('input[name="last"]', '123567');
    await cy.wait(100);
    cy.expectInputError('input[name="last"]', 'Last too long.');

    await cy.blur('input[name="last"]');
    await cy.click('button');

    await cy.clearAndType('input[name="first"]', '123');
    await cy.clearAndType('input[name="last"]', '123567');

    await cy.waitFor(() => {
      cy.expectInputError('input[name="first"]', 'First too long.');
      cy.expectInputError('input[name="last"]', 'Last too long.');
    });

    await cy.clearAndType('input[name="first"]', '1');
    await cy.clearAndType('input[name="last"]', '12');
    await cy.blur('input[name="last"]');

    cy.expectNoErrorMessages();

    await cy.click('button');

    await cy.clearAndType('input[name="first"]', 'aa');
    await cy.clearAndType('input[name="last"]', 'a');

    await cy.waitFor(() => {
      cy.expectInputError('input[name="first"]', 'First too long.');
      cy.expectInputError('input[name="last"]', 'Last too long.');
    });

    await cy.clearAndType('input[name="first"]', '1');
    await cy.clearAndType('input[name="last"]', '12');
    await cy.blur('input[name="last"]');

    cy.expectNoErrorMessages();
  });
});
