context('watchUseFieldArray', () => {
  it('should behaviour correctly when watching the field array', () => {
    cy.visit('http://localhost:3000/watch-field-array');

    cy.get('#append').click();
    cy.get('#result').contains('[{"name":"2"}]');

    cy.get('#field0').type('test');
    cy.get('#result').contains('[{"name":"2test"}]');

    cy.get('#prepend').click();
    cy.get('#result').contains('[{"name":"9"},{"name":"2test"}]');

    cy.get('#append').click();
    cy.get('#append').click();
    cy.get('#append').click();
    cy.get('#result').contains(
      '[{"name":"9"},{"name":"2test"},{"name":"11"},{"name":"13"},{"name":"15"}]',
    );

    cy.get('#swap').click();
    cy.get('#result').contains(
      '[{"name":"9"},{"name":"11"},{"name":"2test"},{"name":"13"},{"name":"15"}]',
    );

    cy.get('#move').click();
    cy.get('#result').contains(
      '[{"name":"2test"},{"name":"9"},{"name":"11"},{"name":"13"},{"name":"15"}]',
    );

    cy.get('#insert').click();
    cy.get('#result').contains(
      '[{"name":"2test"},{"name":"21"},{"name":"9"},{"name":"11"},{"name":"13"},{"name":"15"}]',
    );

    cy.get('#remove').click();
    cy.get('#result').contains(
      '[{"name":"2test"},{"name":"9"},{"name":"11"},{"name":"13"},{"name":"15"}]',
    );

    cy.get('#removeAll').click();
    cy.get('#result').should('be.empty');
  });
});
