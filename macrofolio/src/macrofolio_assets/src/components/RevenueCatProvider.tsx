import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';

// RevenueCat API Key - Replace with your actual API key from RevenueCat dashboard
// For testing, use your public SDK key from RevenueCat
const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || '';

// Product IDs configuration
export const PRODUCT_IDS = {
  MONTHLY: 'macrofolio_monthly_subscription',
  YEARLY: 'macrofolio_yearly_subscription',
  LIFETIME: 'macrofolio_lifetime_pass',
} as const;

// Entitlement IDs
export const ENTITLEMENTS = {
  PREMIUM: 'premium_access',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  EXPORT_FEATURES: 'export_features',
} as const;

// Subscription tier type
export type SubscriptionTier = 'free' | 'pro' | 'lifetime';

// Types (matching RevenueCat SDK types)
interface CustomerInfo {
  originalAppUserID: string;
  entitlements: {
    active: Record<string, {
      productIdentifier: string;
      expirationDate: string;
    }>;
  };
}

interface Product {
  identifier: string;
  title: string;
  description: string;
  priceString: string;
  price: number;
  periodType: 'normal' | 'trial' | 'intro';
}

interface Offering {
  identifier: string;
  activeProductIdentifier: string;
  product: Product;
}

interface Offerings {
  current: {
    monthly?: Offering;
    annual?: Offering;
    lifetime?: Offering;
  } | null;
}

// RevenueCat context type
interface RevenueCatContextType {
  customerInfo: CustomerInfo | null;
  offerings: Offerings | null;
  isLoading: boolean;
  error: Error | null;
  isPro: boolean;
  subscriptionTier: SubscriptionTier;
  hasAdvancedAnalytics: boolean;
  hasExportFeatures: boolean;
  purchaseMonthly: () => Promise<{ success: boolean; error?: Error }>;
  purchaseYearly: () => Promise<{ success: boolean; error?: Error }>;
  purchaseLifetime: () => Promise<{ success: boolean; error?: Error }>;
  restorePurchases: () => Promise<CustomerInfo | null>;
  refreshCustomerInfo: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatContextType | null>(null);

export const useRevenueCatContext = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCatContext must be used within RevenueCatProvider');
  }
  return context;
};

// Demo mode offerings
const DEMO_OFFERINGS: Offerings = {
  current: {
    monthly: {
      identifier: 'monthly',
      activeProductIdentifier: PRODUCT_IDS.MONTHLY,
      product: {
        identifier: PRODUCT_IDS.MONTHLY,
        title: 'Monthly Pro',
        description: 'Full access to all premium features for one month',
        priceString: '$9.99/mo',
        price: 9.99,
        periodType: 'normal',
      },
    },
    annual: {
      identifier: 'annual',
      activeProductIdentifier: PRODUCT_IDS.YEARLY,
      product: {
        identifier: PRODUCT_IDS.YEARLY,
        title: 'Annual Pro',
        description: 'Full access to all premium features for one year - Save 17%',
        priceString: '$99.99/yr',
        price: 99.99,
        periodType: 'normal',
      },
    },
  },
};

// Demo mode provider for when RevenueCat is not configured or for initial demo
const DemoRevenueCatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPro, setIsPro] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [showDemoPurchaseSuccess, setShowDemoPurchaseSuccess] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  const refreshCustomerInfo = useCallback(async () => {
    // Simulate fetching customer info
    if (isPro) {
      setCustomerInfo({
        originalAppUserID: 'demo-user',
        entitlements: {
          active: {
            [ENTITLEMENTS.PREMIUM]: {
              productIdentifier: subscriptionTier === 'lifetime' ? PRODUCT_IDS.LIFETIME : PRODUCT_IDS.YEARLY,
              expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            },
          },
        },
      });
    }
  }, [isPro, subscriptionTier]);

  const contextValue: RevenueCatContextType = {
    customerInfo,
    offerings: DEMO_OFFERINGS,
    isLoading: false,
    error: null,
    isPro,
    subscriptionTier,
    hasAdvancedAnalytics: isPro,
    hasExportFeatures: isPro,
    purchaseMonthly: async () => {
      setShowDemoPurchaseSuccess(true);
      setSubscriptionTier('pro');
      setIsPro(true);
      await refreshCustomerInfo();
      setTimeout(() => setShowDemoPurchaseSuccess(false), 3000);
      return { success: true };
    },
    purchaseYearly: async () => {
      setShowDemoPurchaseSuccess(true);
      setSubscriptionTier('pro');
      setIsPro(true);
      await refreshCustomerInfo();
      setTimeout(() => setShowDemoPurchaseSuccess(false), 3000);
      return { success: true };
    },
    purchaseLifetime: async () => {
      setShowDemoPurchaseSuccess(true);
      setSubscriptionTier('lifetime');
      setIsPro(true);
      await refreshCustomerInfo();
      setTimeout(() => setShowDemoPurchaseSuccess(false), 3000);
      return { success: true };
    },
    restorePurchases: async () => {
      // In demo mode, restore does nothing
      return customerInfo;
    },
    refreshCustomerInfo,
  };

  return (
    <RevenueCatContext.Provider value={contextValue}>
      {children}
      {showDemoPurchaseSuccess && (
        <div className="fixed bottom-4 right-4 bg-success/90 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          ✅ Demo: Purchase successful! Premium features unlocked.
        </div>
      )}
    </RevenueCatContext.Provider>
  );
};

// Main provider component - handles both demo and production modes
interface RevenueCatProviderProps {
  children: React.ReactNode;
  enableDemoMode?: boolean;
}

export const RevenueCatProvider: React.FC<RevenueCatProviderProps> = ({ 
  children, 
  enableDemoMode = true 
}) => {
  const [useDemoMode, setUseDemoMode] = useState(() => {
    // Enable demo mode if no API key is configured or if explicitly enabled
    return !REVENUECAT_API_KEY || enableDemoMode;
  });

  if (useDemoMode) {
    console.log('[RevenueCat] Running in DEMO MODE - install dependencies and configure API key for real integration');
    return <DemoRevenueCatProvider>{children}</DemoRevenueCatProvider>;
  }

  // For production mode, use the demo provider until SDK is properly configured
  // In production, you would use:
  // import { RevenueCatProvider as RCProvider } from '@revenuecat/purchases-react-web';
  // return <RCProvider apiKey={REVENUECAT_API_KEY}>...</RCProvider>;
  
  return <DemoRevenueCatProvider>{children}</DemoRevenueCatProvider>;
};

export default RevenueCatProvider;

