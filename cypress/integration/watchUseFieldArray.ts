describe('watchUseFieldArray', () => {
  it('should behaviour correctly when watching the field array', () => {
    cy.visit('http://localhost:3000/watch-field-array/normal');

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
      '[{"name":"9"},{"name":"2test"},{"name":"12"},{"name":"15"},{"name":"18"}]',
    );

    cy.get('#swap').click();
    cy.get('#result').contains(
      '[{"name":"9"},{"name":"12"},{"name":"2test"},{"name":"15"},{"name":"18"}]',
    );

    cy.get('#move').click();
    cy.get('#result').contains(
      '[{"name":"2test"},{"name":"9"},{"name":"12"},{"name":"15"},{"name":"18"}]',
    );

    cy.get('#insert').click();
    cy.get('#result').contains(
      '[{"name":"2test"},{"name":"25"},{"name":"9"},{"name":"12"},{"name":"15"},{"name":"18"}]',
    );

    cy.get('#remove').click();
    cy.get('#result').contains(
      '[{"name":"2test"},{"name":"9"},{"name":"12"},{"name":"15"},{"name":"18"}]',
    );

    cy.get('#removeAll').click();
    cy.get('#result').should('be.empty');
    cy.get('#renderCount').contains('32');
  });

  it('should return empty when items been removed and defaultValues are supplied', () => {
    cy.visit('http://localhost:3000/watch-field-array/default');

    cy.get('#delete0').click();
    cy.get('#delete0').click();
    cy.get('#delete0').click();

    cy.get('#result').contains(
      '[{"name":"test"},{"name":"test1"},{"name":"test2"}]',
    );
  });
});
