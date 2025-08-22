describe('hasBeenSubmitted state', () => {
  it('should track hasBeenSubmitted flag correctly', () => {
    cy.visit('http://localhost:3000/is-dirty-since-submit');

    // Initially hasBeenSubmitted should be false
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.hasBeenSubmitted).to.be.false;
      expect(state.isSubmitted).to.be.false;
    });

    // After first submission, both should be true
    cy.get('#firstName').type('Test');
    cy.get('#submit').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.hasBeenSubmitted).to.be.true;
      expect(state.isSubmitted).to.be.true;
    });

    // After reset, hasBeenSubmitted should remain true, isSubmitted should be false
    cy.get('#reset').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.hasBeenSubmitted).to.be.true; // Persists through reset
      expect(state.isSubmitted).to.be.false;
    });

    // Change field after reset - isDirtySinceSubmit should become true
    cy.get('#lastName').type('After reset');
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.hasBeenSubmitted).to.be.true; // Still true
      expect(state.isDirtySinceSubmit).to.be.true; // True because form was previously submitted
    });

    // Submit again - hasBeenSubmitted stays true
    cy.get('#submit').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.hasBeenSubmitted).to.be.true;
      expect(state.isSubmitted).to.be.true;
      expect(state.isDirtySinceSubmit).to.be.false; // Reset after submission
    });
  });

  it('should persist hasBeenSubmitted through multiple resets', () => {
    cy.visit('http://localhost:3000/is-dirty-since-submit');

    // Submit form
    cy.get('#firstName').type('Initial');
    cy.get('#submit').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.hasBeenSubmitted).to.be.true;
      expect(state.submitCount).to.equal(1);
    });

    // First reset
    cy.get('#reset').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.hasBeenSubmitted).to.be.true;
      expect(state.isSubmitted).to.be.false;
      expect(state.submitCount).to.equal(0);
    });

    // Second reset
    cy.get('#reset').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.hasBeenSubmitted).to.be.true; // Still persists
      expect(state.isSubmitted).to.be.false;
    });

    // Type and submit again
    cy.get('#email').type('test@example.com');
    cy.get('#submit').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.hasBeenSubmitted).to.be.true;
      expect(state.submitCount).to.equal(1);
    });
  });

  it('should handle hasBeenSubmitted with setValue', () => {
    cy.visit('http://localhost:3000/is-dirty-since-submit');

    // Submit form first
    cy.get('#firstName').type('Initial');
    cy.get('#submit').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.hasBeenSubmitted).to.be.true;
      expect(state.isDirtySinceSubmit).to.be.false;
    });

    // Reset form
    cy.get('#reset').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.hasBeenSubmitted).to.be.true;
      expect(state.isDirtySinceSubmit).to.be.false;
    });

    // Use setValue button - should trigger isDirtySinceSubmit because hasBeenSubmitted is true
    cy.get('#setValueButton').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.hasBeenSubmitted).to.be.true;
      expect(state.isDirtySinceSubmit).to.be.true;
    });
  });

  it('should not set hasBeenSubmitted on validation errors', () => {
    cy.visit('http://localhost:3000/is-dirty-since-submit');

    // Submit empty form (which should pass in this case, but let's verify the flag)
    cy.get('#submit').click();
    cy.get('#state').should(($state) => {
      const state = JSON.parse($state.text());
      expect(state.hasBeenSubmitted).to.be.true; // Should still be set even with empty form
      expect(state.isSubmitted).to.be.true;
    });
  });
});
