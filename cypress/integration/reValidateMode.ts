context('re validate mode', () => {
  it('should re validate the form only onSubmit with mode onSubmit and reValidateMode onSubmit', () => {
    cy.visit('http://localhost:3000/re-validate-mode/onSubmit/onSubmit');

    cy.get('button#submit').click();

    cy.get('input[name="firstName"] + p').contains('firstName error');
    cy.get('input[name="lastName"] + p').contains('lastName error');

    cy.get('input[name="firstName"]').type('luo123456');
    cy.get('input[name="lastName"]').type('luo12');

    cy.get('input[name="firstName"] + p').contains('firstName error');
    cy.get('input[name="lastName"] + p').contains('lastName error');

    cy.get('button#submit').click();

    cy.get('p').should('have.length', 0);
    cy.get('#renderCount').contains('5');
  });

  it('should re validate the form only onBlur with mode onSubmit and reValidateMode onBlur', () => {
    cy.visit('http://localhost:3000/re-validate-mode/onSubmit/onBlur');

    cy.get('button#submit').click();

    cy.get('input[name="firstName"] + p').contains('firstName error');
    cy.get('input[name="lastName"] + p').contains('lastName error');

    cy.get('input[name="firstName"]').type('luo123456');
    cy.get('input[name="firstName"] + p').contains('firstName error');
    cy.get('input[name="firstName"]').blur();
    cy.get('input[name="lastName"]').type('luo12');
    cy.get('input[name="lastName"] + p').contains('lastName error');
    cy.get('input[name="lastName"]').blur();

    cy.get('p').should('have.length', 0);
    cy.get('#renderCount').contains('7');
  });
});
