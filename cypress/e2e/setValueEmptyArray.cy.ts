describe('setValue empty array validation', () => {
  it('should trigger validation when setting empty array with shouldValidate', () => {
    cy.visit('http://localhost:3000/empty-array-validation');

    // Initially, the arrays should have values and no errors
    cy.get('input[name="items.0"]').should('have.value', 'item1');
    cy.get('input[name="items.1"]').should('have.value', 'item2');
    cy.get('#items-error').should('not.exist');

    cy.get('input[name="nested.tags.0"]').should('have.value', 'tag1');
    cy.get('input[name="nested.tags.1"]').should('have.value', 'tag2');
    cy.get('#tags-error').should('not.exist');

    cy.get('input[name="deep.level.values.0"]').should('have.value', 'value1');
    cy.get('input[name="deep.level.values.1"]').should('have.value', 'value2');
    cy.get('#deep-error').should('not.exist');

    // Clear items array - should trigger validation error
    cy.get('#clear-items').click();
    cy.get('#items-error').should('exist');
    cy.get('#items-error').should(
      'contain',
      'Items must have at least one item',
    );
    // When array is cleared, the existing inputs may retain their values but the array is empty
    // The validation error is what's important here

    // Clear nested tags array - should trigger validation error
    cy.get('#clear-tags').click();
    cy.get('#tags-error').should('exist');
    cy.get('#tags-error').should('contain', 'Tags must have at least one tag');

    // Clear deep nested values array - should trigger validation error
    cy.get('#clear-deep').click();
    cy.get('#deep-error').should('exist');
    cy.get('#deep-error').should('contain', 'Values cannot be empty');

    // Submit should not work with validation errors
    cy.get('#submit').click();
    cy.get('#items-error').should('exist');
    cy.get('#tags-error').should('exist');
    cy.get('#deep-error').should('exist');

    // Set new items to clear the error
    cy.get('#set-items').click();
    cy.get('#items-error').should('not.exist');

    // Manually add values to clear other errors
    cy.get('input[name="nested.tags.0"]').type('newtag1');
    cy.get('input[name="deep.level.values.0"]').type('newvalue1');

    // Validate all should clear errors now
    cy.get('#validate').click();
    cy.get('#tags-error').should('not.exist');
    cy.get('#deep-error').should('not.exist');
  });

  it('should immediately show validation errors when clearing arrays', () => {
    cy.visit('http://localhost:3000/empty-array-validation');

    // Clear all arrays in sequence
    cy.get('#clear-items').click();
    cy.get('#clear-tags').click();
    cy.get('#clear-deep').click();

    // All errors should be visible immediately
    cy.get('#items-error').should('be.visible');
    cy.get('#tags-error').should('be.visible');
    cy.get('#deep-error').should('be.visible');

    // Errors should have correct messages
    cy.get('#items-error').should(
      'contain',
      'Items must have at least one item',
    );
    cy.get('#tags-error').should('contain', 'Tags must have at least one tag');
    cy.get('#deep-error').should('contain', 'Values cannot be empty');
  });
});
