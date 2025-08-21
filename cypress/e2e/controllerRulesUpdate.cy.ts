describe('Controller Rules Update', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/controller-rules-update');
  });

  it('should initially have no validation errors', () => {
    cy.get('[data-testid="username-error"]').should('not.exist');
    cy.get('[data-testid="password-error"]').should('not.exist');
    cy.get('[data-testid="submit-button"]').should('be.enabled');
  });

  it('should add required validation when required rule is selected', () => {
    // Select required rule for username
    cy.get('[data-testid="username-rules"]').within(() => {
      cy.get('input[value="required"]').click();
    });

    // Trigger validation by focusing and blurring
    cy.get('[data-testid="username-input"] input').focus().blur();

    // Should show required error
    cy.get('[data-testid="username-error"]')
      .should('exist')
      .and('contain', 'This field is required');

    // Form should be invalid
    cy.get('[data-testid="submit-button"]').should('be.disabled');
  });

  it('should add minLength validation when minLength rule is selected', () => {
    // Enter short text
    cy.get('[data-testid="username-input"] input').type('abc');

    // Select minLength rule
    cy.get('[data-testid="username-rules"]').within(() => {
      cy.get('input[value="minLength"]').click();
    });

    // Trigger validation by focusing and blurring the input
    cy.get('[data-testid="username-input"] input').focus().blur();

    // Should show minLength error
    cy.get('[data-testid="username-error"]')
      .should('exist')
      .and('contain', 'Minimum 5 characters');
  });

  it('should properly remove old validation rules when switching rule types', () => {
    // Enter short text
    cy.get('[data-testid="username-input"] input').type('abc');

    // Set minLength rule first
    cy.get('[data-testid="username-rules"]').within(() => {
      cy.get('input[value="minLength"]').click();
    });

    // Trigger validation
    cy.get('[data-testid="username-input"] input').focus().blur();

    // Should show minLength error
    cy.get('[data-testid="username-error"]')
      .should('exist')
      .and('contain', 'Minimum 5 characters');

    // Switch to required only (should remove minLength validation)
    cy.get('[data-testid="username-rules"]').within(() => {
      cy.get('input[value="required"]').click();
    });

    // Trigger validation again
    cy.get('[data-testid="username-input"] input').focus().blur();

    // MinLength error should be gone (abc is valid for required rule)
    cy.get('[data-testid="username-error"]').should('not.exist');

    // Form should be valid now
    cy.get('[data-testid="submit-button"]').should('be.enabled');
  });

  it('should clear all validation when switching to no rules', () => {
    // Set required rule and trigger error
    cy.get('[data-testid="username-rules"]').within(() => {
      cy.get('input[value="required"]').click();
    });

    cy.get('[data-testid="username-input"] input').focus().blur();

    // Should have error
    cy.get('[data-testid="username-error"]').should('exist');

    // Switch to no rules
    cy.get('[data-testid="username-rules"]').within(() => {
      cy.get('input[value="none"]').click();
    });

    // Trigger validation
    cy.get('[data-testid="username-input"] input').focus().blur();

    // Wait a moment and check that error is gone
    cy.wait(100);
    cy.get('[data-testid="username-error"]').should('not.exist');
    cy.get('[data-testid="submit-button"]').should('be.enabled');
  });

  it('should handle complex rule changes from required+minLength to required only', () => {
    // Enter short text
    cy.get('[data-testid="password-input"] input').type('ab');

    // Set required + minLength rules
    cy.get('[data-testid="password-rules"]').within(() => {
      cy.get('input[value="requiredAndMinLength"]').click();
    });

    // Trigger validation
    cy.get('[data-testid="password-input"] input').focus().blur();

    // Should show minLength error (since field has content but is too short)
    cy.get('[data-testid="password-error"]')
      .should('exist')
      .and('contain', 'Minimum 5 characters');

    // Switch to required only
    cy.get('[data-testid="password-rules"]').within(() => {
      cy.get('input[value="required"]').click();
    });

    // Trigger validation
    cy.get('[data-testid="password-input"] input').focus().blur();

    // MinLength error should be gone (field has content so required is satisfied)
    cy.get('[data-testid="password-error"]').should('not.exist');
  });

  it('should work independently for multiple fields', () => {
    // Set different rules for username and password
    cy.get('[data-testid="username-rules"]').within(() => {
      cy.get('input[value="required"]').click();
    });

    cy.get('[data-testid="password-rules"]').within(() => {
      cy.get('input[value="minLength"]').click();
    });

    // Enter short text in password only
    cy.get('[data-testid="password-input"] input').type('ab').blur();

    // Username should show required error
    cy.get('[data-testid="username-input"] input').focus().blur();
    cy.get('[data-testid="username-error"]')
      .should('exist')
      .and('contain', 'This field is required');

    // Password should show minLength error
    cy.get('[data-testid="password-error"]')
      .should('exist')
      .and('contain', 'Minimum 5 characters');

    // Fixing username should not affect password error
    cy.get('[data-testid="username-input"] input').type('test').blur();
    cy.get('[data-testid="username-error"]').should('not.exist');
    cy.get('[data-testid="password-error"]').should('exist');
  });

  it('should reset form and rules when reset button is clicked', () => {
    // Set some rules and enter data
    cy.get('[data-testid="username-rules"]').within(() => {
      cy.get('input[value="required"]').click();
    });

    cy.get('[data-testid="username-input"] input').type('test');

    // Click reset
    cy.get('[data-testid="reset-button"]').click();

    // Rules should be reset to none
    cy.get('[data-testid="username-rules"]').within(() => {
      cy.get('input[value="none"]').should('be.checked');
    });

    // Fields should be cleared
    cy.get('[data-testid="username-input"] input').should('have.value', '');

    // No errors should be present
    cy.get('[data-testid="username-error"]').should('not.exist');
    cy.get('[data-testid="password-error"]').should('not.exist');
  });

  it('should show proper validation behavior in real-time', () => {
    // Set minLength rule
    cy.get('[data-testid="username-rules"]').within(() => {
      cy.get('input[value="minLength"]').click();
    });

    // Type text gradually and check validation
    cy.get('[data-testid="username-input"] input').type('a').blur();
    cy.get('[data-testid="username-error"]').should('exist');

    cy.get('[data-testid="username-input"] input').type('b').blur();
    cy.get('[data-testid="username-error"]').should('exist');

    cy.get('[data-testid="username-input"] input').type('cde').blur();
    cy.get('[data-testid="username-error"]').should('not.exist');

    // Switch to required + minLength
    cy.get('[data-testid="username-rules"]').within(() => {
      cy.get('input[value="requiredAndMinLength"]').click();
    });

    // Should still be valid (has 5+ chars)
    cy.get('[data-testid="username-input"] input').focus().blur();
    cy.get('[data-testid="username-error"]').should('not.exist');

    // Clear field - should show required error
    cy.get('[data-testid="username-input"] input').clear().blur();
    cy.get('[data-testid="username-error"]')
      .should('exist')
      .and('contain', 'This field is required');
  });
});
