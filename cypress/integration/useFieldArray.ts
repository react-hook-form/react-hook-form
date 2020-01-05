context('useFieldArray', () => {
  it('should behaviour correctly', () => {
    cy.visit('http://localhost:3000/useFieldArray/normal');
    cy.get('#append').click();
  });
});
