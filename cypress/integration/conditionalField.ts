describe('ConditionalField', () => {
  it('should reflect correct form state and data collection', () => {
    cy.visit('http://localhost:3000/conditionalField');
    cy.get('#state').should(($state) => {
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: [],
        dirty: false,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      });
    });

    cy.get('select[name="selectNumber"]').select('1');
    cy.get('input[name="firstName"]').type('bill');
    cy.get('input[name="lastName"]').type('luo');
    cy.get('input[name="lastName"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['selectNumber', 'firstName', 'lastName'],
        submitted: false,
        submitCount: 0,
        touched: ['selectNumber', 'firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: true,
      }),
    );
    cy.get('button#submit').click();
    cy.get('#result').contains(
      '{"selectNumber":"1","firstName":"bill","lastName":"luo"}',
    );
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['selectNumber', 'firstName', 'lastName'],
        submitted: true,
        submitCount: 1,
        touched: ['selectNumber', 'firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: true,
        valid: true,
      }),
    );
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        selectNumber: '1',
        firstName: 'bill',
        lastName: 'luo',
      }),
    );

    cy.get('select[name="selectNumber"]').select('2');
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['selectNumber', 'firstName', 'lastName'],
        submitted: true,
        submitCount: 1,
        touched: ['selectNumber', 'firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: true,
        valid: false,
      }),
    );
    cy.get('input[name="min"]').type('10');
    cy.get('input[name="max"]').type('2');
    cy.get('input[name="max"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
        submitted: true,
        submitCount: 1,
        touched: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
        dirty: true,
        submitting: false,
        submitSuccessful: true,
        valid: true,
      }),
    );
    cy.get('button#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
        submitted: true,
        submitCount: 2,
        touched: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
        dirty: true,
        submitting: false,
        submitSuccessful: true,
        valid: true,
      }),
    );
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        selectNumber: '2',
        firstName: 'bill',
        lastName: 'luo',
        min: '10',
        max: '2',
      }),
    );

    cy.get('select[name="selectNumber"]').select('3');
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
        submitted: true,
        submitCount: 2,
        touched: ['selectNumber', 'firstName', 'lastName', 'min', 'max'],
        dirty: true,
        submitting: false,
        submitSuccessful: true,
        valid: true,
      }),
    );

    cy.get('input[name="notRequired"]').type('test');
    cy.get('input[name="notRequired"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [
          'selectNumber',
          'firstName',
          'lastName',
          'min',
          'max',
          'notRequired',
        ],
        submitted: true,
        submitCount: 2,
        touched: [
          'selectNumber',
          'firstName',
          'lastName',
          'min',
          'max',
          'notRequired',
        ],
        dirty: true,
        submitting: false,
        submitSuccessful: true,
        valid: true,
      }),
    );

    cy.get('button#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        selectNumber: '3',
        firstName: 'bill',
        lastName: 'luo',
        min: '10',
        max: '2',
        notRequired: 'test',
      }),
    );

    cy.get('#renderCount').contains('24');
  });
});
