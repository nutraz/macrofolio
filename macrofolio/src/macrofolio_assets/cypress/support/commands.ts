// Custom commands for Cypress
// https://docs.cypress.io/api/cypress-api/custom-commands

Cypress.Commands.add('loginWithMetaMask', (address: string, privateKey: string) => {
  // This would integrate with MetaMask for real wallet testing
  // For testing purposes, this sets up mock data
  cy.window().then((win) => {
    win.localStorage.setItem('walletAddress', address);
    win.localStorage.setItem('isConnected', 'true');
  });
});

Cypress.Commands.add('signMessage', (message: string) => {
  // Mock message signing
  cy.window().then((win) => {
    win.localStorage.setItem('lastSignedMessage', message);
  });
});

Cypress.Commands.add('checkSecurityHeaders', () => {
  cy.request('/').then((response) => {
    // Check for security headers
    expect(response.headers['x-content-type-options']).to.equal('nosniff');
    expect(response.headers['x-frame-options']).to.exist;
    expect(response.headers['x-xss-protection']).to.exist;
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginWithMetaMask(address: string, privateKey: string): Chainable<void>;
      signMessage(message: string): Chainable<void>;
      checkSecurityHeaders(): Chainable<void>;
    }
  }
}

export {};
