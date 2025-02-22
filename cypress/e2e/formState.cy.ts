describe('form state', () => {
  it('should return correct form state with onSubmit mode', () => {
    cy.visit('http://localhost:3000/formState/onSubmit');

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: [],
        isSubmitted: false,
        submitCount: 0,
        touched: [],
        isDirty: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['firstName'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: [],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName'],
        isDirty: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['firstName', 'lastName'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: true,
      }),
    );

    cy.get('input[name="lastName"]').clear();

    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['firstName'],
        isSubmitted: true,
        submitCount: 1,
        touched: ['firstName', 'lastName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="lastName"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['firstName', 'lastName'],
        isSubmitted: true,
        submitCount: 2,
        touched: ['firstName', 'lastName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: true,
        isValid: true,
      }),
    );
    cy.get('#renderCount').contains('15');
  });

  it('should return correct form state with onChange mode', () => {
    cy.visit('http://localhost:3000/formState/onChange');

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: [],
        isSubmitted: false,
        submitCount: 0,
        touched: [],
        isDirty: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['firstName'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: [],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName'],
        isDirty: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['firstName', 'lastName'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: true,
      }),
    );

    cy.get('input[name="lastName"]').clear();

    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['firstName'],
        isSubmitted: true,
        submitCount: 1,
        touched: ['firstName', 'lastName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="lastName"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['firstName', 'lastName'],
        isSubmitted: true,
        submitCount: 2,
        touched: ['firstName', 'lastName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: true,
        isValid: true,
      }),
    );
    cy.get('#renderCount').contains('13');
  });

  it('should return correct form state with onBlur mode', () => {
    cy.visit('http://localhost:3000/formState/onBlur');

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: [],
        isSubmitted: false,
        submitCount: 0,
        touched: [],
        isDirty: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['firstName'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: [],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName'],
        isDirty: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['firstName', 'lastName'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: true,
      }),
    );

    cy.get('input[name="lastName"]').clear();

    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['firstName'],
        isSubmitted: true,
        submitCount: 1,
        touched: ['firstName', 'lastName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="lastName"]').type('test');
    cy.get('#submit').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['firstName', 'lastName'],
        isSubmitted: true,
        submitCount: 2,
        touched: ['firstName', 'lastName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: true,
        isValid: true,
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
        dirty: ['firstName', 'lastName'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: true,
      }),
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('input[name="lastName"]').clear();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: [],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        isDirty: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('select[name="select"]').select('test1');
    cy.get('select[name="select"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['select'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName', 'select'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );
    cy.get('select[name="select"]').select('');

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: [],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName', 'select'],
        isDirty: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="checkbox"]').click();
    cy.get('input[name="checkbox"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['checkbox'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName', 'select', 'checkbox'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="checkbox"]').uncheck();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: [],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName', 'select', 'checkbox'],
        isDirty: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="checkbox-checked"]').uncheck();
    cy.get('input[name="checkbox-checked"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['checkbox-checked'],
        isSubmitted: false,
        submitCount: 0,
        touched: [
          'firstName',
          'lastName',
          'select',
          'checkbox',
          'checkbox-checked',
        ],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );
    cy.get('input[name="checkbox-checked"]').click();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: [],
        isSubmitted: false,
        submitCount: 0,
        touched: [
          'firstName',
          'lastName',
          'select',
          'checkbox',
          'checkbox-checked',
        ],
        isDirty: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('input[name="radio"]').click();
    cy.get('input[name="radio"]').blur();
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['radio'],
        isSubmitted: false,
        submitCount: 0,
        touched: [
          'firstName',
          'lastName',
          'select',
          'checkbox',
          'checkbox-checked',
          'radio',
        ],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('select[name="select"]').select('');
    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['radio'],
        isSubmitted: false,
        submitCount: 0,
        touched: [
          'firstName',
          'lastName',
          'select',
          'checkbox',
          'checkbox-checked',
          'radio',
        ],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );
    cy.get('#renderCount').contains('20');
  });

  it('should reset dirty value when inputs reset back to default with onBlur mode', () => {
    cy.visit('http://localhost:3000/formState/onBlur');
    cy.get('input[name="firstName"]').type('test');
    cy.get('input[name="firstName"]').blur();
    cy.get('input[name="lastName"]').type('test');
    cy.get('input[name="lastName"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: ['firstName', 'lastName'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: true,
      }),
    );

    cy.get('input[name="firstName"]').clear();
    cy.get('input[name="lastName"]').clear();
    cy.get('input[name="lastName"]').blur();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: [],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        isDirty: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
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
        dirty: ['firstName', 'lastName'],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        isDirty: true,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: true,
      }),
    );

    cy.get('#resetForm').click();

    cy.get('#state').should(($state) =>
      expect(JSON.parse($state.text())).to.be.deep.equal({
        dirty: [],
        isSubmitted: false,
        submitCount: 0,
        touched: [],
        isDirty: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
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
        dirty: [],
        isSubmitted: false,
        submitCount: 0,
        touched: ['firstName', 'lastName'],
        isDirty: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        isValid: false,
      }),
    );

    cy.get('#renderCount').contains('13');
  });
});
