describe('controllable isLoading state', () => {
  it('should return default value with watch', () => {
    cy.visit('http://localhost:3000/is-loading');

    // starts false
    cy.get('p#state-value').should('have.text', 'false');
    cy.get('p#form-value').should('have.text', 'false');

    // toggle to true
    cy.get('#toggle').click();
    cy.get('p#state-value').should('have.text', 'true');
    cy.get('p#form-value').should('have.text', 'true');

    // unset to undefined
    cy.get('#unset').click();
    cy.get('p#state-value').should('have.text', 'undefined');
    cy.get('p#form-value').should('have.text', 'false');

    // toggle to true
    cy.get('#toggle').click();
    cy.get('p#state-value').should('have.text', 'true');
    cy.get('p#form-value').should('have.text', 'true');

    // toggle to false
    cy.get('#toggle').click();
    cy.get('p#state-value').should('have.text', 'false');
    cy.get('p#form-value').should('have.text', 'false');

    // unset to undefined
    cy.get('#unset').click();
    cy.get('p#state-value').should('have.text', 'undefined');
    cy.get('p#form-value').should('have.text', 'false');
  });
});
