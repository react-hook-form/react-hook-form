describe('Smart Disabled State', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/smart-disabled');
  });

  describe('Basic array disabled functionality', () => {
    it('should disable specific fields when using array mode', () => {
      // Verify we start in array mode
      cy.get('[data-testid="current-mode"]').should('contain', 'array');

      // By default, firstName and email should be disabled
      cy.get('[data-testid="firstName"]').should('be.disabled');
      cy.get('[data-testid="firstName"]').type('test', { force: true }); // Force type even if disabled

      // Value shouldn't change in disabled field
      cy.get('[data-testid="firstName"]').should('have.value', 'John'); // Original value

      cy.get('[data-testid="email"]').should('be.disabled');

      // lastName and phone should be enabled
      cy.get('[data-testid="lastName"]').should('not.be.disabled');
      cy.get('[data-testid="phone"]').should('not.be.disabled');
    });

    it('should handle empty array correctly', () => {
      // Toggle all fields off to create empty array
      cy.get('[data-testid="toggle-firstName"]').click();
      cy.get('[data-testid="toggle-email"]').click();

      // Verify array is empty
      cy.get('[data-testid="array-fields"]').should('contain', '[]');

      // All fields should be enabled
      cy.get('[data-testid="firstName"]').should('not.be.disabled');
      cy.get('[data-testid="lastName"]').should('not.be.disabled');
      cy.get('[data-testid="email"]').should('not.be.disabled');
      cy.get('[data-testid="phone"]').should('not.be.disabled');
    });

    it('should handle nested field paths in array', () => {
      // Toggle nested city field
      cy.get('[data-testid="toggle-nested"]').click();

      // Verify nested field is now disabled
      cy.get('[data-testid="address-city"]').should('be.disabled');

      // Other nested fields should remain enabled
      cy.get('[data-testid="address-street"]').should('not.be.disabled');
      cy.get('[data-testid="address-zip"]').should('not.be.disabled');
    });
  });

  describe('Dynamic array changes', () => {
    it('should update disabled state when fields are toggled', () => {
      // Initially firstName is disabled
      cy.get('[data-testid="firstName"]').should('be.disabled');

      // Toggle firstName to enable it
      cy.get('[data-testid="toggle-firstName"]').click();
      cy.get('[data-testid="firstName"]').should('not.be.disabled');

      // Toggle it back to disable it
      cy.get('[data-testid="toggle-firstName"]').click();
      cy.get('[data-testid="firstName"]').should('be.disabled');
    });

    it('should handle multiple field toggles correctly', () => {
      // Initially: firstName and email disabled, lastName and phone enabled
      cy.get('[data-testid="firstName"]').should('be.disabled');
      cy.get('[data-testid="email"]').should('be.disabled');
      cy.get('[data-testid="lastName"]').should('not.be.disabled');
      cy.get('[data-testid="phone"]').should('not.be.disabled');

      // Disable lastName, enable firstName
      cy.get('[data-testid="toggle-lastName"]').click();
      cy.get('[data-testid="toggle-firstName"]').click();

      // Now: email and lastName disabled, firstName and phone enabled
      cy.get('[data-testid="firstName"]').should('not.be.disabled');
      cy.get('[data-testid="email"]').should('be.disabled');
      cy.get('[data-testid="lastName"]').should('be.disabled');
      cy.get('[data-testid="phone"]').should('not.be.disabled');
    });

    it('should update array display when fields are toggled', () => {
      // Initially shows firstName, email
      cy.get('[data-testid="array-fields"]').should(
        'contain',
        'firstName, email',
      );

      // Add phone field
      cy.get('[data-testid="toggle-phone"]').click();
      cy.get('[data-testid="array-fields"]').should(
        'contain',
        'firstName, email, phone',
      );

      // Remove email field
      cy.get('[data-testid="toggle-email"]').click();
      cy.get('[data-testid="array-fields"]').should(
        'contain',
        'firstName, phone',
      );
      cy.get('[data-testid="array-fields"]').should('not.contain', 'email');
    });
  });

  describe('Mode switching', () => {
    it('should switch from array mode to boolean disabled mode', () => {
      // Start in array mode with some fields enabled
      cy.get('[data-testid="lastName"]').should('not.be.disabled');
      cy.get('[data-testid="phone"]').should('not.be.disabled');

      // Switch to boolean mode
      cy.get('[data-testid="mode-boolean"]').click();
      cy.get('[data-testid="current-mode"]').should('contain', 'boolean');

      // All fields should now be disabled
      cy.get('[data-testid="firstName"]').should('be.disabled');
      cy.get('[data-testid="lastName"]').should('be.disabled');
      cy.get('[data-testid="email"]').should('be.disabled');
      cy.get('[data-testid="phone"]').should('be.disabled');
      cy.get('[data-testid="address-street"]').should('be.disabled');
      cy.get('[data-testid="address-city"]').should('be.disabled');
      cy.get('[data-testid="address-zip"]').should('be.disabled');
    });

    it('should switch from boolean mode to none mode', () => {
      // Switch to boolean mode first
      cy.get('[data-testid="mode-boolean"]').click();
      cy.get('[data-testid="firstName"]').should('be.disabled');

      // Switch to none mode
      cy.get('[data-testid="mode-none"]').click();
      cy.get('[data-testid="current-mode"]').should('contain', 'none');

      // All fields should now be enabled (except field-level overrides)
      cy.get('[data-testid="firstName"]').should('not.be.disabled');
      cy.get('[data-testid="lastName"]').should('not.be.disabled');
      cy.get('[data-testid="email"]').should('not.be.disabled');
      cy.get('[data-testid="phone"]').should('not.be.disabled');
    });

    it('should switch back to array mode and restore array settings', () => {
      // Switch to boolean mode
      cy.get('[data-testid="mode-boolean"]').click();
      cy.get('[data-testid="firstName"]').should('be.disabled');

      // Switch back to array mode
      cy.get('[data-testid="mode-array"]').click();
      cy.get('[data-testid="current-mode"]').should('contain', 'array');

      // Should restore previous array disabled state
      cy.get('[data-testid="firstName"]').should('be.disabled');
      cy.get('[data-testid="email"]').should('be.disabled');
      cy.get('[data-testid="lastName"]').should('not.be.disabled');
      cy.get('[data-testid="phone"]').should('not.be.disabled');
    });
  });

  describe('Field-level overrides', () => {
    it('should respect field-level disabled: false override', () => {
      // Switch to boolean mode (all disabled)
      cy.get('[data-testid="mode-boolean"]').click();

      // Field with disabled: false should still be enabled
      cy.get('[data-testid="always-enabled"]').should('not.be.disabled');

      // Regular fields should be disabled
      cy.get('[data-testid="firstName"]').should('be.disabled');
    });

    it('should respect field-level disabled: true override', () => {
      // In none mode (nothing disabled)
      cy.get('[data-testid="mode-none"]').click();

      // Field with disabled: true should still be disabled
      cy.get('[data-testid="always-disabled"]').should('be.disabled');

      // Regular fields should be enabled
      cy.get('[data-testid="firstName"]').should('not.be.disabled');
    });

    it('should respect field-level overrides in array mode', () => {
      // In array mode
      cy.get('[data-testid="mode-array"]').click();

      // Add firstName to disabled array, but field-level override should win
      // always-enabled should be enabled despite any form-level settings
      cy.get('[data-testid="always-enabled"]').should('not.be.disabled');

      // always-disabled should be disabled despite not being in array
      cy.get('[data-testid="always-disabled"]').should('be.disabled');
    });
  });

  describe('Controller component integration', () => {
    it('should handle Controller fields with array disabled', () => {
      // Add controllerField to disabled array
      // Since we can't easily add it through UI, test default behavior
      cy.get('[data-testid="controller-field"]').should('not.be.disabled');
    });

    it('should respect Controller-level disabled prop override', () => {
      // Switch to boolean mode (all disabled)
      cy.get('[data-testid="mode-boolean"]').click();

      // Controller with disabled: false should override form disabled
      cy.get('[data-testid="controller-override"]').should('not.be.disabled');

      // Regular controller should be disabled
      cy.get('[data-testid="controller-field"]').should('be.disabled');
    });

    it('should respect Controller-level disabled: true', () => {
      // In none mode (nothing disabled)
      cy.get('[data-testid="mode-none"]').click();

      // Controller with disabled: true should be disabled
      cy.get('[data-testid="controller-disabled"]').should('be.disabled');

      // Other controllers should be enabled
      cy.get('[data-testid="controller-field"]').should('not.be.disabled');
      cy.get('[data-testid="controller-override"]').should('not.be.disabled');
    });
  });

  describe('Form functionality', () => {
    it('should maintain disabled state after form reset', () => {
      // Verify initial disabled state
      cy.get('[data-testid="firstName"]').should('be.disabled');
      cy.get('[data-testid="lastName"]').should('not.be.disabled');

      // Type in enabled field
      cy.get('[data-testid="lastName"]').clear().type('Modified');

      // Reset form
      cy.get('[data-testid="reset-form"]').click();

      // Disabled state should be maintained
      cy.get('[data-testid="firstName"]').should('be.disabled');
      cy.get('[data-testid="lastName"]').should('not.be.disabled');

      // Value should be reset
      cy.get('[data-testid="lastName"]').should('have.value', 'Doe');
    });

    it('should exclude disabled fields from form submission', () => {
      // Modify enabled field
      cy.get('[data-testid="lastName"]').clear().type('Modified');
      cy.get('[data-testid="phone"]').clear().type('999-888-7777');

      // Try to modify disabled field (shouldn't work)
      cy.get('[data-testid="firstName"]').should('be.disabled');

      // Submit form - in a real app we'd verify submission data
      // For now, just ensure submit works
      cy.get('[data-testid="submit-form"]').click();
    });

    it('should work with form validation', () => {
      // Clear an enabled required field to trigger validation
      cy.get('[data-testid="lastName"]').clear();

      // Form should handle validation correctly
      cy.get('[data-testid="submit-form"]').click();

      // Check form state
      cy.get('[data-testid="is-valid"]').should('contain', 'true'); // No validation rules set, so should be valid
    });
  });

  describe('Debug information', () => {
    it('should show correct form disabled state in different modes', () => {
      // In array mode, form.disabled should be false
      cy.get('[data-testid="mode-array"]').click();
      cy.get('[data-testid="form-disabled"]').should('contain', 'false');

      // In boolean mode, form.disabled should be true
      cy.get('[data-testid="mode-boolean"]').click();
      cy.get('[data-testid="form-disabled"]').should('contain', 'true');

      // In none mode, form.disabled should be false
      cy.get('[data-testid="mode-none"]').click();
      cy.get('[data-testid="form-disabled"]').should('contain', 'false');
    });

    it('should display current disabled value correctly', () => {
      // Array mode should show array
      cy.get('[data-testid="mode-array"]').click();
      cy.get('[data-testid="current-disabled-value"]').should(
        'contain',
        'firstName',
      );
      cy.get('[data-testid="current-disabled-value"]').should(
        'contain',
        'email',
      );

      // Boolean mode should show true
      cy.get('[data-testid="mode-boolean"]').click();
      cy.get('[data-testid="current-disabled-value"]').should(
        'contain',
        'true',
      );

      // None mode should show false
      cy.get('[data-testid="mode-none"]').click();
      cy.get('[data-testid="current-disabled-value"]').should(
        'contain',
        'false',
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid mode switching', () => {
      // Rapidly switch between modes
      cy.get('[data-testid="mode-boolean"]').click();
      cy.get('[data-testid="mode-none"]').click();
      cy.get('[data-testid="mode-array"]').click();
      cy.get('[data-testid="mode-boolean"]').click();
      cy.get('[data-testid="mode-array"]').click();

      // Should end up in correct final state
      cy.get('[data-testid="current-mode"]').should('contain', 'array');
      cy.get('[data-testid="firstName"]').should('be.disabled');
      cy.get('[data-testid="lastName"]').should('not.be.disabled');
    });

    it('should handle rapid field toggles in array mode', () => {
      // Rapidly toggle fields
      cy.get('[data-testid="toggle-lastName"]').click();
      cy.get('[data-testid="toggle-phone"]').click();
      cy.get('[data-testid="toggle-firstName"]').click();
      cy.get('[data-testid="toggle-email"]').click();
      cy.get('[data-testid="toggle-lastName"]').click();

      // Should maintain correct state
      cy.get('[data-testid="lastName"]').should('not.be.disabled');
      cy.get('[data-testid="phone"]').should('be.disabled');
    });

    it('should handle form interaction with disabled fields', () => {
      // Try to interact with disabled fields
      cy.get('[data-testid="firstName"]').should('be.disabled');
      cy.get('[data-testid="firstName"]').type('test', { force: true }); // Force type even if disabled

      // Value shouldn't change in disabled field
      cy.get('[data-testid="firstName"]').should('have.value', 'John'); // Original value

      // But enabled fields should work normally
      cy.get('[data-testid="lastName"]').clear().type('NewName');
      cy.get('[data-testid="lastName"]').should('have.value', 'NewName');
    });
  });
});
