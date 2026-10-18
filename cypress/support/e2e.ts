import './commands';

// Ignore React hydration mismatch errors in Cypress
Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('Minified React error #418') ||
    err.message.includes('Minified React error #423') ||
    err.message.includes('Minified React error #425') ||
    err.message.includes('Hydration failed') ||
    err.message.includes('hydrating')
  ) {
    // Returning false prevents Cypress from failing the test
    return false;
  }
});

