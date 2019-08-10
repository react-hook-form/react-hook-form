context('form setValue', () => {
  it('should contain 3 errors when page land', () => {
    cy.visit('http://localhost:3000/setValue');

    cy.get('input[name="firstName"]').should('have.value', 'wrong');
    cy.get('input[name="age"]').should('have.value', '2');
    cy.get('#trigger').contains('Trigger error');
    cy.get('#lastName').should('not.exist');

    cy.get('button').click();

    cy.get('#lastName').contains('Last name error');

    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="trigger"]').type('trigger');

    cy.get('button').click();
    cy.get('p').should('have.length', 0);
  });
});
