describe('form state with nested fields', () => {
  it('should return correct form state with onSubmit mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onSubmit');

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: false,
        dirtyFields: [],
        isSubmitted: false,
        submitCount: 0,
        touched: [],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.1"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.1"]').clear();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: false,
        dirtyFields: [],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.2"]').type('test');
    cy.get('input[name="left.2"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1', 'left.2'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.2"]').clear();

    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1'],
        isSubmitted: true,
        submitCount: 1,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.2"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1', 'left.2'],
        isSubmitted: true,
        submitCount: 2,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: true,
        isValid: true,
      }),
    );
    cy.get('#renderCount').contains('14');
  });

  it('should return correct form state with onChange mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onChange');

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: false,
        dirtyFields: [],
        isSubmitted: false,
        submitCount: 0,
        touched: [],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.1"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.1"]').clear();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: false,
        dirtyFields: [],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.2"]').type('test');
    cy.get('input[name="left.2"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1', 'left.2'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: true,
      }),
    );

    cy.get('input[name="left.2"]').clear();

    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1'],
        isSubmitted: true,
        submitCount: 1,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.2"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1', 'left.2'],
        isSubmitted: true,
        submitCount: 2,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: true,
        isValid: true,
      }),
    );
    cy.get('#renderCount').contains('17');
  });

  it('should return correct form state with onBlur mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onBlur');

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: false,
        dirtyFields: [],
        isSubmitted: false,
        submitCount: 0,
        touched: [],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.1"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.1"]').clear();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: false,
        dirtyFields: [],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.2"]').type('test');
    cy.get('input[name="left.2"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1', 'left.2'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: true,
      }),
    );

    cy.get('input[name="left.2"]').clear();

    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1'],
        isSubmitted: true,
        submitCount: 1,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.2"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1', 'left.2'],
        isSubmitted: true,
        submitCount: 2,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: true,
        isValid: true,
      }),
    );
    cy.get('#renderCount').contains('18');
  });

  it('should reset dirty value when inputs reset back to default with onSubmit mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onSubmit');
    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.1"]').blur();
    cy.get('input[name="left.2"]').type('test');
    cy.get('input[name="left.2"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1', 'left.2'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.1"]').clear();
    cy.get('input[name="left.2"]').clear();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: false,
        dirtyFields: [],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('#renderCount').contains('7');
  });

  it('should reset dirty value when inputs reset back to default with onBlur mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onBlur');
    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.1"]').blur();
    cy.get('input[name="left.2"]').type('test');
    cy.get('input[name="left.2"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1', 'left.2'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: true,
      }),
    );

    cy.get('input[name="left.1"]').clear();
    cy.get('input[name="left.2"]').clear();
    cy.get('input[name="left.2"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: false,
        dirtyFields: [],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );
    cy.get('#renderCount').contains('12');
  });

  it('should reset dirty value when inputs reset back to default with onChange mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onChange');
    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.1"]').blur();
    cy.get('input[name="left.2"]').type('test');
    cy.get('input[name="left.2"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: true,
        dirtyFields: ['left.1', 'left.2'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: true,
      }),
    );

    cy.get('#resetForm').click();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: false,
        dirtyFields: [],
        isSubmitted: false,
        submitCount: 0,
        touched: [],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="left.1"]').type('test');
    cy.get('input[name="left.1"]').blur();
    cy.get('input[name="left.2"]').type('test');
    cy.get('input[name="left.2"]').blur();

    cy.get('input[name="left.1"]').clear();
    cy.get('input[name="left.2"]').clear();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        isDirty: false,
        dirtyFields: [],
        isSubmitted: false,
        submitCount: 0,
        touched: ['left.1', 'left.2'],
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('#renderCount').contains('18');
  });
});
