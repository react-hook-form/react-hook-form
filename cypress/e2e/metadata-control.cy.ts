describe('controllable isLoading state', () => {
  it('should return default value with watch', () => {
    cy.visit('http://localhost:3000/metadata-control');

    const def = {
      id: 1,
      name: 'Bob',
      is_admin: true,
    };

    const set = {
      id: 100,
      name: 'Alice',
      is_admin: false,
    };

    // check default value
    cy.get('#metadata').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal(def),
    );
    cy.get('button').contains('clear').click();
    // check clear doesnt change default value
    cy.get('#metadata').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal(def),
    );
    cy.get('button').contains('set').click();
    // check value is completely set
    cy.get('#metadata').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal(set),
    );
    cy.get('button').contains('clear').click();
    // check clear doesnt change default value
    cy.get('#metadata').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal(def),
    );
    cy.get('button').contains('update').click();
    // check value id is updated
    cy.get('#metadata').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({ ...def, id: 500 }),
    );
    cy.get('button').contains('clear').click();
    // check value cleared back to default
    cy.get('#metadata').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal(def),
    );
    cy.get('button').contains('update').click();
    // check default value is updated
    cy.get('#metadata').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({ ...def, id: 500 }),
    );
    cy.get('button').contains('set').click();
    // check value is completely set
    cy.get('#metadata').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal(set),
    );
    cy.get('button').contains('clear').click();
    // check value is cleared back to default
    cy.get('#metadata').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal(def),
    );
    cy.get('button').contains('set').click();
    // check value is completely set
    cy.get('#metadata').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal(set),
    );
    cy.get('button').contains('update').click();
    // check value id is updated
    cy.get('#metadata').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({ ...set, id: 500 }),
    );
    cy.get('button').contains('clear').click();
    // check value is cleared back to default
    cy.get('#metadata').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal(def),
    );
  });
});
