describe('form setValueAsyncStrictMode', () => {
  it('should set async input value correctly', () => {
    cy.visit('/setValueAsyncStrictMode');

    cy.wait(10);

    cy.get('#submit').click();

    cy.get('p').contains('["test","A","B","C","D"]');
  });
});
