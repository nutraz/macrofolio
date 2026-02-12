import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import RevenueCatService, { RevenueCatCustomer } from '../lib/revenuecat';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_REVENUECAT_API_KEY;

// Product IDs configuration
export const PRODUCT_IDS = {
  MONTHLY: 'macrofolio_monthly_subscription',
  YEARLY: 'macrofolio_yearly_subscription',
  LIFETIME: 'macrofolio_lifetime_subscription'
} as const;

export type ProductId = keyof typeof PRODUCT_IDS;

interface RevenueCatContextType {
  customerInfo: RevenueCatCustomer | null;
  isLoading: boolean;
  isPremium: boolean;
  products: any[];
  refreshCustomerInfo: () => Promise<void>;
  purchaseProduct: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  isConfigured: boolean;
  isDemoMode: boolean;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

// Export the context hook - this is what components should use
export const useRevenueCatContext = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCatContext must be used within RevenueCatProvider');
  }
  return context;
};

// Mock products for demo mode
const DEMO_PRODUCTS = [
  {
    identifier: PRODUCT_IDS.MONTHLY,
    title: 'Premium Monthly',
    description: 'Advanced analytics and portfolio insights',
    priceString: '$9.99/month',
    price: 9.99,
    periodType: 'normal' as const
  },
  {
    identifier: PRODUCT_IDS.YEARLY,
    title: 'Premium Yearly',
    description: 'Best value - 2 months free',
    priceString: '$99.99/year',
    price: 99.99,
    periodType: 'normal' as const
  },
  {
    identifier: PRODUCT_IDS.LIFETIME,
    title: 'Lifetime Access',
    description: 'One-time payment, lifetime updates',
    priceString: '$299.99 once',
    price: 299.99,
    periodType: 'normal' as const
  }
];

interface DemoRevenueCatProviderProps {
  children: React.ReactNode;
}

const DemoRevenueCatProvider: React.FC<DemoRevenueCatProviderProps> = ({ children }) => {
  const [customerInfo, setCustomerInfo] = useState<RevenueCatCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products] = useState(DEMO_PRODUCTS);

  const isPremium = customerInfo?.subscriber?.entitlements?.active?.premium !== undefined;

  const refreshCustomerInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userId = localStorage.getItem('macrofolio_user_id') || 'demo_user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('macrofolio_user_id', userId);
      
      const info = RevenueCatService.getDemoCustomerInfo(userId);
      setCustomerInfo(info);
    } catch (error) {
      console.error('Error refreshing demo customer info:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purchaseProduct = useCallback(async (productId: string): Promise<boolean> => {
    try {
      if (import.meta.env.DEV) {
        console.log('[Demo] Simulating purchase of:', productId);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userId = localStorage.getItem('macrofolio_user_id') || 'demo_user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('macrofolio_user_id', userId);
      
      const info: RevenueCatCustomer = {
        subscriber: {
          original_app_user_id: userId,
          entitlements: {
            active: {
              premium: {
                product_identifier: productId,
                expires_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                purchase_date: new Date().toISOString()
              }
            }
          },
          subscriptions: {
            [productId]: {
              period_type: 'normal',
              purchase_date: new Date().toISOString(),
              expires_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          }
        }
      };
      
      setCustomerInfo(info);
      alert(`Demo Purchase Successful! You now have Premium access.`);
      return true;
    } catch (error) {
      console.error('Demo purchase error:', error);
      return false;
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    try {
      await refreshCustomerInfo();
      if (customerInfo?.subscriber?.entitlements?.active?.premium) {
        alert('Demo: Restored premium subscription!');
      } else {
        alert('Demo: No active subscriptions found.');
      }
    } catch (error) {
      console.error('Demo restore error:', error);
      alert('Demo: Error restoring purchases');
    }
  }, [customerInfo, refreshCustomerInfo]);

  useEffect(() => {
    refreshCustomerInfo();
  }, [refreshCustomerInfo]);

  return (
    <RevenueCatContext.Provider
      value={{
        customerInfo,
        isLoading,
        isPremium,
        products,
        refreshCustomerInfo,
        purchaseProduct,
        restorePurchases,
        isConfigured: false,
        isDemoMode: true
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
};

interface RealRevenueCatProviderProps {
  children: React.ReactNode;
}

const RealRevenueCatProvider: React.FC<RealRevenueCatProviderProps> = ({ children }) => {
  const [customerInfo, setCustomerInfo] = useState<RevenueCatCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isPremium = customerInfo?.subscriber?.entitlements?.active?.premium !== undefined;

  const refreshCustomerInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = localStorage.getItem('macrofolio_user_id');
      if (!userId) {
        if (import.meta.env.DEV) {
          console.log('No user ID found, using demo data');
        }
        const info = RevenueCatService.getDemoCustomerInfo('new_user');
        setCustomerInfo(info);
        return;
      }

      const info = await RevenueCatService.getCustomerInfo(userId);
      setCustomerInfo(info);
    } catch (error: any) {
      console.error('Error refreshing customer info:', error);
      setError(error.message);
      const userId = localStorage.getItem('macrofolio_user_id') || 'fallback_user';
      const info = RevenueCatService.getDemoCustomerInfo(userId);
      setCustomerInfo(info);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const products = await RevenueCatService.getProducts();
      setProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts(DEMO_PRODUCTS);
    }
  }, []);

  const purchaseProduct = useCallback(async (productId: string): Promise<boolean> => {
    try {
      let userId = localStorage.getItem('macrofolio_user_id');
      if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('macrofolio_user_id', userId);
      }

      const purchaseLink = RevenueCatService.getPurchaseLink(productId, userId);
      if (import.meta.env.DEV) {
        console.log('Redirecting to purchase:', purchaseLink);
      }
      
      if (RevenueCatService.isConfigured()) {
        window.open(purchaseLink, '_blank');
        return false;
      } else {
        const info: RevenueCatCustomer = RevenueCatService.getDemoCustomerInfo(userId);
        setCustomerInfo(info);
        alert('Purchase would redirect to checkout in production. Using demo purchase for now.');
        return true;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      return false;
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    try {
      const userId = localStorage.getItem('macrofolio_user_id');
      if (!userId) {
        alert('Please sign in first to restore purchases');
        return;
      }

      await refreshCustomerInfo();
      if (isPremium) {
        alert('Premium subscription restored!');
      } else {
        alert('No active subscriptions found.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      alert('Error restoring purchases. Please try again.');
    }
  }, [isPremium, refreshCustomerInfo]);

  useEffect(() => {
    refreshCustomerInfo();
    loadProducts();
  }, [refreshCustomerInfo, loadProducts]);

  return (
    <RevenueCatContext.Provider
      value={{
        customerInfo,
        isLoading,
        isPremium,
        products,
        refreshCustomerInfo,
        purchaseProduct,
        restorePurchases,
        isConfigured: RevenueCatService.isConfigured(),
        isDemoMode: false
      }}
    >
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <p className="font-semibold">RevenueCat Error</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Running in fallback mode with demo data.</p>
        </div>
      )}
      {children}
    </RevenueCatContext.Provider>
  );
};

interface RevenueCatProviderProps {
  children: React.ReactNode;
  enableDemoMode?: boolean;
}

export const RevenueCatProvider: React.FC<RevenueCatProviderProps> = ({ 
  children, 
  enableDemoMode = false 
}) => {
  const shouldUseDemoMode = enableDemoMode || DEMO_MODE;

  if (shouldUseDemoMode) {
    if (import.meta.env.DEV) {
      console.log('[RevenueCat] Running in DEMO MODE - configure VITE_REVENUECAT_API_KEY for production');
    }
    return <DemoRevenueCatProvider>{children}</DemoRevenueCatProvider>;
  }

  return <RealRevenueCatProvider>{children}</RealRevenueCatProvider>;
};

export default RevenueCatProvider;
