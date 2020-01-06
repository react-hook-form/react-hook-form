context('useFieldArray', () => {
  it('should behaviour correctly without defaultValues', () => {
    cy.visit('http://localhost:3000/useFieldArray/normal');

    cy.get('#append').click();
    cy.get('ul > li')
      .its('length')
      .should('equal', 1);

    cy.get('#prepend').click();
    cy.get('ul > li')
      .its('length')
      .should('equal', 2);

    cy.get('ul > li')
      .eq(0)
      .get('input')
      .should('have.value', '3');

    cy.get('#append').click();
    cy.get('ul > li')
      .its('length')
      .should('equal', 3);

    cy.get('ul > li')
      .eq(2)
      .find('input')
      .should('have.value', '5');

    cy.get('#swap').click();
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', '5');
    cy.get('ul > li')
      .eq(2)
      .find('input')
      .should('have.value', '1');

    cy.get('#move').click();
    cy.get('ul > li')
      .eq(0)
      .find('input')
      .should('have.value', '1');
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', '3');

    cy.get('#insert').click();
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', '11');

    cy.get('#remove').click();
    cy.get('ul > li')
      .eq(0)
      .find('input')
      .should('have.value', '1');
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', '3');

    cy.get('#removeAll').click();
    cy.get('ul > li').should('have.length', 0);

    cy.get('#renderCount').contains('17');
  });

  it.only('should behaviour correctly with defaultValue', () => {
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

    cy.get('#prepend').click();
    cy.get('ul > li')
      .its('length')
      .should('equal', 5);

    cy.get('ul > li')
      .eq(0)
      .get('input')
      .should('have.value', '3');

    cy.get('#swap').click();
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', 'test1');
    cy.get('ul > li')
      .eq(2)
      .find('input')
      .should('have.value', 'test');

    cy.get('#move').click();
    cy.get('ul > li')
      .eq(0)
      .find('input')
      .should('have.value', 'test');
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', '3');

    cy.get('#insert').click();
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', '9');

    cy.get('#remove').click();
    cy.get('ul > li')
      .eq(0)
      .find('input')
      .should('have.value', 'test');
    cy.get('ul > li')
      .eq(1)
      .find('input')
      .should('have.value', '3');

    cy.get('#removeAll').click();
    cy.get('ul > li').should('have.length', 0);

    cy.get('#renderCount').contains('15');
  });
});
