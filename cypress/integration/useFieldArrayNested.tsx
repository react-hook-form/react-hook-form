describe.skip('useFieldArrayNested', () => {
  it('should work correctly with nested field array', () => {
    cy.visit('http://localhost:3000/useFieldArrayNested');

    cy.get(`#nest-append-0`).click();
    cy.get(`#nest-prepend-0`).click();
    cy.get(`#nest-insert-0`).click();
    cy.get(`#nest-swap-0`).click();
    cy.get(`#nest-move-0`).click();

    cy.get('input[name="test.0.keyValue.0.name"]').should(
      'have.value',
      'insert',
    );
    cy.get('input[name="test.0.keyValue.1.name"]').should(
      'have.value',
      'prepend',
    );
    cy.get('input[name="test.0.keyValue.2.name"]').should('have.value', '1a');
    cy.get('input[name="test.0.keyValue.3.name"]').should('have.value', '1c');
    cy.get('input[name="test.0.keyValue.4.name"]').should(
      'have.value',
      'append',
    );

    cy.get(`#nest-remove-0`).click();
    cy.get('input[name="test.0.keyValue.2.name"]').should('have.value', '1c');
    cy.get('input[name="test.0.keyValue.3.name"]').should(
      'have.value',
      'append',
    );

    cy.get('#dirty-nested-0').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        test: [
          {
            keyValue: [
              { name: true },
              { name: true },
              { name: true },
              { name: true },
            ],
          },
        ],
      }),
    );

    cy.get('#touched-nested-0').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        test: [{ keyValue: [{ name: true }, null, null, { name: true }] }],
      }),
    );

    cy.get('#prepend').click();

    cy.get('#dirty-nested-0').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        test: [
          {
            firstName: true,
            lastName: true,
            keyValue: [{ name: true }, { name: true }],
          },
          {
            firstName: true,
            lastName: true,
            keyValue: [
              { name: true },
              { name: true },
              { name: true },
              { name: true },
            ],
          },
        ],
      }),
    );

    cy.get('#touched-nested-0').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        test: [
          null,
          { keyValue: [{ name: true }, null, null, { name: true }] },
        ],
      }),
    );

    cy.get('#append').click();
    cy.get('#swap').click();
    cy.get('#insert').click();

    cy.get('#touched-nested-0').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        test: [
          { firstName: true },
          null,
          { firstName: true },
          { keyValue: [{ name: true }, null, null, { name: true }] },
        ],
      }),
    );

    cy.get('#dirty-nested-0').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        test: [
          {
            firstName: true,
            lastName: true,
            keyValue: [
              { name: true },
              { name: true },
              { name: true },
              { name: true },
            ],
          },
          {
            firstName: true,
            lastName: true,
            keyValue: [
              { name: true },
              { name: true },
              { name: true },
              { name: true },
            ],
          },
          {
            firstName: true,
            lastName: true,
            keyValue: [
              { name: true },
              { name: true },
              { name: true },
              { name: true },
            ],
          },
          {
            firstName: true,
            lastName: true,
            keyValue: [
              { name: true },
              { name: true },
              { name: true },
              { name: true },
            ],
          },
        ],
      }),
    );
  });
});
