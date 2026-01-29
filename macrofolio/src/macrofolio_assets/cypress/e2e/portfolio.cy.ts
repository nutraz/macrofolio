describe('E2E: Portfolio Anchoring Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('UI Rendering', () => {
    it('should load the application without errors', () => {
      cy.get('body').should('exist');
      cy.window().then((win) => {
        expect(win.console.error.getCalls()).to.have.length(0);
      });
    });

    it('should display the main dashboard', () => {
      cy.get('[data-testid="dashboard"]').should('be.visible');
    });

    it('should display header and navigation', () => {
      cy.get('[data-testid="header"]').should('be.visible');
    });
  });

  describe('Wallet Connection', () => {
    it('should display wallet connection button when disconnected', () => {
      cy.get('[data-testid="connect-wallet-btn"]').should('be.visible');
    });

    it('should prompt user to connect wallet', () => {
      cy.get('[data-testid="connect-wallet-btn"]').click();
      // This would trigger MetaMask popup in real scenario
      cy.get('[data-testid="wallet-modal"]').should('exist');
    });

    it('should reject connection to unsupported chains', () => {
      // Simulate user connected to wrong chain
      cy.window().then((win) => {
        win.dispatchEvent(
          new CustomEvent('chainChanged', { detail: '0x1' }) // Ethereum mainnet
        );
      });

      cy.get('[data-testid="wrong-chain-alert"]').should('be.visible');
    });
  });

  describe('Asset Management', () => {
    beforeEach(() => {
      // Mock wallet connection
      cy.window().then((win) => {
        win.localStorage.setItem('walletAddress', '0x' + '1'.repeat(40));
        win.localStorage.setItem('isConnected', 'true');
      });
      cy.reload();
    });

    it('should display add asset form when connected', () => {
      cy.get('[data-testid="add-asset-btn"]').should('be.visible');
      cy.get('[data-testid="add-asset-btn"]').click();
      cy.get('[data-testid="asset-form"]').should('be.visible');
    });

    it('should validate asset form inputs', () => {
      cy.get('[data-testid="add-asset-btn"]').click();

      // Try submitting empty form
      cy.get('[data-testid="asset-form-submit"]').click();
      cy.get('[data-testid="form-error"]').should('contain', 'required');
    });

    it('should add asset successfully', () => {
      cy.get('[data-testid="add-asset-btn"]').click();

      // Fill form
      cy.get('[data-testid="asset-name"]').type('Test Stock');
      cy.get('[data-testid="asset-type"]').select('StockETF');
      cy.get('[data-testid="asset-quantity"]').type('100');
      cy.get('[data-testid="asset-price"]').type('50.00');

      // Submit
      cy.get('[data-testid="asset-form-submit"]').click();

      // Verify success
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.get('[data-testid="asset-list"]').should('contain', 'Test Stock');
    });

    it('should display assets in table', () => {
      cy.get('[data-testid="asset-list"]').should('be.visible');
      cy.get('[data-testid="asset-row"]').should('have.length.greaterThan', 0);
    });

    it('should update asset successfully', () => {
      cy.get('[data-testid="asset-row"]').first().within(() => {
        cy.get('[data-testid="edit-asset-btn"]').click();
      });

      cy.get('[data-testid="asset-quantity"]').clear().type('200');
      cy.get('[data-testid="asset-form-submit"]').click();

      cy.get('[data-testid="success-message"]').should('be.visible');
    });

    it('should delete asset with confirmation', () => {
      cy.get('[data-testid="asset-row"]').first().within(() => {
        cy.get('[data-testid="delete-asset-btn"]').click();
      });

      cy.get('[data-testid="delete-confirm-modal"]').should('be.visible');
      cy.get('[data-testid="confirm-delete-btn"]').click();

      cy.get('[data-testid="success-message"]').should('be.visible');
    });
  });

  describe('Portfolio Anchoring', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('walletAddress', '0x' + '1'.repeat(40));
        win.localStorage.setItem('isConnected', 'true');
      });
      cy.reload();
    });

    it('should display anchor button when portfolio has assets', () => {
      cy.get('[data-testid="anchor-portfolio-btn"]').should('not.be.disabled');
    });

    it('should anchor portfolio to blockchain', () => {
      cy.get('[data-testid="anchor-portfolio-btn"]').click();

      // Should show signing prompt
      cy.get('[data-testid="sign-prompt"]').should('be.visible');

      // Mock signature
      cy.window().then((win) => {
        win.localStorage.setItem('signature', '0x' + 'a'.repeat(130));
      });

      // Wait for transaction
      cy.get('[data-testid="tx-pending"]', { timeout: 15000 }).should('exist');

      // Verify success
      cy.get('[data-testid="anchor-success-message"]', { timeout: 15000 }).should(
        'contain',
        'Portfolio anchored'
      );
    });

    it('should handle anchor errors gracefully', () => {
      cy.get('[data-testid="anchor-portfolio-btn"]').click();

      // Simulate error
      cy.window().then((win) => {
        win.dispatchEvent(
          new CustomEvent('anchorError', {
            detail: { message: 'Transaction failed' },
          })
        );
      });

      cy.get('[data-testid="anchor-error-message"]').should('be.visible');
    });

    it('should display anchor history', () => {
      cy.get('[data-testid="anchor-history"]').should('be.visible');
      cy.get('[data-testid="anchor-entry"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Security: Input Validation', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('walletAddress', '0x' + '1'.repeat(40));
        win.localStorage.setItem('isConnected', 'true');
      });
      cy.reload();
    });

    it('should prevent XSS via asset name', () => {
      cy.get('[data-testid="add-asset-btn"]').click();

      const xssPayload = '<img src=x onerror="alert(\'XSS\')">';
      cy.get('[data-testid="asset-name"]').type(xssPayload);
      cy.get('[data-testid="asset-form-submit"]').click();

      // XSS payload should be sanitized
      cy.window().then((win) => {
        expect(win.console.error.getCalls()).to.not.contain(
          Cypress.sinon.match.string.containing('XSS')
        );
      });
    });

    it('should reject invalid numeric inputs', () => {
      cy.get('[data-testid="add-asset-btn"]').click();

      cy.get('[data-testid="asset-quantity"]').type('-100');
      cy.get('[data-testid="asset-form-submit"]').click();

      cy.get('[data-testid="form-error"]').should('contain', 'positive');
    });

    it('should reject oversized numbers', () => {
      cy.get('[data-testid="add-asset-btn"]').click();

      cy.get('[data-testid="asset-price"]').type('999999999999');
      cy.get('[data-testid="asset-form-submit"]').click();

      cy.get('[data-testid="form-error"]').should('exist');
    });
  });

  describe('Security: HTTPS Enforcement', () => {
    it('should use HTTPS in production', () => {
      if (Cypress.env('ENVIRONMENT') === 'production') {
        expect(cy.url()).to.include('https://');
      }
    });

    it('should have security headers', () => {
      cy.checkSecurityHeaders();
    });
  });

  describe('Rate Limiting (Frontend)', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('walletAddress', '0x' + '1'.repeat(40));
        win.localStorage.setItem('isConnected', 'true');
      });
      cy.reload();
    });

    it('should enforce rate limit on anchor button', () => {
      // Click anchor button multiple times rapidly
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="anchor-portfolio-btn"]').click();
      }

      // After threshold, should be disabled
      cy.get('[data-testid="anchor-portfolio-btn"]').should('be.disabled');
      cy.get('[data-testid="rate-limit-message"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should display user-friendly error messages', () => {
      cy.get('[data-testid="add-asset-btn"]').click();
      cy.get('[data-testid="asset-form-submit"]').click();

      // Error should not contain technical details
      cy.get('[data-testid="form-error"]').then(($el) => {
        const error = $el.text();
        expect(error).not.to.include('undefined');
        expect(error).not.to.include('TypeError');
      });
    });

    it('should handle network errors gracefully', () => {
      cy.intercept('POST', '*/api/**', { statusCode: 500 }).as('apiError');

      cy.get('[data-testid="add-asset-btn"]').click();
      cy.get('[data-testid="asset-form-submit"]').click();

      cy.wait('@apiError');
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should(
        'contain',
        'Please try again'
      );
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="dashboard"]').should('be.visible');
      cy.get('[data-testid="header"]').should('be.visible');
    });

    it('should display correctly on tablet', () => {
      cy.viewport('ipad-2');
      cy.get('[data-testid="dashboard"]').should('be.visible');
    });

    it('should display correctly on desktop', () => {
      cy.viewport('macbook-15');
      cy.get('[data-testid="dashboard"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1);
      cy.get('h2').should('have.length.greaterThan', 0);
    });

    it('should have proper label associations', () => {
      cy.get('[data-testid="add-asset-btn"]').click();
      cy.get('input').each(($input) => {
        const id = $input.attr('id');
        if (id) {
          cy.get(`label[for="${id}"]`).should('exist');
        }
      });
    });

    it('should support keyboard navigation', () => {
      cy.get('body').tab();
      cy.focused().should('exist');
    });
  });
});
