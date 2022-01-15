describe('form state with nested fields', () => {
  it('should return correct form state with onSubmit mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onSubmit');

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: false,
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: [],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test1"]').type('test');
    cy.get('input[name="left.test1"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1'],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1'],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test1"]').clear();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: false,
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1'],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test1"]').type('test');
    cy.get('input[name="left.test2"]').type('test');
    cy.get('input[name="left.test2"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1', 'left.test2'],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test2"]').clear();

    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1'],
        submitted: true,
        submitCount: 1,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test2"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1', 'left.test2'],
        submitted: true,
        submitCount: 2,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: true,
        valid: true,
      }),
    );
    cy.get('#renderCount').contains('13');
  });

  it('should return correct form state with onChange mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onChange');

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: false,
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: [],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test1"]').type('test');
    cy.get('input[name="left.test1"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1'],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1'],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test1"]').clear();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: false,
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1'],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test1"]').type('test');
    cy.get('input[name="left.test2"]').type('test');
    cy.get('input[name="left.test2"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1', 'left.test2'],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: false,
        valid: true,
      }),
    );

    cy.get('input[name="left.test2"]').clear();

    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1'],
        submitted: true,
        submitCount: 1,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test2"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1', 'left.test2'],
        submitted: true,
        submitCount: 2,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: true,
        valid: true,
      }),
    );
    cy.get('#renderCount').contains('13');
  });

  it('should return correct form state with onBlur mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onBlur');

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: false,
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: [],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test1"]').type('test');
    cy.get('input[name="left.test1"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1'],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1'],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test1"]').clear();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: false,
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1'],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test1"]').type('test');
    cy.get('input[name="left.test2"]').type('test');
    cy.get('input[name="left.test2"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1', 'left.test2'],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: false,
        valid: true,
      }),
    );

    cy.get('input[name="left.test2"]').clear();

    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1'],
        submitted: true,
        submitCount: 1,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test2"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1', 'left.test2'],
        submitted: true,
        submitCount: 2,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: true,
        valid: true,
      }),
    );
    cy.get('#renderCount').contains('13');
  });

  it('should reset dirty value when inputs reset back to default with onSubmit mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onSubmit');
    cy.get('input[name="left.test1"]').type('test');
    cy.get('input[name="left.test1"]').blur();
    cy.get('input[name="left.test2"]').type('test');
    cy.get('input[name="left.test2"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1', 'left.test2'],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test1"]').clear();
    cy.get('input[name="left.test2"]').clear();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: false,
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('#renderCount').contains('7');
  });

  it('should reset dirty value when inputs reset back to default with onBlur mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onBlur');
    cy.get('input[name="left.test1"]').type('test');
    cy.get('input[name="left.test1"]').blur();
    cy.get('input[name="left.test2"]').type('test');
    cy.get('input[name="left.test2"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1', 'left.test2'],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: false,
        valid: true,
      }),
    );

    cy.get('input[name="left.test1"]').clear();
    cy.get('input[name="left.test2"]').clear();
    cy.get('input[name="left.test2"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: false,
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );
    cy.get('#renderCount').contains('8');
  });

  it('should reset dirty value when inputs reset back to default with onChange mode', () => {
    cy.visit('http://localhost:3000/formStateWithNestedFields/onChange');
    cy.get('input[name="left.test1"]').type('test');
    cy.get('input[name="left.test1"]').blur();
    cy.get('input[name="left.test2"]').type('test');
    cy.get('input[name="left.test2"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: true,
        dirtyFields: ['left.test1', 'left.test2'],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: false,
        valid: true,
      }),
    );

    cy.get('#resetForm').click();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: false,
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: [],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="left.test1"]').type('test');
    cy.get('input[name="left.test1"]').blur();
    cy.get('input[name="left.test2"]').type('test');
    cy.get('input[name="left.test2"]').blur();

    cy.get('input[name="left.test1"]').clear();
    cy.get('input[name="left.test2"]').clear();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: false,
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: ['left.test1', 'left.test2'],
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('#renderCount').contains('13');
  });
});
