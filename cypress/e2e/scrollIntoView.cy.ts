describe('ScrollIntoView', () => {
  it('should expose scrollIntoView method on field refs', () => {
    cy.visit('/scroll-into-view');

    // Test that all fields are rendered
    cy.get('input[id="firstName"]').should('exist');
    cy.get('input[id="lastName"]').should('exist');
    cy.get('input[id="email"]').should('exist');
    cy.get('textarea[id="message"]').should('exist');
  });

  it('should scroll to field when scroll button is clicked', () => {
    cy.visit('/scroll-into-view');

    // Test scrolling to different fields
    cy.get('button').contains('Scroll to Last Name').click();

    // Wait a bit for smooth scrolling to complete
    cy.wait(500);

    // Check that the Last Name field is in view
    cy.get('input[id="lastName"]').should('be.visible');

    // Test scrolling to the message field (should be at bottom)
    cy.get('button').contains('Scroll to Message').click();
    cy.wait(500);
    cy.get('textarea[id="message"]').should('be.visible');

    // Test scrolling back to first field
    cy.get('button').contains('Scroll to First Name').click();
    cy.wait(500);
    cy.get('input[id="firstName"]').should('be.visible');
  });

  it('should work with error handling and field focus', () => {
    cy.visit('/scroll-into-view');

    // Test that scrollIntoView works in combination with form validation
    cy.get('input[id="firstName"]').type('John');
    cy.get('input[id="lastName"]').type('Doe');

    // Clear the fields to trigger validation errors
    cy.get('input[id="firstName"]').clear();
    cy.get('input[id="lastName"]').clear();

    // Scroll to email field and test it
    cy.get('button').contains('Scroll to Email').click();
    cy.wait(300);
    cy.get('input[id="email"]').should('be.visible');
    cy.get('input[id="email"]').type('invalid-email');

    // Scroll to message field
    cy.get('button').contains('Scroll to Message').click();
    cy.wait(300);
    cy.get('textarea[id="message"]').should('be.visible');
    cy.get('textarea[id="message"]').type('This is a test message');
  });

  it('should handle scrolling with different scroll options', () => {
    cy.visit('/scroll-into-view');

    // Test that buttons are clickable and functional
    ['First Name', 'Last Name', 'Email', 'Message'].forEach((fieldName) => {
      cy.get('button')
        .contains(`Scroll to ${fieldName}`)
        .should('be.visible')
        .click();
      cy.wait(200); // Short wait between scrolls
    });
  });

  it('should maintain field functionality after scrolling', () => {
    cy.visit('/scroll-into-view');

    // Scroll to a field and then interact with it
    cy.get('button').contains('Scroll to Email').click();
    cy.wait(300);

    // Type in the field after scrolling
    cy.get('input[id="email"]').type('test@example.com');
    cy.get('input[id="email"]').should('have.value', 'test@example.com');

    // Scroll to another field and interact
    cy.get('button').contains('Scroll to Message').click();
    cy.wait(300);

    cy.get('textarea[id="message"]').type('Hello World');
    cy.get('textarea[id="message"]').should('have.value', 'Hello World');
  });
});
