describe('Readonly Field Validation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/readonly-validation');
  });

  describe('Basic readonly field behavior (backwards compatible)', () => {
    it('should validate readonly fields when flag is disabled (default)', () => {
      // Ensure flag is OFF (initial state)
      cy.get('[data-testid="skip-validation-flag-status"]').should(
        'contain',
        'FALSE',
      );
      cy.get('[data-testid="readonly-mode-status"]').should(
        'contain',
        'READONLY',
      );

      // Submit form with empty required fields
      cy.get('[data-testid="submit-button"]').click();

      // Both readonly and normal fields should show validation errors
      cy.get('[data-testid="readonly-field-error"]').should('be.visible');
      cy.get('[data-testid="readonly-required-error"]').should('be.visible');
      cy.get('[data-testid="normal-field-error"]').should('be.visible');

      // Form should be invalid
      cy.get('[data-testid="form-valid"]').should('contain', 'false');
    });

    it('should validate normal fields alongside readonly fields', () => {
      // Fill in the normal field only
      cy.get('[data-testid="normal-field"]').type('test value');

      // Submit form
      cy.get('[data-testid="submit-button"]').click();

      // Normal field should not show error
      cy.get('[data-testid="normal-field-error"]').should('not.exist');
      // But readonly fields should show errors (backwards compatible)
      cy.get('[data-testid="readonly-field-error"]').should('be.visible');
    });

    it('should handle complex validation rules on readonly fields', () => {
      // Verify readonly fields have invalid data
      cy.get('[data-testid="readonly-pattern"]').should(
        'have.value',
        'invalid-pattern',
      );
      cy.get('[data-testid="readonly-minlength"]').should('have.value', 'ab');
      cy.get('[data-testid="readonly-custom"]').should('have.value', 'fail');

      // Submit form
      cy.get('[data-testid="submit-button"]').click();

      // All readonly fields should show validation errors (backwards compatible)
      cy.get('[data-testid="readonly-pattern-error"]').should('be.visible');
      cy.get('[data-testid="readonly-minlength-error"]').should('be.visible');
      cy.get('[data-testid="readonly-custom-error"]').should('be.visible');
    });
  });

  describe('Toggle behavior', () => {
    it('should start in readonly mode by default', () => {
      // Verify initial state
      cy.get('[data-testid="readonly-mode-status"]').should(
        'contain',
        'READONLY',
      );
      cy.get('[data-testid="readonly-mode"]').should('contain', 'true');
      cy.get('[data-testid="toggle-readonly-mode"]').should(
        'contain',
        'Disable Readonly',
      );

      // Verify fields are readonly
      cy.get('[data-testid="readonly-field"]').should('have.attr', 'readonly');
      cy.get('[data-testid="readonly-required"]').should(
        'have.attr',
        'readonly',
      );
      cy.get('[data-testid="readonly-pattern"]').should(
        'have.attr',
        'readonly',
      );
    });

    it('should toggle to editable mode when button is clicked', () => {
      // Click toggle button
      cy.get('[data-testid="toggle-readonly-mode"]').click();

      // Verify state changed to editable
      cy.get('[data-testid="readonly-mode-status"]').should(
        'contain',
        'EDITABLE',
      );
      cy.get('[data-testid="readonly-mode"]').should('contain', 'false');
      cy.get('[data-testid="toggle-readonly-mode"]').should(
        'contain',
        'Enable Readonly',
      );

      // Verify fields are no longer readonly
      cy.get('[data-testid="readonly-field"]').should(
        'not.have.attr',
        'readonly',
      );
      cy.get('[data-testid="readonly-required"]').should(
        'not.have.attr',
        'readonly',
      );
      cy.get('[data-testid="readonly-pattern"]').should(
        'not.have.attr',
        'readonly',
      );
    });

    it('should toggle back to readonly mode', () => {
      // Start in readonly, toggle to editable, then back to readonly
      cy.get('[data-testid="toggle-readonly-mode"]').click(); // to editable
      cy.get('[data-testid="readonly-mode-status"]').should(
        'contain',
        'EDITABLE',
      );

      cy.get('[data-testid="toggle-readonly-mode"]').click(); // back to readonly
      cy.get('[data-testid="readonly-mode-status"]').should(
        'contain',
        'READONLY',
      );
      cy.get('[data-testid="readonly-mode"]').should('contain', 'true');

      // Verify fields are readonly again
      cy.get('[data-testid="readonly-field"]').should('have.attr', 'readonly');
    });
  });

  describe('Flag toggle behavior', () => {
    it('should start with flag disabled by default', () => {
      // Verify initial flag state
      cy.get('[data-testid="skip-validation-flag-status"]').should(
        'contain',
        'FALSE',
      );
      cy.get('[data-testid="skip-validation-flag"]').should('contain', 'false');
      cy.get('[data-testid="toggle-skip-validation-flag"]').should(
        'contain',
        'Enable Skip Flag',
      );
    });

    it('should toggle the flag when button is clicked', () => {
      // Click toggle button
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();

      // Verify flag state changed
      cy.get('[data-testid="skip-validation-flag-status"]').should(
        'contain',
        'TRUE',
      );
      cy.get('[data-testid="skip-validation-flag"]').should('contain', 'true');
      cy.get('[data-testid="toggle-skip-validation-flag"]').should(
        'contain',
        'Disable Skip Flag',
      );

      // Toggle back
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();
      cy.get('[data-testid="skip-validation-flag-status"]').should(
        'contain',
        'FALSE',
      );
    });
  });

  describe('Dynamic readonly validation with shouldSkipReadOnlyValidation flag', () => {
    it('should skip readonly validation when flag is enabled', () => {
      // Enable the flag
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();
      cy.get('[data-testid="skip-validation-flag-status"]').should(
        'contain',
        'TRUE',
      );

      // Ensure fields are readonly
      cy.get('[data-testid="readonly-mode-status"]').should(
        'contain',
        'READONLY',
      );

      // Submit form with empty required fields
      cy.get('[data-testid="submit-button"]').click();

      // Readonly fields should NOT show validation errors
      cy.get('[data-testid="readonly-field-error"]').should('not.exist');
      cy.get('[data-testid="readonly-required-error"]').should('not.exist');

      // But normal field should still show error
      cy.get('[data-testid="normal-field-error"]').should('be.visible');

      // Form should be invalid due to normal field
      cy.get('[data-testid="form-valid"]').should('contain', 'false');
    });

    it('should validate all fields when flag is enabled but fields are not readonly', () => {
      // Enable the flag
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();

      // Disable readonly mode (make fields editable)
      cy.get('[data-testid="toggle-readonly-mode"]').click();
      cy.get('[data-testid="readonly-mode-status"]').should(
        'contain',
        'EDITABLE',
      );

      // Submit form with empty required fields
      cy.get('[data-testid="submit-button"]').click();

      // All fields should show validation errors since they're not readonly
      cy.get('[data-testid="readonly-field-error"]').should('be.visible');
      cy.get('[data-testid="readonly-required-error"]').should('be.visible');
      cy.get('[data-testid="normal-field-error"]').should('be.visible');
    });

    it('should maintain validation state when toggling flag', () => {
      // Start with flag OFF, readonly ON - submit to get errors
      cy.get('[data-testid="submit-button"]').click();
      cy.get('[data-testid="readonly-field-error"]').should('be.visible');

      // Enable the flag - readonly field error should disappear
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();
      cy.get('[data-testid="trigger-validation"]').click();
      cy.get('[data-testid="readonly-field-error"]').should('not.exist');

      // Disable the flag - readonly field error should reappear
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();
      cy.get('[data-testid="trigger-validation"]').click();
      cy.get('[data-testid="readonly-field-error"]').should('be.visible');
    });
  });

  describe('Validation behavior with toggle', () => {
    it('should validate when in editable mode', () => {
      // Switch to editable mode
      cy.get('[data-testid="toggle-readonly-mode"]').click();
      cy.get('[data-testid="readonly-mode-status"]').should(
        'contain',
        'EDITABLE',
      );

      // Submit form (fields are empty and required)
      cy.get('[data-testid="submit-button"]').click();

      // Should show validation errors now that fields are editable
      cy.get('[data-testid="readonly-field-error"]').should('be.visible');
      cy.get('[data-testid="readonly-required-error"]').should('be.visible');
      cy.get('[data-testid="normal-field-error"]').should('be.visible');

      // Form should be invalid
      cy.get('[data-testid="form-valid"]').should('contain', 'false');
    });

    it('should skip validation when in readonly mode (with flag enabled)', () => {
      // Enable the skip validation flag first
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();
      cy.get('[data-testid="skip-validation-flag-status"]').should(
        'contain',
        'TRUE',
      );

      // Ensure we're in readonly mode
      cy.get('[data-testid="readonly-mode-status"]').should(
        'contain',
        'READONLY',
      );

      // Submit form
      cy.get('[data-testid="submit-button"]').click();

      // Readonly fields should not show validation errors
      cy.get('[data-testid="readonly-field-error"]').should('not.exist');
      cy.get('[data-testid="readonly-required-error"]').should('not.exist');

      // But normal field should still show error
      cy.get('[data-testid="normal-field-error"]').should('be.visible');
    });

    it('should maintain validation state when toggling modes (with flag enabled)', () => {
      // Enable the skip validation flag first
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();
      cy.get('[data-testid="skip-validation-flag-status"]').should(
        'contain',
        'TRUE',
      );

      // Start in readonly mode and submit (should not show readonly field errors)
      cy.get('[data-testid="submit-button"]').click();
      cy.get('[data-testid="readonly-field-error"]').should('not.exist');

      // Toggle to editable mode
      cy.get('[data-testid="toggle-readonly-mode"]').click();

      // Trigger validation manually
      cy.get('[data-testid="trigger-validation"]').click();

      // Now should show validation errors for previously readonly fields
      cy.get('[data-testid="readonly-field-error"]').should('be.visible');
      cy.get('[data-testid="readonly-required-error"]').should('be.visible');

      // Toggle back to readonly mode
      cy.get('[data-testid="toggle-readonly-mode"]').click();

      // Trigger validation again
      cy.get('[data-testid="trigger-validation"]').click();

      // Validation errors should be gone for readonly fields
      cy.get('[data-testid="readonly-field-error"]').should('not.exist');
      cy.get('[data-testid="readonly-required-error"]').should('not.exist');
    });
  });

  describe('Form state and value management', () => {
    it('should include readonly fields in form values', () => {
      // Enable skip validation flag to test current behavior
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();

      // Check that readonly field values are included in form state
      cy.get('[data-testid="form-values"]').should(
        'contain',
        'invalid-pattern',
      );
      cy.get('[data-testid="form-values"]').should('contain', 'ab');
      cy.get('[data-testid="form-values"]').should('contain', 'fail');
    });

    it('should allow programmatic updates to readonly field values', () => {
      // Set new value programmatically
      cy.get('[data-testid="set-readonly-value"]').click();

      // Verify the value was updated
      cy.get('[data-testid="readonly-field"]').should(
        'have.value',
        'new-value',
      );

      // Verify form values reflect the change
      cy.get('[data-testid="form-values"]').should('contain', 'new-value');
    });

    it('should not trigger validation errors when readonly fields are updated programmatically', () => {
      // Enable skip validation flag
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();

      // Set new value programmatically
      cy.get('[data-testid="set-readonly-value"]').click();

      // Trigger validation
      cy.get('[data-testid="trigger-validation"]').click();

      // Readonly field should not show any validation errors
      cy.get('[data-testid="readonly-field-error"]').should('not.exist');
    });
  });

  describe('Form submission with readonly fields', () => {
    it('should submit successfully when all validation passes (ignoring readonly fields)', () => {
      // Enable skip validation flag
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();

      // Fill in valid data for normal field
      cy.get('[data-testid="normal-field"]').type('valid input');

      // Submit form
      cy.get('[data-testid="submit-button"]').click();

      // Form should be valid despite readonly fields having invalid data
      cy.get('[data-testid="form-valid"]').should('contain', 'true');

      // No errors should be displayed
      cy.get('[data-testid="form-errors"]').should('contain', '{}');
    });

    it('should include readonly field values in submitted data', () => {
      // Enable skip validation flag
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();

      // Fill normal field
      cy.get('[data-testid="normal-field"]').type('test input');

      // Submit form and check values include readonly fields
      cy.get('[data-testid="submit-button"]').click();

      // Verify readonly values are present in form data
      cy.get('[data-testid="form-values"]').should(
        'contain',
        'invalid-pattern',
      );
      cy.get('[data-testid="form-values"]').should('contain', 'test input');
    });
  });

  describe('Integration with other form features', () => {
    it('should work correctly alongside regular field validation', () => {
      // Enable skip validation flag
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();

      // Leave normal field empty (should trigger validation)
      // Submit form
      cy.get('[data-testid="submit-button"]').click();

      // Normal field should show error
      cy.get('[data-testid="normal-field-error"]').should('be.visible');

      // Readonly fields should not show errors
      cy.get('[data-testid="readonly-field-error"]').should('not.exist');
      cy.get('[data-testid="readonly-required-error"]').should('not.exist');

      // Form should be invalid due to normal field
      cy.get('[data-testid="form-valid"]').should('contain', 'false');
    });

    it('should maintain readonly behavior across multiple interactions', () => {
      // Enable skip validation flag
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();

      // Multiple form operations
      cy.get('[data-testid="trigger-validation"]').click();
      cy.get('[data-testid="normal-field"]').type('test');
      cy.get('[data-testid="trigger-validation"]').click();
      cy.get('[data-testid="submit-button"]').click();
      cy.get('[data-testid="set-readonly-value"]').click();
      cy.get('[data-testid="trigger-validation"]').click();

      // Readonly fields should never show validation errors
      cy.get('[data-testid="readonly-field-error"]').should('not.exist');
      cy.get('[data-testid="readonly-required-error"]').should('not.exist');
      cy.get('[data-testid="readonly-pattern-error"]').should('not.exist');
      cy.get('[data-testid="readonly-minlength-error"]').should('not.exist');
      cy.get('[data-testid="readonly-custom-error"]').should('not.exist');
    });
  });

  describe('Edge cases', () => {
    it('should handle readonly fields with no initial value when flag is enabled', () => {
      // Enable skip validation flag
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();

      // Readonly required field has no value but should not validate
      cy.get('[data-testid="readonly-required"]').should('have.value', '');
      cy.get('[data-testid="submit-button"]').click();
      cy.get('[data-testid="readonly-required-error"]').should('not.exist');
    });

    it('should handle readonly fields with complex validation chains when flag is enabled', () => {
      // Enable skip validation flag
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();

      // Custom validation field should not validate even with complex rules
      cy.get('[data-testid="readonly-custom"]').should('have.value', 'fail');
      cy.get('[data-testid="trigger-validation"]').click();
      cy.get('[data-testid="readonly-custom-error"]').should('not.exist');
    });

    it('should maintain consistent behavior after rapid interactions', () => {
      // Enable skip validation flag
      cy.get('[data-testid="toggle-skip-validation-flag"]').click();

      // Rapid fire interactions
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="trigger-validation"]').click();
        cy.get('[data-testid="set-readonly-value"]').click();
      }

      // Should still maintain readonly validation skip behavior
      cy.get('[data-testid="submit-button"]').click();
      cy.get('[data-testid="readonly-field-error"]').should('not.exist');
    });
  });

  describe('Field interaction', () => {
    it('should allow typing when in editable mode', () => {
      // Switch to editable mode
      cy.get('[data-testid="toggle-readonly-mode"]').click();

      // Should be able to type in the field
      cy.get('[data-testid="readonly-field"]').clear().type('user input');
      cy.get('[data-testid="readonly-field"]').should(
        'have.value',
        'user input',
      );

      // Form values should update
      cy.get('[data-testid="form-values"]').should('contain', 'user input');
    });

    it('should prevent typing when in readonly mode', () => {
      // Ensure we're in readonly mode
      cy.get('[data-testid="readonly-mode-status"]').should(
        'contain',
        'READONLY',
      );

      // Set initial value for this test
      cy.get('[data-testid="set-readonly-value"]').click();

      // Get the set value
      cy.get('[data-testid="readonly-field"]').should(
        'have.value',
        'new-value',
      );

      // Verify the field has readonly attribute (this is the main test)
      cy.get('[data-testid="readonly-field"]').should('have.attr', 'readonly');

      // The readonly attribute prevents user input, which is what we want to test
      // Value should remain unchanged after the readonly mode is set
      cy.get('[data-testid="readonly-field"]').should(
        'have.value',
        'new-value',
      );
    });
  });
});
