describe('useFieldArrayWithExternalRHForm', () => {
  it('should behaviour correctly with external RHForm', () => {
    cy.visit('http://localhost:3000/useFieldArrayWithExternalRHForm');

    cy.get('#append_input').type('1');
    cy.get('#append').click();
    cy.get('#append_input').type('2');
    cy.get('#append').click();
    cy.get('#append_input').type('3');
    cy.get('#append').click();

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [{ name: '1' }, { name: '2' }, { name: '3' }],
      }),
    );

    cy.get('#prepend_input').type('4');
    cy.get('#prepend').click();
    cy.get('#prepend_input').type('5');
    cy.get('#prepend').click();
    cy.get('#prepend_input').type('6');
    cy.get('#prepend').click();

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: '6' },
          { name: '5' },
          { name: '4' },
          { name: '1' },
          { name: '2' },
          { name: '3' },
        ],
      }),
    );

    cy.get('#insert_input').type('7');
    cy.get('#insert').click();
    cy.get('#insert_input').type('8');
    cy.get('#insert').click();
    cy.get('#insert_input').type('9');
    cy.get('#insert').click();

    cy.get('#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        data: [
          { name: '9' },
          { name: '8' },
          { name: '7' },
          { name: '6' },
          { name: '5' },
          { name: '4' },
          { name: '1' },
          { name: '2' },
          { name: '3' },
        ],
      }),
    );

    cy.get('#update_input').type('changed');
    cy.get('#update').click();
    cy.get('ul > li').eq(0).get('input').should('have.value', 'changed');

    cy.get('#update_input').type('9');
    cy.get('#update').click();
    cy.get('ul > li').eq(0).get('input').should('have.value', '9');

    cy.get('#submit').click();

    cy.get('#renderCount').contains('45');
  });
});
