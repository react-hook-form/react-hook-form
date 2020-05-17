context('useFieldArray', () => {
  it('should behaviour correctly without defaultValues', () => {
    cy.visit('http://localhost:3000/useFieldArray/normal');

    cy.get('#append').click();
    cy.get('ul > li').its('length').should('equal', 1);

    cy.get('#submit').click();
    cy.get('#result').contains('{"data":[{"name":"1"}]}');

    cy.get('#prepend').click();
    cy.get('ul > li').its('length').should('equal', 2);

    cy.get('ul > li').eq(0).get('input').should('have.value', '5');

    cy.get('#append').click();
    cy.get('ul > li').its('length').should('equal', 3);

    cy.get('ul > li').eq(2).find('input').should('have.value', '6');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"5"},{"name":"1"},{"name":"6"}]}',
    );

    cy.get('#swap').click();
    cy.get('ul > li').eq(1).find('input').should('have.value', '6');
    cy.get('ul > li').eq(2).find('input').should('have.value', '1');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"5"},{"name":"6"},{"name":"1"}]}',
    );

    cy.get('#move').click();
    cy.get('ul > li').eq(0).find('input').should('have.value', '1');
    cy.get('ul > li').eq(1).find('input').should('have.value', '5');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"1"},{"name":"5"},{"name":"6"}]}',
    );

    cy.get('#insert').click();
    cy.get('ul > li').eq(1).find('input').should('have.value', '18');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"1"},{"name":"18"},{"name":"5"},{"name":"6"}]}',
    );

    cy.get('#remove').click();
    cy.get('ul > li').eq(0).find('input').should('have.value', '1');
    cy.get('ul > li').eq(1).find('input').should('have.value', '5');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"1"},{"name":"5"},{"name":"6"}]}',
    );

    cy.get('#delete1').click();

    cy.get('ul > li').its('length').should('equal', 2);

    cy.get('ul > li').eq(0).find('input').should('have.value', '1');
    cy.get('ul > li').eq(1).find('input').should('have.value', '6');

    cy.get('#delete1').click();

    cy.get('ul > li').its('length').should('equal', 1);

    cy.get('ul > li').eq(0).find('input').should('have.value', '1');

    cy.get('#submit').click();
    cy.get('#result').contains('{"data":[{"name":"1"}]}');

    cy.get('#removeAll').click();
    cy.get('ul > li').should('have.length', 0);

    cy.get('#submit').click();
    cy.get('#result').contains('{}');

    cy.get('#renderCount').contains('34');
  });

  it('should behaviour correctly with defaultValue', () => {
    cy.visit('http://localhost:3000/useFieldArray/default');

    cy.get('ul > li').its('length').should('equal', 3);

    cy.get('ul > li').eq(0).find('input').should('have.value', 'test');

    cy.get('ul > li').eq(1).find('input').should('have.value', 'test1');

    cy.get('ul > li').eq(2).find('input').should('have.value', 'test2');

    cy.get('#append').click();

    cy.get('ul > li').eq(3).find('input').should('have.value', '1');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"test"},{"name":"test1"},{"name":"test2"},{"name":"1"}]}',
    );

    cy.get('#prepend').click();
    cy.get('ul > li').its('length').should('equal', 5);

    cy.get('ul > li').eq(0).get('input').should('have.value', '5');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"5"},{"name":"test"},{"name":"test1"},{"name":"test2"},{"name":"1"}]}',
    );

    cy.get('#swap').click();
    cy.get('ul > li').eq(1).find('input').should('have.value', 'test1');
    cy.get('ul > li').eq(2).find('input').should('have.value', 'test');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"5"},{"name":"test1"},{"name":"test"},{"name":"test2"},{"name":"1"}]}',
    );

    cy.get('#move').click();
    cy.get('ul > li').eq(0).find('input').should('have.value', 'test');
    cy.get('ul > li').eq(1).find('input').should('have.value', '5');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"test"},{"name":"5"},{"name":"test1"},{"name":"test2"},{"name":"1"}]}',
    );

    cy.get('#insert').click();
    cy.get('ul > li').eq(1).find('input').should('have.value', '17');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"test"},{"name":"17"},{"name":"5"},{"name":"test1"},{"name":"test2"},{"name":"1"}]}',
    );

    cy.get('#remove').click();
    cy.get('ul > li').eq(0).find('input').should('have.value', 'test');
    cy.get('ul > li').eq(1).find('input').should('have.value', '5');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"test"},{"name":"5"},{"name":"test1"},{"name":"test2"},{"name":"1"}]}',
    );

    cy.get('#delete2').click();

    cy.get('ul > li').its('length').should('equal', 4);

    cy.get('ul > li').eq(0).find('input').should('have.value', 'test');
    cy.get('ul > li').eq(1).find('input').should('have.value', '5');
    cy.get('ul > li').eq(2).find('input').should('have.value', 'test2');
    cy.get('ul > li').eq(3).find('input').should('have.value', '1');

    cy.get('#delete3').click();

    cy.get('ul > li').its('length').should('equal', 3);

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"test"},{"name":"5"},{"name":"test2"}]}',
    );

    cy.get('#removeAll').click();
    cy.get('ul > li').should('have.length', 0);

    cy.get('#submit').click();
    cy.get('#result').contains('{}');

    cy.get('#append').click();

    cy.get('ul > li').eq(0).find('input').should('have.value', '33');

    cy.get('#prepend').click();

    cy.get('ul > li').eq(0).find('input').should('have.value', '34');

    cy.get('#renderCount').contains('35');
  });

  it('should display the correct dirty value with defualt value', () => {
    cy.visit('http://localhost:3000/useFieldArray/default');
    cy.get('#dirty').contains('no');
    cy.get('#append').click();
    cy.get('#field1').type('test');
    cy.get('#prepend').click();
    cy.get('#delete2').click();
    cy.get('#dirtyFields').contains('{"data":[{"name":true},{"name":true}]}');
    cy.get('#delete2').click();
    cy.get('#dirtyFields').contains('{"data":[{"name":true},{"name":true}]}');
    cy.get('#delete1').click();
    cy.get('#dirtyFields').contains('{"data":[{"name":true}]}');
    cy.get('#delete1').click();
    cy.get('#dirtyFields').contains('{"data":[{"name":true}]}');
    cy.get('#delete0').click();
    cy.get('#dirtyFields').contains('[]');
    cy.get('#dirty').contains('yes');
  });

  it('should display the correct dirty value without default value', () => {
    cy.visit('http://localhost:3000/useFieldArray/normal');
    cy.get('#dirty').contains('no');
    cy.get('#append').click();
    cy.get('#dirty').contains('yes');
    cy.get('#field0').focus();
    cy.get('#field0').blur();
    cy.get('#dirtyFields').contains('{"data":[{"name":true}]}');
    cy.get('#dirty').contains('yes');
    cy.get('#field0').type('test');
    cy.get('#field0').blur();
    cy.get('#dirty').contains('yes');
    cy.get('#prepend').click();
    cy.get('#prepend').click();
    cy.get('#dirtyFields').contains(
      '{"data":[{"name":true},{"name":true},{"name":true}]}',
    );
    cy.get('#delete0').click();
    cy.get('#dirtyFields').contains('{"data":[{"name":true},{"name":true}]}');
    cy.get('#delete1').click();
    cy.get('#dirtyFields').contains('{"data":[{"name":true}]}');
    cy.get('#delete0').click();
    cy.get('#dirtyFields').contains('[]');
    cy.get('#dirty').contains('no');
  });

  it('should display the correct dirty value with default value', () => {
    cy.visit('http://localhost:3000/useFieldArray/default');
    cy.get('#dirty').contains('no');
    cy.get('#field0').focus();
    cy.get('#field0').blur();
    cy.get('#dirty').contains('no');
    cy.get('#field0').type('test');
    cy.get('#dirty').contains('yes');
    cy.get('#field0').blur();
    cy.get('#dirty').contains('yes');
    cy.get('#field0').focus();
    cy.get('#field0').blur();
    cy.get('#dirty').contains('yes');
    cy.get('#field0').clear();
    cy.get('#field0').type('test');
    cy.get('#dirty').contains('no');
    cy.get('#delete1').click();
    cy.get('#dirty').contains('yes');
    cy.get('#append').click();
    cy.get('#field0').clear().type('test');
    cy.get('#field1').clear().type('test1');
    cy.get('#field2').clear().type('test2');
    cy.get('#dirty').contains('no');
  });

  it('should display the correct dirty value with async default value', () => {
    cy.visit('http://localhost:3000/useFieldArray/asyncReset');
    cy.get('#dirty').contains('no');
    cy.get('#field0').focus();
    cy.get('#field0').blur();
    cy.get('#dirty').contains('no');
    cy.get('#field0').type('test');
    cy.get('#dirty').contains('yes');
    cy.get('#field0').blur();
    cy.get('#dirty').contains('yes');
    cy.get('#field0').focus();
    cy.get('#field0').blur();
    cy.get('#dirty').contains('yes');
    cy.get('#field0').clear();
    cy.get('#field0').type('test');
    cy.get('#dirty').contains('no');
    cy.get('#delete1').click();
    cy.get('#dirty').contains('yes');
    cy.get('#append').click();
    cy.get('#field0').clear().type('test');
    cy.get('#field1').clear().type('test1');
    cy.get('#field2').clear().type('test2');
    cy.get('#dirty').contains('no');
  });

  it('should display correct error with the inputs', () => {
    cy.visit('http://localhost:3000/useFieldArray/default');
    cy.get('#prepend').click();
    cy.get('#field1').clear();
    cy.get('#field2').clear();
    cy.get('#field3').clear();
    cy.get('#append').click();
    cy.get('#submit').click();
    cy.get('#error1').contains('This is required');
    cy.get('#error2').contains('This is required');
    cy.get('#error3').contains('This is required');
    cy.get('#field1').type('test');
    cy.get('#error1').should('not.exist');
    cy.get('#error2').contains('This is required');
    cy.get('#error3').contains('This is required');
    cy.get('#move').click();
    cy.get('#error0').contains('This is required');
    cy.get('#error2').should('not.exist');
    cy.get('#prepend').click();
    cy.get('#error0').should('not.exist');
    cy.get('#error1').contains('This is required');
  });

  it('should return correct touched values', () => {
    cy.visit('http://localhost:3000/useFieldArray/default');
    cy.get('#field0').type('1');
    cy.get('#field1').type('1');
    cy.get('#field2').type('1');
    cy.get('#touched').contains('[{"name":true},{"name":true}]');
    cy.get('#append').click();
    cy.get('#prepend').click();
    cy.get('#touched').contains(
      '[null,{"name":true},{"name":true},{"name":true}]',
    );
    cy.get('#insert').click();
    cy.get('#touched').contains(
      '[null,null,{"name":true},{"name":true},{"name":true}]',
    );
    cy.get('#swap').click();
    cy.get('#touched').contains(
      '[null,{"name":true},null,{"name":true},{"name":true}]',
    );
    cy.get('#move').click();
    cy.get('#touched').contains(
      '[null,null,{"name":true},{"name":true},{"name":true}]',
    );
    cy.get('#insert').click();
    cy.get('#touched').contains(
      '[null,null,null,{"name":true},{"name":true},{"name":true}]',
    );
    cy.get('#delete4').click();
    cy.get('#touched').contains('[null,null,null,{"name":true},{"name":true}]');
  });

  it('should return correct isValid formState', () => {
    cy.visit('http://localhost:3000/useFieldArray/formState');
    cy.get('#isValid').get('#isValid').contains('yes');
    cy.get('#append').click();
    cy.get('#append').click();
    cy.get('#append').click();

    cy.get('#isValid').get('#isValid').contains('yes');

    cy.get('#field0').clear();

    cy.get('#isValid').get('#isValid').contains('no');

    cy.get('#delete0').click();
    cy.get('#field1').type('1');

    cy.get('#isValid').get('#isValid').contains('yes');

    cy.get('#field0').clear();

    cy.get('#isValid').get('#isValid').contains('no');

    cy.get('#delete0').click();

    cy.get('#isValid').get('#isValid').contains('yes');

    cy.get('#append').click();
    cy.get('#field0').clear();

    cy.get('#isValid').get('#isValid').contains('no');

    cy.get('#delete0').click();

    cy.get('#isValid').get('#isValid').contains('yes');

    cy.get('#append').click();
    cy.get('#append').click();

    cy.get('#field1').clear();
    cy.get('#field2').clear();

    cy.get('#isValid').get('#isValid').contains('no');

    cy.get('#delete1').click();
    cy.get('#delete1').click();

    cy.get('#isValid').get('#isValid').contains('yes');
  });
});
