context('validate field criteria', () => {
  it('should validate the form and reset the form', () => {
    cy.visit('http://localhost:3000/validate-field-criteria/true');
    cy.get('button#submit').click();
  });
});
