describe('useFieldArrayUnregister', () => {
  it('should behaviour correctly', () => {
    cy.visit('http://localhost:3000/UseFieldArrayUnregister');

    cy.get('#field0').clear().type('bill');

    cy.get('input[name="data[0].conditional"]').type('test');
  });
});
