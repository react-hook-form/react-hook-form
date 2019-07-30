context('basic validation', () => {
  it('should validate basic form', () => {
    cy.visit('http://localhost:3000');
    cy.get('button').click();

    cy.get('p.firstName').contains('firstName error');
    cy.get('p.lastName').contains('lastName error');

    cy.get('input[name="firstName"]').type('bill');
    cy.get('input[name="lastName"]').type('luo');

    cy.get('p').should('have.length', 0);
  });
});
