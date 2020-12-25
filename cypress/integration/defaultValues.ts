describe('defaultValues', () => {
  it('should populate defaultValue for inputs', () => {
    cy.visit('http://localhost:3000/default-values');

    cy.get('input[name="test"]').should('have.value', 'test');
    cy.get('input[name="test1.firstName"]').should('have.value', 'firstName');
    cy.get('input[name="test1.lastName.0"]').should('have.value', 'lastName0');
    cy.get('input[name="test1.lastName.1"]').should('have.value', 'lastName1');
  });
});
