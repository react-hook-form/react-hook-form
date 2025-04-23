describe('defaultValues', () => {
  it('should submit form imperatively', () => {
    cy.visit('http://localhost:3000/imperative-submit');

    const nameInput = () => cy.get('input[name="name"]');
    const formIdInput = () => cy.get('input[name="formId"]');

    cy.get('input[name="name"]').should('have.value', '');
    cy.get('input[name="formId"]').should('have.value', '');

    formIdInput().type('my-form');
    cy.get('#form-id').contains('my-form');

    nameInput().type('bill');

    cy.get('#hookSubmit').click();

    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        name: 'bill',
      }),
    );

    formIdInput().clear().type('my-new-form');
    nameInput().clear().type('luo');

    cy.get('#hookSubmit').click();

    cy.get('#form-id').contains('my-new-form');
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        name: 'luo',
      }),
    );

    formIdInput().clear();
    cy.get('#form-id').contains('form-');

    nameInput().clear().type('bombillazo');
    cy.get('#funcSubmit').click();

    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        name: 'bombillazo',
      }),
    );
  });
});
