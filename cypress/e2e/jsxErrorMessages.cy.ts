describe('JSX Error Messages', () => {
  it('should render JSX error messages correctly', () => {
    cy.visit('/jsx-error-messages');

    // Test that all form fields are rendered
    cy.get('input[id="username"]').should('exist');
    cy.get('input[id="email"]').should('exist');
    cy.get('input[id="password"]').should('exist');
    cy.get('input[id="confirmPassword"]').should('exist');
  });

  it('should display JSX error messages for required fields', () => {
    cy.visit('/jsx-error-messages');

    // Submit form to trigger required field validations
    cy.get('button[type="submit"]').click();

    // Check that JSX error messages are rendered with HTML elements
    cy.contains('Username is required').should('be.visible');
    cy.get('strong').contains('Username is required').should('exist');

    cy.contains('Email address is required').should('be.visible');
    cy.contains('📬').should('exist'); // Emoji in error message

    cy.contains('Password is required for account security').should(
      'be.visible',
    );
    cy.contains('🔒').should('exist'); // Emoji in error message
  });

  it('should show custom JSX error when trigger button is clicked', () => {
    cy.visit('/jsx-error-messages');

    // Click the custom error trigger button
    cy.contains('Trigger Custom JSX Error').click();

    // Check that custom JSX error is displayed
    cy.contains('🚨 Custom JSX Error!').should('be.visible');
    cy.contains('This username is already taken').should('be.visible');

    // Check that the error contains a list with suggestions
    cy.get('ul').should('contain', 'user123');
    cy.get('ul').should('contain', 'cooluser2024');
    cy.get('ul').should('contain', 'myawesomename');
  });

  it('should display rich email validation errors', () => {
    cy.visit('/jsx-error-messages');

    // Enter invalid email
    cy.get('input[id="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();

    // Check that email validation JSX error is shown
    cy.contains('📧 Please enter a valid email address').should('be.visible');
    cy.contains('Example: user@example.com').should('be.visible');
  });

  it('should show password strength validation with JSX', () => {
    cy.visit('/jsx-error-messages');

    // Enter weak password
    cy.get('input[id="password"]').type('weak');
    cy.get('button[type="submit"]').click();

    // Check password strength error with visual indicators
    cy.contains('⚠️ Password too weak').should('be.visible');
    cy.contains('Must be at least 8 characters (current: 4)').should(
      'be.visible',
    );
  });

  it('should show detailed password requirements with colored checkmarks', () => {
    cy.visit('/jsx-error-messages');

    // Enter a password that meets some but not all requirements
    cy.get('input[id="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Check that password requirements are shown
    cy.contains('🔐 Password requirements:').should('be.visible');
    cy.contains('Uppercase letter').should('be.visible');
    cy.contains('Lowercase letter').should('be.visible');
    cy.contains('Number').should('be.visible');
    cy.contains('Special character').should('be.visible');
  });

  it('should display styled password confirmation error', () => {
    cy.visit('/jsx-error-messages');

    // Enter different passwords
    cy.get('input[id="password"]').type('Password123!');
    cy.get('input[id="confirmPassword"]').type('DifferentPassword123!');
    cy.get('button[type="submit"]').click();

    // Check password mismatch error with styling
    cy.contains('⚠️ Passwords do not match').should('be.visible');
    cy.contains('Please ensure both password fields are identical').should(
      'be.visible',
    );
  });

  it('should handle form submission with valid JSX errors cleared', () => {
    cy.visit('/jsx-error-messages');

    // Fill out the form with valid data
    cy.get('input[id="username"]').type('validuser');
    cy.get('input[id="email"]').type('user@example.com');
    cy.get('input[id="password"]').type('ValidPassword123!');
    cy.get('input[id="confirmPassword"]').type('ValidPassword123!');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Check that no error messages are displayed
    cy.get('strong').contains('Username is required').should('not.exist');
    cy.contains('Email address is required').should('not.exist');
    cy.contains('Password is required').should('not.exist');
  });

  it('should show username length validation with JSX formatting', () => {
    cy.visit('/jsx-error-messages');

    // Enter short username
    cy.get('input[id="username"]').type('ab');
    cy.get('button[type="submit"]').click();

    // Check JSX formatted minLength error
    cy.contains('Username must be at least').should('be.visible');
    cy.get('strong').contains('3 characters').should('exist');
    cy.get('em').contains('Choose something memorable!').should('exist');
  });

  it('should demonstrate interactive error content', () => {
    cy.visit('/jsx-error-messages');

    // Test the custom error trigger button functionality
    cy.get('input[id="username"]').should('be.visible');
    cy.contains('Trigger Custom JSX Error').should('be.visible').click();

    // Verify the interactive custom error content
    cy.contains('🚨 Custom JSX Error!').should('be.visible');

    // Check that the error message contains interactive elements (list items)
    cy.get('li').contains('user123').should('exist');
    cy.get('li').contains('cooluser2024').should('exist');
    cy.get('li').contains('myawesomename').should('exist');
  });

  it('should maintain functionality while displaying JSX errors', () => {
    cy.visit('/jsx-error-messages');

    // Show an error, then correct it
    cy.get('input[id="email"]').type('bad-email');
    cy.get('button[type="submit"]').click();

    // Error should be visible
    cy.contains('📧 Please enter a valid email address').should('be.visible');

    // Clear and enter valid email
    cy.get('input[id="email"]').clear().type('valid@email.com');

    // Error should disappear when field becomes valid (on re-validation)
    cy.get('input[id="username"]').type('validusername'); // Trigger form re-validation
    cy.get('button[type="submit"]').click();

    // Email error should be gone, but other required field errors may remain
    cy.contains('📧 Please enter a valid email address').should('not.exist');
  });
});
