describe('dirty since last submit', () => {
  it('should track isDirtySinceSubmit correctly', () => {
    cy.visit('http://localhost:3000/is-dirty-since-submit');

    // Initial state - should be false
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.false;
      expect(state.isSubmitted).to.be.false;
      expect(state.submitCount).to.equal(0);
    });

    // Type in first field - should still be false (not submitted yet)
    cy.get('#firstName').type('John');
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.false;
      expect(state.isDirty).to.be.true;
      expect(state.isSubmitted).to.be.false;
    });

    // Submit form - isDirtySinceSubmit should be false
    cy.get('#submit').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.false;
      expect(state.isSubmitted).to.be.true;
      expect(state.submitCount).to.equal(1);
    });

    // Type in second field after submit - should be true
    cy.get('#lastName').type('Doe');
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.true;
      expect(state.isSubmitted).to.be.true;
    });

    // Submit again - should reset to false
    cy.get('#submit').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.false;
      expect(state.submitCount).to.equal(2);
    });

    // Use setValue button after submit - should be true
    cy.get('#setValueButton').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.true;
    });

    // Reset form - should reset to false
    cy.get('#reset').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.false;
      expect(state.isSubmitted).to.be.false;
      expect(state.submitCount).to.equal(0);
      expect(state.isDirty).to.be.false;
    });
  });

  it('should handle validation errors correctly', () => {
    cy.visit('http://localhost:3000/is-dirty-since-submit');

    // Submit empty form (assuming validation would fail in real scenario)
    cy.get('#submit').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.false;
      expect(state.isSubmitted).to.be.true;
    });

    // Fix validation by typing - should be true
    cy.get('#email').type('test@example.com');
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.true;
    });
  });

  it('should not set isDirtySinceSubmit on focus/blur without value changes', () => {
    cy.visit('http://localhost:3000/is-dirty-since-submit');

    // Submit form first with a value
    cy.get('#firstName').type('Test');
    cy.get('#submit').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isSubmitted).to.be.true;
      expect(state.isDirtySinceSubmit).to.be.false;
    });

    // Focus and blur an empty field without changing value
    cy.get('#lastName').focus();
    cy.get('#lastName').blur();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.false;
    });

    // Focus field with existing value and blur without changes
    cy.get('#firstName').focus();
    cy.get('#firstName').blur();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.false;
    });

    // Now actually change a value
    cy.get('#lastName').type('Changed');
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.true;
    });
  });

  it('should track multiple field changes', () => {
    cy.visit('http://localhost:3000/is-dirty-since-submit');

    // Submit initial form
    cy.get('#firstName').type('Initial');
    cy.get('#submit').click();

    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.false;
    });

    // Change multiple fields
    cy.get('#lastName').type('Last');
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.true;
      expect(state.dirtyFields).to.include('lastName');
    });

    cy.get('#email').type('email@test.com');
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.true;
      expect(state.dirtyFields).to.include('email');
    });

    // Submit again to reset
    cy.get('#submit').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.false;
      expect(state.submitCount).to.equal(2);
    });
  });

  it('should set isDirtySinceSubmit to true when field changes after submission and reset', () => {
    cy.visit('http://localhost:3000/is-dirty-since-submit');

    // Submit form first
    cy.get('#firstName').type('Initial');
    cy.get('#submit').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.false;
      expect(state.isSubmitted).to.be.true;
    });

    // Reset form
    cy.get('#reset').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.false;
      expect(state.isSubmitted).to.be.false;
    });

    // Change field after reset
    cy.get('#lastName').type('Updated after reset');
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.isDirtySinceSubmit).to.be.true;
    });
  });
});
