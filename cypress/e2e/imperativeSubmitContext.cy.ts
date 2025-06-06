describe('imperativeSubmitContext', () => {
  it('should submit form imperatively', () => {
    cy.visit('http://localhost:3000/imperative-submit-context');

    const nameInput = () => cy.get('input[name="name"]');

    cy.get('input[name="name"]').should('have.value', '');

    nameInput().type('bill');

    cy.get('button').click();

    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        name: 'bill',
      }),
    );
  });
});
