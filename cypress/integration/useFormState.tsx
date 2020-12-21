describe('useFormState', () => {
  it('should subscribed to the form state without re-render the root', () => {
    cy.visit('http://localhost:3000/useFormState');
    cy.get('button#submit').click();

    cy.get('input[name="firstName"]').type('bill');
    cy.get('input[name="firstName"]').type('a');
    cy.get('input[name="arrayItem[0].test1"]').type('ab');
    cy.get('input[name="nestItem.nest1"]').type('ab');
    cy.get('input[name="lastName"]').type('luo123456');
    cy.get('select[name="selectNumber"]').select('1');
    cy.get('input[name="pattern"]').type('luo');
    cy.get('input[name="min"]').type('1');
    cy.get('input[name="max"]').type('21');
    cy.get('input[name="minDate"]').type('2019-07-30');
    cy.get('input[name="maxDate"]').type('2019-08-02');
    cy.get('input[name="lastName"]').clear().type('luo');
    cy.get('input[name="minLength"]').type('b');

    // check again

    cy.get('input[name="pattern"]').type('23');
    cy.get('input[name="minLength"]').type('bi');
    cy.get('input[name="minRequiredLength"]').type('bi');
    cy.get('input[name="min"]').clear().type('11');
    cy.get('input[name="max"]').clear().type('19');
    cy.get('input[name="minDate"]').type('2019-08-01');
    cy.get('input[name="maxDate"]').type('2019-08-01');

    // check again

    cy.get('#resetForm').click();

    // check again
    cy.get('#renderCount').contains('2');
  });
});
