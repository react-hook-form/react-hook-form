describe('basic form validation', () => {
  it('should validate the form and reset the form', () => {
    cy.visit(
      `http://localhost:3000/basic/queryString?default-values=${encodeURIComponent(
        JSON.stringify({
          firstName: 'bill',
          lastName: 'luo',
          nestItem: {
            nest1: 'nest1',
          },
          arrayItem: [{ test1: 'test1' }],
          radio: '1',
          multiple: 'optionA',
          checkboxArray: ['1', '2', '3'],
          selectNumber: '1',
          minDate: '2023-10-23',
        }),
      )}`,
    );
    cy.get('input[name="firstName"]').should('have.value', 'bill');
    cy.get('input[name="lastName"]').should('have.value', 'luo');
    cy.get('input[name="nestItem.nest1"]').should('have.value', 'nest1');
    cy.get('input[name="arrayItem.0.test1"]').should('have.value', 'test1');
    cy.get('input[name="radio"]').should('have.value', '1');
    cy.get('input[name="checkboxArray"]').should('be.checked');
    cy.get('select[name="selectNumber"]').should('have.value', '1');
    cy.get('input[name="minDate"]').should('have.value', '2023-10-23');
  });
});
