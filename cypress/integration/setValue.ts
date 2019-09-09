context('form setValue', () => {
  it('should set input value, trigger validation and clear all errors', () => {
    cy.visit('http://localhost:3000/setValue');

    cy.get('input[name="firstName"]').should('have.value', 'wrong');
    cy.get('input[name="age"]').should('have.value', '2');
    cy.get('input[name="radio"]').should('have.checked', true);
    cy.get('select[name="select"]').should('have.value', 'a');
    cy.get('select[name="multiple"]')
      .invoke('val')
      .should('deep.equal', ['a', 'b']);
    cy.get('#trigger').contains('Trigger error');
    cy.get('#lastName').should('not.exist');

    cy.get('button').click();

    cy.get('#lastName').contains('Last name error');

    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="trigger"]').type('trigger');

    cy.get('button').click();
    cy.get('p').should('have.length', 0);
    cy.get('#renderCount').contains('11');
  });
});
