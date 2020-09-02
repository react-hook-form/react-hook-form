describe('ConditionalField', () => {
  it('should reflect correct form state and data collection', () => {
    cy.visit('http://localhost:3000/conditionalField');
    cy.get('#state').should(($state) => {
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        isSubmitted: false,
        submitCount: 0,
        touched: [],
        isDirty: false,
        isSubmitting: false,
        isSuccessfullySubmitted: false,
        isValid: false,
      });
    });

    cy.get('select[name="selectNumber"]').select('1');
    cy.get('input[name="firstName"]').type('bill');
    cy.get('input[name="lastName"]').type('luo');
    cy.get('input[name="lastName"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['selectNumber', 'firstName', 'lastName'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['selectNumber', 'firstName', 'lastName'],
        isDirty: true,
        isSubmitting: false,
        isSuccessfullySubmitted: false,
        isValid: true,
      }),
    );
    cy.get('button#submit').click();
    cy.get('#result').contains(
      '{"selectNumber":"1","firstName":"bill","lastName":"luo"}',
    );
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['selectNumber', 'firstName', 'lastName'],
        isSubmitted: true,
        submitCount: 1,
        touched: ['selectNumber', 'firstName', 'lastName'],
        isDirty: true,
        isSubmitting: false,
        isSuccessfullySubmitted: true,
        isValid: true,
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
        dirtyFields: ['selectNumber'],
        isSubmitted: true,
        submitCount: 1,
        touched: ['selectNumber'],
        isDirty: true,
        isSubmitting: false,
        isSuccessfullySubmitted: true,
        isValid: false,
      }),
    );
    cy.get('input[name="min"]').type('10');
    cy.get('input[name="max"]').type('2');
    cy.get('input[name="max"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['selectNumber', 'min', 'max'],
        isSubmitted: true,
        submitCount: 1,
        touched: ['selectNumber', 'min', 'max'],
        isDirty: true,
        isSubmitting: false,
        isSuccessfullySubmitted: true,
        isValid: true,
      }),
    );
    cy.get('button#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['selectNumber', 'min', 'max'],
        isSubmitted: true,
        submitCount: 2,
        touched: ['selectNumber', 'min', 'max'],
        isDirty: true,
        isSubmitting: false,
        isSuccessfullySubmitted: true,
        isValid: true,
      }),
    );
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        selectNumber: '2',
        min: '10',
        max: '2',
      }),
    );

    cy.get('select[name="selectNumber"]').select('3');
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['selectNumber'],
        isSubmitted: true,
        submitCount: 2,
        touched: ['selectNumber'],
        isDirty: true,
        isSubmitting: false,
        isSuccessfullySubmitted: true,
        isValid: true,
      }),
    );

    cy.get('input[name="notRequired"]').type('test');
    cy.get('input[name="notRequired"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['selectNumber', 'notRequired'],
        isSubmitted: true,
        submitCount: 2,
        touched: ['selectNumber', 'notRequired'],
        isDirty: true,
        isSubmitting: false,
        isSuccessfullySubmitted: true,
        isValid: true,
      }),
    );

    cy.get('button#submit').click();
    cy.get('#result').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        selectNumber: '3',
        notRequired: 'test',
      }),
    );

    cy.get('#renderCount').contains('36');
  });
});
