describe('per-field validation modes', () => {
  it('should validate fields with different per-field mode overrides', () => {
    cy.visit('http://localhost:3000/per-field-modes');

    // Test 1: defaultField uses form default (onSubmit)
    // Typing should not trigger validation
    cy.get('input[data-testid="defaultField"]').type('test');
    cy.get('input[data-testid="defaultField"]').clear();
    cy.get('p[data-testid="defaultFieldError"]').should('not.exist');

    // Blurring should not trigger validation (onSubmit mode)
    cy.get('input[data-testid="defaultField"]').blur();
    cy.get('p[data-testid="defaultFieldError"]').should('not.exist');

    // Test 2: onChangeField validates on every change
    cy.get('input[data-testid="onChangeField"]').type('t');
    // Should not show error yet (has value)
    cy.get('p[data-testid="onChangeFieldError"]').should('not.exist');

    cy.get('input[data-testid="onChangeField"]').clear();
    // Should show error immediately on change
    cy.get('p[data-testid="onChangeFieldError"]').should('exist');
    cy.get('p[data-testid="onChangeFieldError"]').contains(
      'onChange field is required',
    );

    cy.get('input[data-testid="onChangeField"]').type('valid');
    // Error should clear on change
    cy.get('p[data-testid="onChangeFieldError"]').should('not.exist');

    // Test 3: onBlurField validates on blur
    cy.get('input[data-testid="onBlurField"]').focus();
    cy.get('input[data-testid="onBlurField"]').type('t');
    cy.get('input[data-testid="onBlurField"]').clear();
    // Should not show error while typing
    cy.get('p[data-testid="onBlurFieldError"]').should('not.exist');

    cy.get('input[data-testid="onBlurField"]').blur();
    // Should show error on blur
    cy.get('p[data-testid="onBlurFieldError"]').should('exist');
    cy.get('p[data-testid="onBlurFieldError"]').contains(
      'onBlur field is required',
    );

    cy.get('input[data-testid="onBlurField"]').focus();
    cy.get('input[data-testid="onBlurField"]').type('valid');
    cy.get('input[data-testid="onBlurField"]').blur();
    // Error should clear on blur after fixing
    cy.get('p[data-testid="onBlurFieldError"]').should('not.exist');

    // Test 4: Submit with defaultField empty should show error
    cy.get('button[data-testid="submit"]').click();
    cy.get('p[data-testid="defaultFieldError"]').should('exist');
    cy.get('p[data-testid="defaultFieldError"]').contains(
      'Default field is required',
    );

    // Fix defaultField
    cy.get('input[data-testid="defaultField"]').type('valid');

    // Test 5: Test mixedRevalidate field (onBlur reValidateMode after submit)
    cy.get('input[data-testid="mixedRevalidate"]').type('test');
    cy.get('input[data-testid="mixedRevalidate"]').clear();
    // Should not validate before submit (using form default mode: onSubmit)
    cy.get('p[data-testid="mixedRevalidateError"]').should('not.exist');

    // Submit to trigger validation
    cy.get('button[data-testid="submit"]').click();
    cy.get('p[data-testid="mixedRevalidateError"]').should('exist');
    cy.get('p[data-testid="mixedRevalidateError"]').contains(
      'Mixed field is required',
    );

    // After submit, should use field-level reValidateMode (onBlur)
    // Typing should not clear error (reValidateMode is onBlur, not onChange)
    cy.get('input[data-testid="mixedRevalidate"]').type('test');
    cy.get('p[data-testid="mixedRevalidateError"]').should('exist');

    // Blur should revalidate and clear error
    cy.get('input[data-testid="mixedRevalidate"]').blur();
    cy.get('p[data-testid="mixedRevalidateError"]').should('not.exist');

    // Clear and blur again to test revalidation
    cy.get('input[data-testid="mixedRevalidate"]').clear();
    cy.get('p[data-testid="mixedRevalidateError"]').should('exist');
    cy.get('input[data-testid="mixedRevalidate"]').blur();
    cy.get('p[data-testid="mixedRevalidateError"]').should('exist');
    cy.get('p[data-testid="mixedRevalidateError"]').contains(
      'Mixed field is required',
    );

    // Fix it
    cy.get('input[data-testid="mixedRevalidate"]').type('valid');
    cy.get('input[data-testid="mixedRevalidate"]').blur();
    cy.get('p[data-testid="mixedRevalidateError"]').should('not.exist');

    // Final submission should succeed
    cy.get('button[data-testid="submit"]').click();
    cy.get('p').should('have.length', 0);
  });

  it('should respect field-level onChange mode throughout form lifecycle', () => {
    cy.visit('http://localhost:3000/per-field-modes');

    // onChangeField should validate on change even before submit
    cy.get('input[data-testid="onChangeField"]').type('a');
    cy.get('input[data-testid="onChangeField"]').clear();
    cy.get('p[data-testid="onChangeFieldError"]').should('exist');

    cy.get('input[data-testid="onChangeField"]').type('valid');
    cy.get('p[data-testid="onChangeFieldError"]').should('not.exist');

    // Submit form
    cy.get('input[data-testid="defaultField"]').type('valid');
    cy.get('input[data-testid="onBlurField"]').type('valid');
    cy.get('input[data-testid="mixedRevalidate"]').type('valid');
    cy.get('button[data-testid="submit"]').click();

    // After submit, onChangeField should still validate on change
    cy.get('input[data-testid="onChangeField"]').clear();
    cy.get('p[data-testid="onChangeFieldError"]').should('exist');

    cy.get('input[data-testid="onChangeField"]').type('valid again');
    cy.get('p[data-testid="onChangeFieldError"]').should('not.exist');
  });

  it('should respect field-level onBlur mode before and after submit', () => {
    cy.visit('http://localhost:3000/per-field-modes');

    // Before submit: onBlurField should only validate on blur
    cy.get('input[data-testid="onBlurField"]').type('test');
    cy.get('input[data-testid="onBlurField"]').clear();
    cy.get('p[data-testid="onBlurFieldError"]').should('not.exist');

    cy.get('input[data-testid="onBlurField"]').blur();
    cy.get('p[data-testid="onBlurFieldError"]').should('exist');

    // Fix and submit
    cy.get('input[data-testid="onBlurField"]').type('valid');
    cy.get('input[data-testid="defaultField"]').type('valid');
    cy.get('input[data-testid="onChangeField"]').type('valid');
    cy.get('input[data-testid="mixedRevalidate"]').type('valid');
    cy.get('button[data-testid="submit"]').click();

    // After submit: should still use onBlur (not form's reValidateMode)
    cy.get('input[data-testid="onBlurField"]').clear();
    // Error should not appear on change
    cy.get('p[data-testid="onBlurFieldError"]').should('not.exist');

    cy.get('input[data-testid="onBlurField"]').blur();
    // Error should appear on blur
    cy.get('p[data-testid="onBlurFieldError"]').should('exist');
  });
});
