describe('delayError', () => {
  it('should delay from errors appear', () => {
    cy.visit('http://localhost:3000/delayError');

    const firstInput = () => cy.get('input[name="first"]');
    const firstInputError = () => cy.get('input[name="first"] + p');
    const lastInput = () => cy.get('input[name="last"]');
    const lastInputError = () => cy.get('input[name="last"] + p');

    firstInput().type('12');
    cy.wait(100);
    firstInputError().contains('First too long.');

    lastInput().type('12');
    cy.wait(100);
    lastInputError().contains('Last too long.');

    lastInput().blur();
    cy.get('button').click();

    firstInput().type('12');
    lastInput().type('12');

    firstInputError().contains('First too long.');
    lastInputError().contains('Last too long.');

    firstInput().clear().type('1');
    lastInput().clear().type('1');

    lastInput().blur();

    cy.get('p').should('have.length', 0);
  });
});
