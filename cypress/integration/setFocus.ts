describe('form setFocus', () => {
  it('should focus input', () => {
    cy.visit('http://localhost:3000/setFocus');
    cy.get('button:contains("Focus Input")').click();
    cy.get('input[name="focusInput"]').should('be.focused');
  });
  it('should focus textarea', () => {
    cy.visit('http://localhost:3000/setFocus');
    cy.get('button:contains("Focus Textarea")').click();
    cy.get('textarea[name="focusTextarea"]').should('be.focused');
  });
