describe('Dashboard and Protected Routes', () => {
  it('should redirect to login if unauthenticated when visiting dashboard', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })

  it('should redirect to login if unauthenticated when visiting admin', () => {
    cy.visit('/admin')
    cy.url().should('include', '/login')
  })
})
