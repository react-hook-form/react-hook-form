describe('form state', () => {
  it('should return correct form state with onSubmit mode', () => {
    cy.visit('http://localhost:3000/formState/onSubmit');

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: [],
        dirty: false,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName'],
        submitted: false,
        submitCount: 0,
        touched: ['firstName'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: ['firstName'],
        dirty: false,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName', 'lastName'],
        submitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="lastName"]').clear();

    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName'],
        submitted: true,
        submitCount: 1,
        touched: ['firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="lastName"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName', 'lastName'],
        submitted: true,
        submitCount: 2,
        touched: ['firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: true,
        valid: true,
      }),
    );
    cy.get('#renderCount').contains('13');
  });

  it('should return correct form state with onChange mode', () => {
    cy.visit('http://localhost:3000/formState/onChange');

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: [],
        dirty: false,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName'],
        submitted: false,
        submitCount: 0,
        touched: ['firstName'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: ['firstName'],
        dirty: false,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName', 'lastName'],
        submitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: true,
      }),
    );

    cy.get('input[name="lastName"]').clear();

    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName'],
        submitted: true,
        submitCount: 1,
        touched: ['firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="lastName"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName', 'lastName'],
        submitted: true,
        submitCount: 2,
        touched: ['firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: true,
        valid: true,
      }),
    );
    cy.get('#renderCount').contains('13');
  });

  it('should return correct form state with onBlur mode', () => {
    cy.visit('http://localhost:3000/formState/onBlur');

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: [],
        dirty: false,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName'],
        submitted: false,
        submitCount: 0,
        touched: ['firstName'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: ['firstName'],
        dirty: false,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName', 'lastName'],
        submitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: true,
      }),
    );

    cy.get('input[name="lastName"]').clear();

    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName'],
        submitted: true,
        submitCount: 1,
        touched: ['firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="lastName"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName', 'lastName'],
        submitted: true,
        submitCount: 2,
        touched: ['firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: true,
        valid: true,
      }),
    );
    cy.get('#renderCount').contains('13');
  });

  it('should reset dirty value when inputs reset back to default with onSubmit mode', () => {
    cy.visit('http://localhost:3000/formState/onSubmit');
    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName', 'lastName'],
        submitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('input[name="lastName"]').clear();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        dirty: false,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('select[name="select"]').select('test1');
    cy.get('select[name="select"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['select'],
        submitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName', 'select'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );
    cy.get('select[name="select"]').select('');

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName', 'select'],
        dirty: false,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="checkbox"]').click();
    cy.get('input[name="checkbox"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['checkbox'],
        submitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName', 'select', 'checkbox'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="checkbox"]').uncheck();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName', 'select', 'checkbox'],
        dirty: false,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="checkbox-checked"]').uncheck();
    cy.get('input[name="checkbox-checked"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['checkbox-checked'],
        submitted: false,
        submitCount: 0,
        touched: [
          'firstName',
          'lastName',
          'select',
          'checkbox',
          'checkbox-checked',
        ],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );
    cy.get('input[name="checkbox-checked"]').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: [
          'firstName',
          'lastName',
          'select',
          'checkbox',
          'checkbox-checked',
        ],
        dirty: false,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="radio"]').click();
    cy.get('input[name="radio"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['radio'],
        submitted: false,
        submitCount: 0,
        touched: [
          'firstName',
          'lastName',
          'select',
          'checkbox',
          'checkbox-checked',
          'radio',
        ],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('select[name="select"]').select('');
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['radio'],
        submitted: false,
        submitCount: 0,
        touched: [
          'firstName',
          'lastName',
          'select',
          'checkbox',
          'checkbox-checked',
          'radio',
        ],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );
    cy.get('#renderCount').contains('18');
  });

  it('should reset dirty value when inputs reset back to default with onBlur mode', () => {
    cy.visit('http://localhost:3000/formState/onBlur');
    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName', 'lastName'],
        submitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: true,
      }),
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('input[name="lastName"]').clear();
    cy.get('input[name="lastName"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        dirty: false,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );
    cy.get('#renderCount').contains('8');
  });

  it('should reset dirty value when inputs reset back to default with onChange mode', () => {
    cy.visit('http://localhost:3000/formState/onChange');
    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: ['firstName', 'lastName'],
        submitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        dirty: true,
        submitting: false,
        submitSuccessful: false,
        valid: true,
      }),
    );

    cy.get('#resetForm').click();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: [],
        dirty: false,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();

    cy.get('input[name="firstName"]').clear();
    cy.get('input[name="lastName"]').clear();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirtyFields: [],
        submitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        dirty: false,
        submitting: false,
        submitSuccessful: false,
        valid: false,
      }),
    );

    cy.get('#renderCount').contains('13');
  });
});
