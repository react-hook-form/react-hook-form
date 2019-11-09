context('form setValue with schema', () => {
  it('should set input value, trigger validation and clear all errors', () => {
    cy.visit('http://localhost:3000/setValueWithSchema');

    cy.get('input[name="firstName"]').type('a');
    cy.get('input[name="firstName"] + p').contains('firstName error');
    cy.get('p').should('have.length', 1);
    cy.get('input[name="firstName"]').type('asdasdasdasd');

    cy.get('input[name="lastName"]').type('a');
    cy.get('input[name="lastName"] + p').contains('lastName error');
    cy.get('p').should('have.length', 1);
    cy.get('input[name="lastName"]').type('asdasdasdasd');

    cy.get('input[name="age"]').type('a2323');

    cy.get('button').click();
    cy.get('p').should('have.length', 0);
    cy.get('#renderCount').contains('6');
  });
});
