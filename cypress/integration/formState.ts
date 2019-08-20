context('form state', () => {
  it('should return correct form state with onSubmit mode', () => {
    cy.visit('http://localhost:3000/formState/onSubmit');

    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":[],"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":["firstName"],"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":["firstName"],"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="firstName"]').type('test');

    cy.get('input[name="lastName"]').type('test');
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="lastName"]').clear();

    cy.get('button').click();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":true,"submitCount":1,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="lastName"]').type('test');
    cy.get('button').click();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":true,"submitCount":2,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":true}',
    );
  });

  it('should return correct form state with onChange mode', () => {
    cy.visit('http://localhost:3000/formState/onChange');

    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":[],"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":["firstName"],"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":["firstName"],"isSubmitting":false,"isValid":false}',
    );
    cy.get('input[name="firstName"]').type('test');

    cy.get('input[name="lastName"]').type('test');
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="lastName"]').clear();

    cy.get('button').click();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":true,"submitCount":1,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="lastName"]').type('test');
    cy.get('button').click();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":true,"submitCount":2,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":true}',
    );
  });

  it('should return correct form state with onBlur mode', () => {
    cy.visit('http://localhost:3000/formState/onBlur');

    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":[],"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":["firstName"],"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":["firstName"],"isSubmitting":false,"isValid":false}',
    );
    cy.get('input[name="firstName"]').type('test');

    cy.get('input[name="lastName"]').type('test');
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="lastName"]').blur();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="lastName"]').clear();

    cy.get('button').click();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":true,"submitCount":1,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="lastName"]').type('test');
    cy.get('button').click();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":true,"submitCount":2,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":true}',
    );
  });

  it('should reset dirty value when inputs reset back to default with onSubmit mode', () => {
    cy.visit('http://localhost:3000/formState/onSubmit');
    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="lastName"]').type('test');

    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('input[name="lastName"]').clear();

    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":true}',
    );
  });

  it('should reset dirty value when inputs reset back to default with onBlur mode', () => {
    cy.visit('http://localhost:3000/formState/onSubmit');
    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="lastName"]').type('test');

    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('input[name="lastName"]').clear();

    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":true}',
    );
  });

  it('should reset dirty value when inputs reset back to default with onChange mode', () => {
    cy.visit('http://localhost:3000/formState/onSubmit');
    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="lastName"]').type('test');

    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('input[name="lastName"]').clear();

    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":["firstName","lastName"],"isSubmitting":false,"isValid":true}',
    );
  });
});
