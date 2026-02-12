/**
 * Mock RevenueCat Configuration for Development
 * 
 * This file provides mock implementations for RevenueCat functionality
 * during development. It allows the app to run without actual RevenueCat API keys.
 * 
 * For production:
 * 1. Install: npm install react-native-purchases
 * 2. Set up actual API keys in .env
 * 3. Replace this mock with real RevenueCat implementation
 */

// Mock RevenueCat configuration
export const revenueCatConfig = {
  REVENUECAT_ANDROID_API_KEY: 'mock_dev_key',
  REVENUECAT_IOS_API_KEY: 'mock_dev_key',
};

/**
 * Mock hook that simulates RevenueCat behavior
 * Always returns premium = true for development
 */
export function useRevenueCat() {
  return {
    // Always premium in development
    isPremium: true,
    
    // No loading needed in mock
    loading: false,
    
    // Mock customer info with active premium entitlement
    customerInfo: {
      entitlements: {
        active: {
          premium: {
            identifier: 'premium_monthly',
            isActive: true,
            expiresDate: null,
            productIdentifier: 'premium_monthly',
            purchaseDate: new Date().toISOString(),
          },
        },
      },
      originalAppUserId: 'mock-user-123',
      allExpirationDatesMillis: {},
      allPurchaseDatesMillis: {},
      activeSubscriptions: ['premium_monthly'],
      nonConsumablePurchases: [],
      latestExpirationDate: null,
    },
    
    // Empty products array for development
    products: [],
    
    // Mock purchase function
    purchasePackage: async () => {
      console.log('[revenuecat] Mock purchase called');
      return {
        customerInfo: {
          entitlements: {
            active: {
              premium: {
                identifier: 'premium_monthly',
                isActive: true,
              },
            },
          },
        },
      };
    },
    
    // Mock restore function
    restorePurchases: async () => {
      console.log('[revenuecat] Mock restore called');
      return {
        customerInfo: {
          entitlements: {
            active: {
              premium: {
                identifier: 'premium_monthly',
                isActive: true,
              },
            },
          },
        },
      };
    },
  };
}

/**
 * Check if RevenueCat is properly configured
 * In mock mode, always returns false (using mock)
 */
export const isRevenueCatConfigured = false; // Mock mode

