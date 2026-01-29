// Support file for E2E tests
// https://docs.cypress.io/guides/tooling/plugins-guide

import './commands';

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  // This is useful for known third-party errors
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  return true;
});

// Disable console errors from failing tests (optional)
beforeEach(() => {
  cy.on('window:before:load', (win) => {
    cy.spy(win.console, 'error');
    cy.spy(win.console, 'warn');
  });
});
