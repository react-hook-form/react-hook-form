context.only('transform & trim', () => {
  it('trim and transform should be applied', () => {
    cy.visit('http://localhost:3000/transform');
    cy.get('input[name="firstName"]').type('  foo ');
    cy.get('input[name="lastName"]').type(' bar  ');
    cy.get('#watchAll').should(
      'contain',
      '{"firstName":"Foo","lastName":"BAR"}',
    );
  });
  it('trim and transform should be called before validation', () => {
    cy.visit('http://localhost:3000/transform');
    cy.get('input[name="firstName"]').type('   ');
    cy.get('input[name="lastName"]').type('   ');
    cy.get('button#submit').click();
    cy.get('input[name="firstName"] + p').contains('firstName error');
    cy.get('input[name="lastName"] + p').contains('lastName error');
  });
});
