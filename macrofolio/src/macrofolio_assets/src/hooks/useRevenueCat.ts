import { useCallback, useEffect, useState } from 'react';
import { useRevenueCatContext } from '../components/RevenueCatProvider';

// RevenueCat entitlements configuration
export const ENTITLEMENTS = {
  PREMIUM: 'premium_access',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  EXPORT_FEATURES: 'export_features',
} as const;

// Product IDs
export const PRODUCTS = {
  MONTHLY_SUBSCRIPTION: 'macrofolio_monthly_subscription',
  YEARLY_SUBSCRIPTION: 'macrofolio_yearly_subscription',
  LIFETIME_PASS: 'macrofolio_lifetime_pass',
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
  periodType?: 'normal' | 'trial' | 'intro';
}

// Use the context-based hook
export function useRevenueCat() {
  const { 
    customerInfo, 
    offerings, 
    isLoading, 
    error, 
    isPro, 
    subscriptionTier,
    purchaseMonthly,
    purchaseYearly,
    purchaseLifetime,
    restorePurchases,
    hasAdvancedAnalytics,
    hasExportFeatures
  } = useRevenueCatContext();

  const [offeringList, setOfferingList] = useState<Offering[]>([]);

  // Convert offerings to our format
  useEffect(() => {
    if (offerings?.current) {
      const available: Offering[] = [];
      
      if (offerings.current.monthly) {
        const { product } = offerings.current.monthly;
        available.push({
          identifier: 'monthly',
          title: product.title,
          description: product.description,
          priceString: product.priceString,
          productIdentifier: product.identifier,
          periodType: product.periodType,
        });
      }
      
      if (offerings.current.annual) {
        const { product } = offerings.current.annual;
        available.push({
          identifier: 'annual',
          title: product.title,
          description: product.description,
          priceString: product.priceString,
          productIdentifier: product.identifier,
          periodType: product.periodType,
        });
      }
      
      setOfferingList(available);
    }
  }, [offerings]);

  const purchase = useCallback(async (productId: string) => {
    if (productId === PRODUCTS.MONTHLY_SUBSCRIPTION) {
      return purchaseMonthly();
    } else if (productId === PRODUCTS.YEARLY_SUBSCRIPTION) {
      return purchaseYearly();
    } else if (productId === PRODUCTS.LIFETIME_PASS) {
      return purchaseLifetime();
    }
    return { success: false, error: new Error('Unknown product') };
  }, [purchaseMonthly, purchaseYearly, purchaseLifetime]);

  const getOfferings = useCallback(async () => {
    return offeringList;
  }, [offeringList]);

  return {
    isPremium: isPro,
    offerings: offeringList,
    loading: isLoading,
    error,
    purchase,
    getOfferings,
    refreshSubscription: restorePurchases,
    hasAdvancedAnalytics,
    hasExportFeatures,
    subscriptionTier,
    customerInfo,
  };
}

export function usePremiumStatus() {
  const { 
    isPremium, 
    offerings, 
    loading, 
    purchase, 
    refreshSubscription, 
    hasAdvancedAnalytics,
    hasExportFeatures,
    subscriptionTier
  } = useRevenueCat();
  
  return { 
    isPremium, 
    hasProAccess: isPremium, 
    offerings, 
    loading, 
    purchase, 
    refreshOfferings: refreshSubscription, 
    isLoading: loading,
    hasAdvancedAnalytics,
    hasExportFeatures,
    subscriptionTier
  };
}

// Backward compatibility - maintains existing API
export default useRevenueCat;

