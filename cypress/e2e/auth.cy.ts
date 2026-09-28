describe('Authentication Flow', () => {
  beforeEach(() => {
    // Basic setup before each test
  })

  it('should load the login page', () => {
    cy.visit('/login')
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('should show error when submitting empty form', () => {
    cy.visit('/login')
    cy.get('button[type="submit"]').click()
    // HTML5 validation prevents form submission
    cy.get('input:invalid').should('have.length.at.least', 1)
  })

  it('should show error for invalid credentials', () => {
    cy.visit('/login')
    cy.get('input[name="email"]').type('invalid@test.com')
    cy.get('input[name="password"]').type('wrongpassword123')
    cy.get('button[type="submit"]').click()
    cy.contains(/error|invalid|failed/i, { timeout: 8000 }).should('exist')
  })
})
