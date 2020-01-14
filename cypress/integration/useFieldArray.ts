context('useFieldArray', () => {
  it('should behaviour correctly without defaultValues', () => {
    cy.visit('http://localhost:3000/useFieldArray/normal');

    cy.get('#append').click();
    cy.get('ul > li')
      .its('length')
      .should('equal', 1);

    cy.get('#submit').click();
    cy.get('#result').contains('{"data":[{"name":"1"}]}');

    cy.get('#prepend').click();
    cy.get('ul > li')
      .its('length')
      .should('equal', 2);

    cy.get('ul > li')
      .eq(0)
      .get('input')
      .should('have.value', '4');

    cy.get('#append').click();
    cy.get('ul > li')
      .its('length')
      .should('equal', 3);

    cy.get('ul > li')
      .eq(2)
      .find('input')
      .should('have.value', '5');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"4"},{"name":"1"},{"name":"5"}]}',
    );

    cy.get('#swap').click();
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', '5');
    cy.get('ul > li')
      .eq(2)
      .find('input')
      .should('have.value', '1');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"4"},{"name":"5"},{"name":"1"}]}',
    );

    cy.get('#move').click();
    cy.get('ul > li')
      .eq(0)
      .find('input')
      .should('have.value', '1');
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', '4');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"1"},{"name":"4"},{"name":"5"}]}',
    );

    cy.get('#insert').click();
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', '14');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"1"},{"name":"14"},{"name":"4"},{"name":"5"}]}',
    );

    cy.get('#remove').click();
    cy.get('ul > li')
      .eq(0)
      .find('input')
      .should('have.value', '1');
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', '4');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"1"},{"name":"4"},{"name":"5"}]}',
    );

    cy.get('#removeAll').click();
    cy.get('ul > li').should('have.length', 0);

    cy.get('#submit').click();
    cy.get('#result').contains('{}');

    cy.get('#renderCount').contains('23');
  });

  it('should behaviour correctly with defaultValue', () => {
    cy.visit('http://localhost:3000/useFieldArray/default');

    cy.get('ul > li')
      .its('length')
      .should('equal', 3);

    cy.get('ul > li')
      .eq(0)
      .find('input')
      .should('have.value', 'test');

    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', 'test1');

    cy.get('ul > li')
      .eq(2)
      .find('input')
      .should('have.value', 'test2');

    cy.get('#append').click();

    cy.get('ul > li')
      .eq(3)
      .find('input')
      .should('have.value', '1');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"test"},{"name":"test1"},{"name":"test2"},{"name":"1"}]}',
    );

    cy.get('#prepend').click();
    cy.get('ul > li')
      .its('length')
      .should('equal', 5);

    cy.get('ul > li')
      .eq(0)
      .get('input')
      .should('have.value', '4');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"4"},{"name":"test"},{"name":"test1"},{"name":"test2"},{"name":"1"}]}',
    );

    cy.get('#swap').click();
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', 'test1');
    cy.get('ul > li')
      .eq(2)
      .find('input')
      .should('have.value', 'test');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"4"},{"name":"test1"},{"name":"test"},{"name":"test2"},{"name":"1"}]}',
    );

    cy.get('#move').click();
    cy.get('ul > li')
      .eq(0)
      .find('input')
      .should('have.value', 'test');
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', '4');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"test"},{"name":"4"},{"name":"test1"},{"name":"test2"},{"name":"1"}]}',
    );

    cy.get('#insert').click();
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', '13');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"test"},{"name":"13"},{"name":"4"},{"name":"test1"},{"name":"test2"},{"name":"1"}]}',
    );

    cy.get('#remove').click();
    cy.get('ul > li')
      .eq(0)
      .find('input')
      .should('have.value', 'test');
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', '4');

    cy.get('#submit').click();
    cy.get('#result').contains(
      '{"data":[{"name":"test"},{"name":"4"},{"name":"test1"},{"name":"test2"},{"name":"1"}]}',
    );

    cy.get('#removeAll').click();
    cy.get('ul > li').should('have.length', 0);

    cy.get('#submit').click();
    cy.get('#result').contains('{}');

    cy.get('#renderCount').contains('22');
  });
});
