describe('Smoke — public pages', () => {
  it('home page loads without crashing', () => {
    cy.visit('/')
    cy.get('body').should('exist')
  })

  it('page title is present', () => {
    cy.visit('/')
    cy.title().should('not.be.empty')
  })

  it('responds to /play route', () => {
    cy.request({ url: '/play', failOnStatusCode: false }).its('status').should('be.oneOf', [200, 307, 302, 404])
  })
})
