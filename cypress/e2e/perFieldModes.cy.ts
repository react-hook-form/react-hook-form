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
    // Wait for defaultField error to clear (form reValidateMode is onChange)
    cy.get('p[data-testid="defaultFieldError"]').should('not.exist');

    // Test 5: Test mixedRevalidate field (onBlur reValidateMode after submit)
    //  Note: Form was already submitted once, so we need to test reValidate behavior
    // Fill mixedRevalidate and submit successfully
    cy.get('input[data-testid="mixedRevalidate"]').type('valid');
    cy.get('button[data-testid="submit"]').click();

    // Now form is submitted successfully. Clear the field to test reValidateMode
    // Field has reValidateMode: 'onBlur', so clearing (onChange) should NOT validate
    cy.get('input[data-testid="mixedRevalidate"]').clear();
    cy.get('p[data-testid="mixedRevalidateError"]').should('not.exist');

    // Blur should trigger revalidation and show error
    cy.get('input[data-testid="mixedRevalidate"]').blur();
    cy.get('p[data-testid="mixedRevalidateError"]').should('exist');
    cy.get('p[data-testid="mixedRevalidateError"]').contains(
      'Mixed field is required',
    );

    // Typing should NOT clear the error (reValidateMode is onBlur, not onChange)
    cy.get('input[data-testid="mixedRevalidate"]').type('valid');
    cy.get('p[data-testid="mixedRevalidateError"]').should('exist');

    // Blur should revalidate and clear the error
    cy.get('input[data-testid="mixedRevalidate"]').blur();
    cy.get('p[data-testid="mixedRevalidateError"]').should('not.exist');

    // Final submission should succeed
    cy.get('button[data-testid="submit"]').click();
    cy.get('p').should('have.length', 0);
  });

  it('should test field-level reValidateMode', () => {
    cy.visit('http://localhost:3000/per-field-modes');

    // Fill all fields
    cy.get('input[data-testid="defaultField"]').type('valid');
    cy.get('input[data-testid="onChangeField"]').type('valid');
    cy.get('input[data-testid="onBlurField"]').type('valid');
    cy.get('input[data-testid="mixedRevalidate"]').type('valid');

    // Submit form - all fields are valid
    cy.get('button[data-testid="submit"]').click();

    // Now form is submitted. Clear mixedRevalidate field
    // This field has reValidateMode: 'onBlur', so clearing it (onChange event)
    // should NOT trigger validation
    cy.get('input[data-testid="mixedRevalidate"]').clear();
    cy.get('p[data-testid="mixedRevalidateError"]').should('not.exist');

    // Blur should trigger validation
    cy.get('input[data-testid="mixedRevalidate"]').blur();
    cy.get('p[data-testid="mixedRevalidateError"]').should('exist');
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
    cy.get('input[data-testid="onBlurField"]').blur();
    cy.get('p[data-testid="onBlurFieldError"]').should('not.exist');

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
