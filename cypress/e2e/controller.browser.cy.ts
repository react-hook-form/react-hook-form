import { describe, expect, it } from 'vitest';

import * as cy from '../support/cy';
import {
  expectRenderCountDelta,
  getRenderCount,
  renderApp,
} from '../support/renderApp';

describe('controller basic form validation', () => {
  it('should validate the form and reset the form', async () => {
    await renderApp('http://localhost:3000/controller/onSubmit');
    const renderCountStart = getRenderCount();
    await cy.click('#submit');

    cy.expectContains('#TextField', 'TextField Error');
    cy.expectContains('#RadioGroup', 'RadioGroup Error');
    cy.expectContains('#Checkbox', 'Checkbox Error');
    cy.expectContains('#Select', 'Select Error');
    cy.expectContains('#switch', 'switch Error');

    await cy.click('#input-checkbox input');
    await cy.clickAt('input[name="gender1"]', 0);
    await cy.type('#input-textField input', 'test');
    await cy.click('#input-select > div > div');
    await cy.clickFirstMuiPopoverOption();
    await cy.click('#input-switch input');
    await cy.click('#input-ReactSelect > div');
    await cy.clickAt('#input-ReactSelect > div > div', 1);

    expect(
      Array.from(document.querySelectorAll('.container > p')).filter((p) =>
        p.textContent?.includes('Error'),
      ),
    ).toHaveLength(0);
    expectRenderCountDelta(renderCountStart, 8);
  });

  it('should validate the form with onBlur mode and reset the form', async () => {
    await renderApp('http://localhost:3000/controller/onBlur');
    const renderCountStart = getRenderCount();
    cy.expectNoParagraphs();
    await cy.focus('#input-checkbox input');
    await cy.blur('#input-checkbox input');
    await cy.waitFor(() => cy.expectContains('#Checkbox', 'Checkbox Error'));

    await cy.focus('#input-textField input');
    await cy.blur('#input-textField input');
    cy.expectContains('#TextField', 'TextField Error');

    await cy.focusMuiSelect('#input-select > div > div');
    await cy.blurMuiSelect('#input-select > div > div');
    await cy.waitFor(() => cy.expectContains('#Select', 'Select Error'));

    await cy.focus('#input-switch input');
    await cy.blur('#input-switch input');
    await cy.waitFor(() => cy.expectContains('#switch', 'switch Error'));

    await cy.click('#input-checkbox input');
    await cy.type('#input-textField input', 'test');
    await cy.click('#input-select > div > div');
    await cy.clickFirstMuiPopoverOption();
    await cy.click('#input-switch input');
    await cy.blur('#input-switch input');

    cy.expectNoParagraphs();
    expectRenderCountDelta(renderCountStart, 9);
  });

  it('should validate the form with onChange mode and reset the form', async () => {
    await renderApp('http://localhost:3000/controller/onChange');
    const renderCountStart = getRenderCount();
    await cy.click('#input-checkbox input');
    await cy.click('#input-checkbox input');
    cy.expectContains('#Checkbox', 'Checkbox Error');

    await cy.type('#input-textField input', 'test');
    await cy.clear('#input-textField input');
    cy.expectContains('#TextField', 'TextField Error');

    await cy.click('#input-switch input');
    await cy.click('#input-switch input');
    cy.expectContains('#switch', 'switch Error');

    await cy.click('#input-checkbox input');
    await cy.type('#input-textField input', 'test');
    await cy.click('#input-switch input');

    cy.expectNoParagraphs();
    expectRenderCountDelta(renderCountStart, 7);
  });
});
