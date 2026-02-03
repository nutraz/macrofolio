import { useCallback, useState } from 'react';
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
  LIFETIME_PASS: 'macrofolio_lifetime_subscription',
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

// Main hook that wraps the context with additional functionality
export function useRevenueCat() {
  const { 
    customerInfo, 
    isLoading, 
    isPremium, 
    products,
    refreshCustomerInfo,
    purchaseProduct,
    restorePurchases,
    isConfigured,
    isDemoMode
  } = useRevenueCatContext();

  // Convert products to offerings format
  const offerings: Offering[] = products.map((product: any) => ({
    identifier: product.identifier,
    title: product.title,
    description: product.description,
    priceString: product.priceString,
    productIdentifier: product.identifier,
    periodType: product.periodType,
  }));

  const purchase = useCallback(async (productId: string): Promise<{ success: boolean; error?: Error }> => {
    const result = await purchaseProduct(productId);
    return { success: result };
  }, [purchaseProduct]);

  const getOfferings = useCallback(async () => {
    return offerings;
  }, [offerings]);

  const getSubscriptionTier = (): SubscriptionTier => {
    if (!customerInfo?.subscriber?.entitlements?.active?.premium) {
      return 'free';
    }
    const productId = customerInfo.subscriber.entitlements.active.premium.product_identifier;
    if (productId === PRODUCTS.LIFETIME_PASS) {
      return 'lifetime';
    }
    return 'pro';
  };

  return {
    isPremium,
    offerings,
    loading: isLoading,
    error: null,
    purchase,
    getOfferings,
    refreshSubscription: refreshCustomerInfo,
    hasAdvancedAnalytics: isPremium,
    hasExportFeatures: isPremium,
    subscriptionTier: getSubscriptionTier(),
    customerInfo,
    isConfigured,
    isDemoMode,
    restorePurchases,
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
    subscriptionTier,
    customerInfo,
    isDemoMode,
    restorePurchases
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
    subscriptionTier,
    customerInfo,
    isDemoMode,
    restorePurchases
  };
}

// Backward compatibility - maintains existing API
export default useRevenueCat;

