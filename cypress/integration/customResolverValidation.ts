describe('customSchemaValidation form validation', () => {
  it('should validate the form with onSubmit mode', () => {
    cy.visit('http://localhost:3000/customResolverValidation/onSubmit');
    cy.get('button').click();

    cy.get('#customFormError').contains('Custom Error');
    cy.get('select[name="selectNumber"] + p').contains('selectNumber error');
    cy.get('input[name="minRequiredLength"] + p').contains(
      'minRequiredLength error',
    );
    cy.get('input[name="radio"] + p').contains('radio error');

    cy.get('input[name="password"]').type('secret');
    cy.get('input[name="confirmPassword"]').type('secrets');
    cy.get('input[name="confirmPassword"] + p').contains(
      'confirmPassword error',
    );
    cy.get('input[name="password"]').type('s');
    cy.get('input[name="firstName"]').type('bill');
    cy.get('#customFormError').should('not.exist');
    cy.get('input[name="lastName"]').type('luo123456');
    cy.get('select[name="selectNumber"]').select('1');
    cy.get('input[name="pattern"]').type('luo');
    cy.get('input[name="min"]').type('1');
    cy.get('input[name="max"]').type('21');
    cy.get('input[name="minDate"]').type('2019-07-30');
    cy.get('input[name="maxDate"]').type('2019-08-02');
    cy.get('input[name="lastName"]').clear().type('luo');
    cy.get('input[name="minLength"]').type('2');
    cy.get('input[name="minLength"] + p').contains('minLength error');
    cy.get('input[name="min"] + p').contains('min error');
    cy.get('input[name="max"] + p').contains('max error');
    cy.get('input[name="minDate"] + p').contains('minDate error');
    cy.get('input[name="maxDate"] + p').contains('maxDate error');

    cy.get('input[name="pattern"]').type('23');
    cy.get('input[name="minLength"]').type('bi');
    cy.get('input[name="minRequiredLength"]').type('bi');
    cy.get('input[name="radio"]').check('1');
    cy.get('input[name="min"]').clear().type('11');
    cy.get('input[name="max"]').clear().type('19');
    cy.get('input[name="minDate"]').type('2019-08-01');
    cy.get('input[name="maxDate"]').type('2019-08-01');
    cy.get('input[name="checkbox"]').check();

    cy.get('p').should('have.length', 0);
    cy.get('#renderCount').contains('46');
  });

  it('should validate the form with onBlur mode', () => {
    cy.visit('http://localhost:3000/customResolverValidation/onBlur');

    cy.get('input[name="firstName"]').focus();
    cy.get('input[name="firstName"]').blur();
    cy.get('#customFormError').contains('Custom Error');
    cy.get('input[name="firstName"]').type('bill');

    cy.get('input[name="password"]').focus();
    cy.get('input[name="password"]').type('secret');
    cy.get('input[name="password"]').blur();
    cy.get('input[name="confirmPassword"]').focus();
    cy.get('input[name="confirmPassword"]').type('secrets');
    cy.get('input[name="confirmPassword"]').blur();
    cy.get('input[name="confirmPassword"] + p').contains(
      'confirmPassword error',
    );
    cy.get('input[name="password"]').focus();
    cy.get('input[name="password"]').type('s');
    cy.get('input[name="password"]').blur();
    cy.get('select[name="selectNumber"]').focus();
    cy.get('select[name="selectNumber"]').blur();
    cy.get('select[name="selectNumber"] + p').contains('selectNumber error');
    cy.get('select[name="selectNumber"]').select('1');
    cy.get('input[name="pattern"]').type('luo');
    cy.get('input[name="min"]').type('1');
    cy.get('input[name="max"]').type('21');
    cy.get('input[name="minDate"]').type('2019-07-30');
    cy.get('input[name="maxDate"]').type('2019-08-02');
    cy.get('input[name="lastName"]').clear().type('luo');
    cy.get('input[name="minLength"]').type('2');
    cy.get('input[name="minLength"]').blur();

    cy.get('input[name="minLength"] + p').contains('minLength error');
    cy.get('input[name="min"] + p').contains('min error');
    cy.get('input[name="max"] + p').contains('max error');
    cy.get('input[name="minDate"] + p').contains('minDate error');
    cy.get('input[name="maxDate"] + p').contains('maxDate error');

    cy.get('input[name="pattern"]').type('23');
    cy.get('input[name="minLength"]').type('bi');
    cy.get('input[name="minRequiredLength"]').type('bi');
    cy.get('input[name="radio"]').first().focus();
    cy.get('input[name="radio"]').first().blur();
    cy.get('input[name="radio"] + p').contains('radio error');
    cy.get('input[name="radio"]').check('1');
    cy.get('input[name="min"]').clear().type('11');
    cy.get('input[name="max"]').clear().type('19');
    cy.get('input[name="minDate"]').type('2019-08-01');
    cy.get('input[name="maxDate"]').type('2019-08-01');
    cy.get('input[name="checkbox"]').check();

    cy.get('p').should('have.length', 0);
    cy.get('#renderCount').contains('20');
  });

  it('should validate the form with onChange mode', () => {
    cy.visit('http://localhost:3000/customResolverValidation/onChange');

    cy.get('input[name="lastName"]').focus();
    cy.get('input[name="lastName"]').type('luo123456');
    cy.get('input[name="lastName"]').clear();
    cy.get('#customFormError').contains('Custom Error');
    cy.get('input[name="lastName"]').type('luo123456');

    cy.get('input[name="password"]').focus();
    cy.get('input[name="password"]').type('secret');
    cy.get('input[name="confirmPassword"]').focus();
    cy.get('input[name="confirmPassword"]').type('secrets');
    cy.get('input[name="confirmPassword"] + p').contains(
      'confirmPassword error',
    );
    cy.get('input[name="password"]').focus();
    cy.get('input[name="password"]').type('s');

    cy.get('select[name="selectNumber"]').select('');
    cy.get('select[name="selectNumber"] + p').contains('selectNumber error');
    cy.get('select[name="selectNumber"]').select('1');
    cy.get('input[name="pattern"]').type('luo');
    cy.get('input[name="min"]').type('1');
    cy.get('input[name="max"]').type('21');
    cy.get('input[name="minDate"]').type('2019-07-30');
    cy.get('input[name="maxDate"]').type('2019-08-02');
    cy.get('input[name="lastName"]').clear().type('luo');
    cy.get('input[name="minLength"]').type('2');

    cy.get('input[name="minLength"] + p').contains('minLength error');
    cy.get('input[name="min"] + p').contains('min error');
    cy.get('input[name="max"] + p').contains('max error');
    cy.get('input[name="minDate"] + p').contains('minDate error');
    cy.get('input[name="maxDate"] + p').contains('maxDate error');

    cy.get('input[name="pattern"]').type('23');
    cy.get('input[name="minLength"]').type('bi');
    cy.get('input[name="minRequiredLength"]').type('bi');
    cy.get('input[name="radio"]').first().focus();
    cy.get('input[name="radio"]').check('1');
    cy.get('input[name="min"]').clear().type('11');
    cy.get('input[name="max"]').clear().type('19');
    cy.get('input[name="minDate"]').type('2019-08-01');
    cy.get('input[name="maxDate"]').type('2019-08-01');
    cy.get('input[name="checkbox"]').check();

    cy.get('p').should('have.length', 0);
    cy.get('#renderCount').contains('43');
  });
});
