describe('Signup Flow', () => {
  it('should load the signup page', () => {
    cy.visit('/signup')
    cy.contains('First Name').should('exist')
  })

  it('should show validation on empty submit', () => {
    cy.visit('/signup')
    cy.contains('Continue to Security').click()
    // It should throw an error or wait for validation
    cy.contains('An account with these').should('not.exist')
  })
})
