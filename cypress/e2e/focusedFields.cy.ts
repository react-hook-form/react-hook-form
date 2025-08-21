describe('focusedField', () => {
  it('should track which field is currently focused', () => {
    cy.visit('http://localhost:3001/focused-fields');

    // Initially no fields should be focused
    cy.get('#focused-field').should('contain', 'none');
    cy.get('#firstName-focused').should('contain', 'firstName not focused');
    cy.get('#lastName-focused').should('contain', 'lastName not focused');
    cy.get('#email-focused').should('contain', 'email not focused');
    cy.get('#nested-focused').should('contain', 'nested not focused');
    cy.get('#focused-field-json').should('contain', '{}');

    // Focus on firstName
    cy.get('#firstName').focus();
    cy.get('#focused-field').should('contain', 'firstName');
    cy.get('#firstName-focused').should('contain', 'firstName focused');
    cy.get('#lastName-focused').should('contain', 'lastName not focused');
    cy.get('#email-focused').should('contain', 'email not focused');
    cy.get('#nested-focused').should('contain', 'nested not focused');

    // Focus on lastName - should clear firstName focus
    cy.get('#lastName').focus();
    cy.get('#focused-field').should('contain', 'lastName');
    cy.get('#firstName-focused').should('contain', 'firstName not focused');
    cy.get('#lastName-focused').should('contain', 'lastName focused');
    cy.get('#email-focused').should('contain', 'email not focused');
    cy.get('#nested-focused').should('contain', 'nested not focused');

    // Focus on email field
    cy.get('#email').focus();
    cy.get('#focused-field').should('contain', 'email');
    cy.get('#firstName-focused').should('contain', 'firstName not focused');
    cy.get('#lastName-focused').should('contain', 'lastName not focused');
    cy.get('#email-focused').should('contain', 'email focused');
    cy.get('#nested-focused').should('contain', 'nested not focused');

    // Focus on nested field
    cy.get('#nestedField').focus();
    cy.get('#focused-field').should('contain', 'nested.field');
    cy.get('#firstName-focused').should('contain', 'firstName not focused');
    cy.get('#lastName-focused').should('contain', 'lastName not focused');
    cy.get('#email-focused').should('contain', 'email not focused');
    cy.get('#nested-focused').should('contain', 'nested focused');

    // Blur the nested field - all should be not focused
    cy.get('#nestedField').blur();
    cy.get('#focused-field').should('contain', 'none');
    cy.get('#firstName-focused').should('contain', 'firstName not focused');
    cy.get('#lastName-focused').should('contain', 'lastName not focused');
    cy.get('#email-focused').should('contain', 'email not focused');
    cy.get('#nested-focused').should('contain', 'nested not focused');
    cy.get('#focused-field-json').should('contain', '{}');
  });

  it('should reset focused field when form is reset', () => {
    cy.visit('http://localhost:3001/focused-fields');

    // Focus on a field
    cy.get('#firstName').focus();
    cy.get('#focused-field').should('contain', 'firstName');
    cy.get('#firstName-focused').should('contain', 'firstName focused');

    // Reset form
    cy.get('#resetButton').click();

    // Focused field should be cleared
    cy.get('#focused-field').should('contain', 'none');
    cy.get('#firstName-focused').should('contain', 'firstName not focused');
    cy.get('#lastName-focused').should('contain', 'lastName not focused');
    cy.get('#email-focused').should('contain', 'email not focused');
    cy.get('#nested-focused').should('contain', 'nested not focused');
    cy.get('#focused-field-json').should('contain', '{}');
  });

  it('should handle focus switching between multiple fields', () => {
    cy.visit('http://localhost:3001/focused-fields');

    // Rapid focus switching
    cy.get('#firstName').focus();
    cy.get('#lastName').focus();
    cy.get('#email').focus();
    cy.get('#firstName').focus();

    // Only the last focused field should be focused
    cy.get('#focused-field').should('contain', 'firstName');
    cy.get('#firstName-focused').should('contain', 'firstName focused');
    cy.get('#lastName-focused').should('contain', 'lastName not focused');
    cy.get('#email-focused').should('contain', 'email not focused');
    cy.get('#nested-focused').should('contain', 'nested not focused');

    // Verify JSON state
    cy.get('#focused-field-json').should(
      'contain',
      '"focusedField":"firstName"',
    );
    cy.get('#focused-field-json').should('not.contain', '"lastName"');
    cy.get('#focused-field-json').should('not.contain', '"email"');
  });
});
