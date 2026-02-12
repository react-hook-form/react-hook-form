describe('input type', () => {
  it('changing input type should ', () => {
    cy.visit('http://localhost:3000/changeInputType');

    cy.get('input[name="value"]').should('have.value', 'hello');
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        type: 'text',
        value: 'hello',
      }),
    );

    cy.get('input[name="type"]').clear();
    cy.get('input[name="type"]').type('number');
    cy.get('input[name="type"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        type: 'number',
        value: 42,
      }),
    );
    cy.get('input[name="value"]').should('have.value', '42');

    cy.get('input[name="type"]').clear();
    cy.get('input[name="type"]').type('checkbox');
    cy.get('input[name="type"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        type: 'checkbox',
        value: true,
      }),
    );
    cy.get('input[name="value"]').should('be.checked');

    cy.get('input[name="type"]').clear();
    cy.get('input[name="type"]').type('number');
    cy.get('input[name="type"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        type: 'number',
        value: 42,
      }),
    );
    cy.get('input[name="value"]').should('have.value', '42');

    cy.get('input[name="type"]').clear();
    cy.get('input[name="type"]').type('text');
    cy.get('input[name="type"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        type: 'text',
        value: 'hello',
      }),
    );
    cy.get('input[name="value"]').should('have.value', 'hello');
  });
});
