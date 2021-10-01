describe('form reset', () => {
  it('should be able to re-populate the form while reset', () => {
    cy.visit('http://localhost:3000/reset');

    cy.get('input[name="firstName"]').type('0 wrong');
    cy.get('input[name="array.1"]').type('1 wrong');
    cy.get('input[name="objectData.test"]').type('2 wrong');
    cy.get('input[name="lastName"]').type('lastName');
    cy.get('input[name="deepNest.level1.level2.data"]').type('whatever');

    cy.get('button').click();

    cy.get('input[name="firstName"]').should('have.value', 'bill');
    cy.get('input[name="lastName"]').should('have.value', 'luo');
    cy.get('input[name="array.1"]').should('have.value', 'test');
    cy.get('input[name="objectData.test"]').should('have.value', 'data');
    cy.get('input[name="deepNest.level1.level2.data"]').should(
      'have.value',
      'hey',
    );
  });
});
