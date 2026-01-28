import { useState, useCallback, useEffect } from 'react';

// RevenueCat entitlements configuration
export const ENTITLEMENTS = {
  PREMIUM: 'premium_access',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  EXPORT_FEATURES: 'export_features',
} as const;

// Product IDs
export const PRODUCTS = {
  MONTHLY_SUBSCRIPTION: 'macrofolio_monthly',
  YEARLY_SUBSCRIPTION: 'macrofolio_yearly',
  LIFETIME_PASS: 'macrofolio_lifetime',
} as const;

// Subscription tier type
export type SubscriptionTier = 'free' | 'pro' | 'lifetime';

// Offering interface
export interface Offering {
  identifier: string;
  title: string;
  description: string;
  priceString: string;
  productIdentifier: string;
}

// Mock RevenueCat interface for demo
interface MockRevenueCat {
  getOfferings: () => Promise<{ 
    current?: {
      monthly?: Offering;
      annual?: Offering;
      lifetime?: Offering;
    };
  }>;
  purchaseProduct: (productId: string) => Promise<{
    customerInfo: {
      entitlements: {
        active: Record<string, { productIdentifier: string }>;
      };
    };
  }>;
  checkTrialStatus: () => Promise<boolean>;
}

class RevenueCatService {
  private initialized: boolean = false;
  private mockRC: MockRevenueCat = {
    getOfferings: async () => {
      return {
        current: {
          monthly: {
            identifier: 'monthly',
            title: 'Monthly Pro',
            description: 'Full access to all premium features for one month',
            priceString: '$9.99/mo',
            productIdentifier: PRODUCTS.MONTHLY_SUBSCRIPTION,
          },
          annual: {
            identifier: 'annual',
            title: 'Annual Pro',
            description: 'Full access to all premium features for one year - Save 17%',
            priceString: '$99.99/yr',
            productIdentifier: PRODUCTS.YEARLY_SUBSCRIPTION,
          },
        },
      };
    },
    purchaseProduct: async (productId: string) => {
      return {
        customerInfo: {
          entitlements: {
            active: {
              [ENTITLEMENTS.PREMIUM]: { productIdentifier: productId },
            },
          },
        },
      };
    },
    checkTrialStatus: async () => false,
  };

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    console.log('RevenueCat service initialized (demo mode)');
  }

  async getOfferings(): Promise<{ 
    current?: {
      monthly?: Offering;
      annual?: Offering;
      lifetime?: Offering;
    };
  } | undefined> {
    if (!this.initialized) await this.initialize();
    try {
      const offerings = await this.mockRC.getOfferings();
      return offerings;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return undefined;
    }
  }

  async purchaseProduct(productId: string): Promise<{
    success: boolean;
    customerInfo?: {
      entitlements: {
        active: Record<string, { productIdentifier: string }>;
      };
    };
    error?: Error;
  }> {
    if (!this.initialized) await this.initialize();
    try {
      const result = await this.mockRC.purchaseProduct(productId);
      return { success: true, customerInfo: result.customerInfo };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  async checkSubscriptionStatus(): Promise<{
    isPro: boolean;
    subscriptionTier: SubscriptionTier;
    hasAdvancedAnalytics: boolean;
  }> {
    if (!this.initialized) await this.initialize();
    return { isPro: false, subscriptionTier: 'free', hasAdvancedAnalytics: false };
  }
}

const revenueCatService = new RevenueCatService();

export function useRevenueCat() {
  const [isPremium, setIsPremium] = useState(false);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOfferings = async () => {
      setLoading(true);
      try {
        await revenueCatService.initialize();
        const result = await revenueCatService.getOfferings();
        if (result?.current) {
          const available: Offering[] = [];
          if (result.current.monthly) available.push(result.current.monthly);
          if (result.current.annual) available.push(result.current.annual);
          setOfferings(available);
        }
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchOfferings();
  }, []);

  const purchase = useCallback(async (offeringId: string) => {
    try {
      const result = await revenueCatService.purchaseProduct(offeringId);
      if (result.success && result.customerInfo?.entitlements.active[ENTITLEMENTS.PREMIUM]) {
        setIsPremium(true);
        return { success: true };
      }
      return { success: false, error: new Error('Purchase not completed') };
    } catch (e) {
      return { success: false, error: e as Error };
    }
  }, []);

  const getOfferings = useCallback(async () => {
    setLoading(true);
    try {
      const result = await revenueCatService.getOfferings();
      if (result?.current) {
        const available: Offering[] = [];
        if (result.current.monthly) available.push(result.current.monthly);
        if (result.current.annual) available.push(result.current.annual);
        setOfferings(available);
      }
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { isPremium, offerings, loading, error, purchase, getOfferings, refreshSubscription: getOfferings };
}

export function usePremiumStatus() {
  const { isPremium, offerings, loading, purchase, getOfferings } = useRevenueCat();
  return { isPremium, hasProAccess: isPremium, offerings, loading, purchase, refreshOfferings: getOfferings, isLoading: loading };
}

export default useRevenueCat;

