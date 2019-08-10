context('basic form validation', () => {
  it('should contain 3 errors when page land', () => {
    cy.visit('http://localhost:3000/setError');

    cy.get('#error0').contains('0 wrong');
    cy.get('#error1').contains('1 wrong');
    cy.get('#error2').contains('2 wrong');
  });

  it('should clear individual error', () => {
    cy.visit('http://localhost:3000/setError');

    cy.get('#clear1').click();
    cy.get('#clear2').click();
    cy.get('#error0').contains('0 wrong');
  });

  it('should clear an array of errors', () => {
    cy.visit('http://localhost:3000/setError');

    cy.get('#clearArray').click();
    cy.get('#error0').contains('0 wrong');
  });

  it('should clear every errors', () => {
    cy.visit('http://localhost:3000/setError');

    cy.get('#clear').click();
    cy.get('#errorContainer').should('not.value');
  });
});
