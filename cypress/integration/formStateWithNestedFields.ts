describe.skip('form state with nested fields', () => {
  it('should return correct form state with onSubmit mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onSubmit');

    cy.get('#state').contains(
      '{"dirtyFields":[],"isSubmitted":false,"submitCount":0,"touched":[],"isDirty":false,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.1"]').blur();
    cy.get('#state').contains(
      '{"dirtyFields":["left.1"],"isSubmitted":false,"submitCount":0,"touched":["left.1"],"isDirty":true,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.1"]').clear();
    cy.get('#state').contains(
      '{"dirtyFields":[],"isSubmitted":false,"submitCount":0,"touched":["left.1"],"isDirty":false,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.2"]').type('test');
    cy.get('input[name="left.2"]').blur();
    cy.get('#state').contains(
      '{"dirtyFields":["left.1","left.2"],"isSubmitted":false,"submitCount":0,"touched":["left.1","left.2"],"isDirty":true,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.2"]').clear();

    cy.get('#submit').click();
    cy.get('#state').contains(
      '{"dirtyFields":["left.1"],"isSubmitted":true,"submitCount":1,"touched":["left.1","left.2"],"isDirty":true,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.2"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').contains(
      '{"dirtyFields":["left.1","left.2"],"isSubmitted":true,"submitCount":2,"touched":["left.1","left.2"],"isDirty":true,"isSubmitting":false,"isValid":true}',
    );
    cy.get('#renderCount').contains('14');
  });

  it('should return correct form state with onChange mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onChange');

    cy.get('#state').contains(
      '{"dirtyFields":[],"isSubmitted":false,"submitCount":0,"touched":[],"isDirty":false,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.1"]').blur();
    cy.get('#state').contains(
      '{"dirtyFields":["left.1"],"isSubmitted":false,"submitCount":0,"touched":["left.1"],"isDirty":true,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.1"]').clear();
    cy.get('#state').contains(
      '{"dirtyFields":[],"isSubmitted":false,"submitCount":0,"touched":["left.1"],"isDirty":false,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.2"]').type('test');
    cy.get('input[name="left.2"]').blur();
    cy.get('#state').contains(
      '{"dirtyFields":["left.1","left.2"],"isSubmitted":false,"submitCount":0,"touched":["left.1","left.2"],"isDirty":true,"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="left.2"]').clear();

    cy.get('#submit').click();
    cy.get('#state').contains(
      '{"dirtyFields":["left.1"],"isSubmitted":true,"submitCount":1,"touched":["left.1","left.2"],"isDirty":true,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.2"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').contains(
      '{"dirtyFields":["left.1","left.2"],"isSubmitted":true,"submitCount":2,"touched":["left.1","left.2"],"isDirty":true,"isSubmitting":false,"isValid":true}',
    );
    cy.get('#renderCount').contains('15');
  });

  it('should return correct form state with onBlur mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onBlur');

    cy.get('#state').contains(
      '{"dirtyFields":[],"isSubmitted":false,"submitCount":0,"touched":[],"isDirty":false,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.1"]').blur();
    cy.get('#state').contains(
      '{"dirtyFields":["left.1"],"isSubmitted":false,"submitCount":0,"touched":["left.1"],"isDirty":true,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.1"]').clear();
    cy.get('#state').contains(
      '{"dirtyFields":[],"isSubmitted":false,"submitCount":0,"touched":["left.1"],"isDirty":false,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.2"]').type('test');
    cy.get('input[name="left.2"]').blur();
    cy.get('#state').contains(
      '{"dirtyFields":["left.1","left.2"],"isSubmitted":false,"submitCount":0,"touched":["left.1","left.2"],"isDirty":true,"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="left.2"]').clear();

    cy.get('#submit').click();
    cy.get('#state').contains(
      '{"dirtyFields":["left.1"],"isSubmitted":true,"submitCount":1,"touched":["left.1","left.2"],"isDirty":true,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.2"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').contains(
      '{"dirtyFields":["left.1","left.2"],"isSubmitted":true,"submitCount":2,"touched":["left.1","left.2"],"isDirty":true,"isSubmitting":false,"isValid":true}',
    );
    cy.get('#renderCount').contains('16');
  });

  it('should reset dirty value when inputs reset back to default with onSubmit mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onSubmit');
    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.1"]').blur();
    cy.get('input[name="left.2"]').type('test');
    cy.get('input[name="left.2"]').blur();

    cy.get('#state').contains(
      '{"dirtyFields":["left.1","left.2"],"isSubmitted":false,"submitCount":0,"touched":["left.1","left.2"],"isDirty":true,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.1"]').clear();
    cy.get('input[name="left.2"]').clear();

    cy.get('#state').contains(
      '{"dirtyFields":[],"isSubmitted":false,"submitCount":0,"touched":["left.1","left.2"],"isDirty":false,"isSubmitting":false,"isValid":false}',
    );

    cy.get('#renderCount').contains('7');
  });

  it('should reset dirty value when inputs reset back to default with onBlur mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onBlur');
    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.1"]').blur();
    cy.get('input[name="left.2"]').type('test');
    cy.get('input[name="left.2"]').blur();

    cy.get('#state').contains(
      '{"dirtyFields":["left.1","left.2"],"isSubmitted":false,"submitCount":0,"touched":["left.1","left.2"],"isDirty":true,"isSubmitting":false,"isValid":true}',
    );

    cy.get('input[name="left.1"]').clear();
    cy.get('input[name="left.2"]').clear();
    cy.get('input[name="left.2"]').blur();

    cy.get('#state').contains(
      '{"dirtyFields":[],"isSubmitted":false,"submitCount":0,"touched":["left.1","left.2"],"isDirty":false,"isSubmitting":false,"isValid":false}',
    );
    cy.get('#renderCount').contains('10');
  });

  it('should reset dirty value when inputs reset back to default with onChange mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onChange');
    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.1"]').blur();
    cy.get('input[name="left.2"]').type('test');
    cy.get('input[name="left.2"]').blur();

    cy.get('#state').contains(
      '{"dirtyFields":["left.1","left.2"],"isSubmitted":false,"submitCount":0,"touched":["left.1","left.2"],"isDirty":true,"isSubmitting":false,"isValid":true}',
    );

    cy.get('#resetForm').click();

    cy.get('#state').contains(
      '{"dirtyFields":[],"isSubmitted":false,"submitCount":0,"touched":[],"isDirty":false,"isSubmitting":false,"isValid":false}',
    );

    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.1"]').blur();
    cy.get('input[name="left.2"]').type('test');
    cy.get('input[name="left.2"]').blur();

    cy.get('input[name="left.1"]').clear();
    cy.get('input[name="left.2"]').clear();

    cy.get('#state').contains(
      '{"dirtyFields":[],"isSubmitted":false,"submitCount":0,"touched":["left.1","left.2"],"isDirty":false,"isSubmitting":false,"isValid":false}',
    );

    cy.get('#renderCount').contains('14');
  });
});
