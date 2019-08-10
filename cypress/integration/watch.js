context('watch form validation', () => {
  it('should watch all inputs', () => {
    cy.visit('http://localhost:3000/watch');

    cy.get('#watchAll').contains('{}');
    cy.get('#HideTestSingle').should('not.exist');
    cy.get('input[name="testSingle"]').type('testSingle');
    cy.get('#HideTestSingle').contains('Hide Content TestSingle');
    cy.get('#watchAll').contains(
      '{"testSingle":"testSingle","test[0]":"","test[1]":"","testObject.firstName":"","testObject.lastName":"","toggle":false}',
    );

    cy.get('input[name="test[0]"]').type('bill');
    cy.get('input[name="test[1]"]').type('luo');
    cy.get('#testData').contains('["bill","luo"]');
    cy.get('#testArray').contains('{"test[0]":"bill","test[1]":"luo"}');cy.get('#watchAll').contains(
      '{"testSingle":"testSingle","test[0]":"bill","test[1]":"luo","testObject.firstName":"","testObject.lastName":"","toggle":false}',
    );

    cy.get('input[name="testObject.firstName"').type('bill');
    cy.get('input[name="testObject.lastName"').type('luo');
    cy.get('#testObject').contains('{"firstName":"bill","lastName":"luo"}');
    cy.get('#testArray').contains('{"test[0]":"bill","test[1]":"luo"}');cy.get('#watchAll').contains(
      '{"testSingle":"testSingle","test[0]":"bill","test[1]":"luo","testObject.firstName":"bill","testObject.lastName":"luo","toggle":false}',
    );

    cy.get('#hideContent').should('not.exist');
    cy.get('input[name="toggle"').check();
    cy.get('#hideContent').contains('Hide Content');

    cy.get('#watchAll').contains(
      '{"testSingle":"testSingle","test[0]":"bill","test[1]":"luo","testObject.firstName":"bill","testObject.lastName":"luo","toggle":true}',
    );
  });
});
