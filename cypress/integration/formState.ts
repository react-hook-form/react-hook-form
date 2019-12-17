context('form state', () => {
  it.only('should return correct form state with onSubmit mode', () => {
    cy.visit('http://localhost:3000/formState/onSubmit');

    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );
    cy.get('#touched').contains('firstName ');

    cy.get('input[name="firstName"]').clear();
    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );
    cy.get('#touched').contains('firstName lastName ');

    cy.get('input[name="lastName"]').clear();

    cy.get('#submit').click();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":true,"submitCount":1,"touched":{},"isSubmitting":false,"isValid":false}',
    );
    cy.get('#touched').contains('firstName lastName ');

    cy.get('input[name="lastName"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":true,"submitCount":2,"touched":{},"isSubmitting":false,"isValid":true}',
    );
    cy.get('#renderCount').contains('13');
  });

  it('should return correct form state with onChange mode', () => {
    cy.visit('http://localhost:3000/formState/onChange');

    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="lastName"]').clear();

    cy.get('#submit').click();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":true,"submitCount":1,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="lastName"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":true,"submitCount":2,"touched":{},"isSubmitting":false,"isValid":true}',
    );
    cy.get('#renderCount').contains('14');
  });

  it('should return correct form state with onBlur mode', () => {
    cy.visit('http://localhost:3000/formState/onBlur');

    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="lastName"]').clear();

    cy.get('#submit').click();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":true,"submitCount":1,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="lastName"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":true,"submitCount":2,"touched":{},"isSubmitting":false,"isValid":true}',
    );
    cy.get('#renderCount').contains('15');
  });

  it('should reset dirty value when inputs reset back to default with onSubmit mode', () => {
    cy.visit('http://localhost:3000/formState/onSubmit');
    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();

    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('input[name="lastName"]').clear();

    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('select[name="select"]').select('test1');
    cy.get('select[name="select"]').blur();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );
    cy.get('select[name="select"]').select('test');
    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="checkbox"]').check('on');
    cy.get('input[name="checkbox"]').blur();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );
    cy.get('input[name="checkbox"]').uncheck();
    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="checkbox-checked"]').uncheck();
    cy.get('input[name="checkbox-checked"]').blur();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );
    cy.get('input[name="checkbox-checked"]').check();
    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="radio"]').check();
    cy.get('input[name="radio"]').blur();
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('select[name="select"]').select('test');
    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );
    cy.get('#renderCount').contains('18');
  });

  it('should reset dirty value when inputs reset back to default with onBlur mode', () => {
    cy.visit('http://localhost:3000/formState/onBlur');
    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();

    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('input[name="lastName"]').clear();
    cy.get('input[name="lastName"]').blur();

    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );
    cy.get('#renderCount').contains('10');
  });

  it('should reset dirty value when inputs reset back to default with onChange mode', () => {
    cy.visit('http://localhost:3000/formState/onChange');
    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();

    cy.get('#state').contains(
      '{"dirty":true,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":true}',
    );

    cy.get('#resetForm').click();

    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();

    cy.get('input[name="firstName"]').clear();
    cy.get('input[name="lastName"]').clear();

    cy.get('#state').contains(
      '{"dirty":false,"isSubmitted":false,"submitCount":0,"touched":{},"isSubmitting":false,"isValid":false}',
    );

    cy.get('#renderCount').contains('14');
  });
});
