import { describe, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import * as cy from './cy';
import { renderApp } from './renderApp';

describe('form setFocus', () => {
  it('should focus input', async () => {
    renderApp('http://localhost:3000/setFocus');
    await cy.clickButtonWithText('Focus Input');
    cy.expectFocused('input[name="focusInput"]');
  });

  it('should select input content', async () => {
    renderApp('http://localhost:3000/setFocus');
    await cy.clickButtonWithText('Select Input Content');
    await userEvent.type(
      document.querySelector('input[name="selectInputContent"]')!,
      'New Value',
    );
    cy.expectValue('input[name="selectInputContent"]', 'New Value');
  });

  it('should focus textarea', async () => {
    renderApp('http://localhost:3000/setFocus');
    await cy.clickButtonWithText('Focus Textarea');
    cy.expectFocused('textarea[name="focusTextarea"]');
  });

  it('should select textarea content', async () => {
    renderApp('http://localhost:3000/setFocus');
    await cy.clickButtonWithText('Select Textarea Content');
    await userEvent.type(
      document.querySelector('textarea[name="selectTextareaContent"]')!,
      'New Value',
    );
    cy.expectValue('textarea[name="selectTextareaContent"]', 'New Value');
  });
});
