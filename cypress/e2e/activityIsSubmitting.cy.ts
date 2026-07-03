/**
 * Attempt to reproduce #13563 in Cypress: formState.isSubmitting stays stuck
 * `true` when the form's subtree is hidden by <Activity mode="hidden"> from
 * inside the submit handler.
 *
 * NOTE: Cypress CANNOT reproduce this bug — every variant below passes even
 * against a build where the bug is present (verified on v7.80.0 without the
 * fix, where plain Playwright against the same URL reproduces it 100% of the
 * time, even with a 500ms human-like delay before clicking Back).
 *
 * The Cypress harness (app in an iframe + actionability checks + command
 * scheduling) hands React the opportunity to flush the deferred offscreen
 * <Activity> commit before the stuck state can be observed. This holds for
 * retrying assertions, immediate `.then()` assertions, and even clicking Back
 * and reading the DOM synchronously in the same tick.
 *
 * These tests are kept as normal-path regression guards. The faithful,
 * deterministic repro lives in Vitest browser mode:
 * src/__tests__/useForm/isSubmittingActivity.browser.test.tsx
 */
describe('isSubmitting with <Activity>', () => {
  it('resets after the form is hidden by <Activity> mid-submit (retrying assertions)', () => {
    cy.visit('http://localhost:3000/activityIsSubmitting');

    cy.get('#review').should('be.enabled').click();

    // Submit hid the form via <Activity mode="hidden"> and revealed the review step.
    cy.contains('button', 'Back').click();

    // Back on the form: isSubmitting must have reset to false.
    cy.get('#review').should('be.enabled');
    cy.get('#isSubmitting').should('have.text', 'false');
  });

  it('resets after the form is hidden by <Activity> mid-submit (immediate assertions)', () => {
    cy.visit('http://localhost:3000/activityIsSubmitting');

    cy.get('#review').should('be.enabled').click();

    // Immediate (non-retrying) checks. Still passes on buggy builds: the
    // command boundary before this yields to the event loop, letting React
    // commit the deferred offscreen update.
    cy.contains('button', 'Back').click();
    cy.get('#review').then(($el) => expect($el).to.be.enabled);
    cy.get('#isSubmitting').then(($el) => expect($el.text()).to.eq('false'));
  });

  it('resets after the form is hidden by <Activity> mid-submit (same-tick click + read)', () => {
    cy.visit('http://localhost:3000/activityIsSubmitting');

    cy.get('#review').should('be.enabled').click();

    // Click Back and read the button in the SAME synchronous tick. React
    // flushes discrete click events synchronously, so there is no event-loop
    // yield for it to commit the deferred offscreen <Activity> update — yet
    // this still passes on buggy builds, because the preceding cy.contains
    // retry loop already gave React the flush opportunity.
    cy.contains('button', 'Back').then(($back) => {
      $back[0].click();
      const review = Cypress.$('#review')[0] as HTMLButtonElement;
      expect(review.disabled, 'Review button disabled').to.eq(false);
    });
  });
});
