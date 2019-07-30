context('basic', () => {
  it('should validate basic form', () => {
    cy.visit('http://localhost:3000');
    cy.get('button').click();

    cy.get('p.firstName').contains('firstName error');
    cy.get('p.lastName').contains('lastName error');
  });
});
