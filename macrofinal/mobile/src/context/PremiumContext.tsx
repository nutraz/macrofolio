import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getRevenueCatApiKey } from '../config/revenuecat';
import {
  getOfferingsSummary,
  getPremiumStatus,
  initRevenueCat,
  purchaseFirstAvailablePackage,
  restorePremium,
} from '../services/revenuecat';

type PremiumContextValue = {
  loading: boolean;
  isPremium: boolean;
  revenueCatEnabled: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  purchaseFirstPackage: () => Promise<void>;
  restore: () => Promise<void>;
  setPremiumOverrideForDemo: (value: boolean) => void;
};

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({
  children,
  appUserId,
}: {
  children: React.ReactNode;
  appUserId?: string | null;
}) {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [revenueCatEnabled, setRevenueCatEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (mounted) setLoading(true);
      const apiKey = getRevenueCatApiKey();
      if (!apiKey) {
        if (mounted) {
          setRevenueCatEnabled(false);
          setError('RevenueCat API key not set.');
          setLoading(false);
        }
        return;
      }

      try {
        const ok = await initRevenueCat(appUserId);
        if (!ok) throw new Error('RevenueCat initialization failed.');
        if (mounted) setRevenueCatEnabled(true);

        try {
          const summary = await getOfferingsSummary();
          if (mounted && summary.availablePackageCount === 0) {
            setError(
              'No offerings/packages found. In RevenueCat, set a Current Offering with at least one Package (and ensure products are connected to the store).',
            );
          }
        } catch {
          // Ignore offerings errors here; purchase flow will surface issues.
        }

        try {
          const premium = await getPremiumStatus();
          if (mounted) {
            setIsPremium(premium);
            if (premium) setError(null);
          }
        } catch (e: any) {
          if (mounted) setError(e?.message || 'Failed to fetch subscription status.');
        }
      } catch (e: any) {
        if (mounted) {
          setRevenueCatEnabled(false);
          setError(e?.message || 'RevenueCat error');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [appUserId]);

  const refresh = useCallback(async () => {
    if (!revenueCatEnabled) return;
    const premium = await getPremiumStatus();
    setIsPremium(premium);
  }, [revenueCatEnabled]);

  const purchaseFirstPackage = useCallback(async () => {
    const premium = await purchaseFirstAvailablePackage();
    setIsPremium(premium);
  }, []);

  const restore = useCallback(async () => {
    const premium = await restorePremium();
    setIsPremium(premium);
  }, []);

  const setPremiumOverrideForDemo = useCallback((value: boolean) => {
    setIsPremium(value);
  }, []);

  const value = useMemo<PremiumContextValue>(
    () => ({
      loading,
      isPremium,
      revenueCatEnabled,
      error,
      refresh,
      purchaseFirstPackage,
      restore,
      setPremiumOverrideForDemo,
    }),
    [loading, isPremium, revenueCatEnabled, error, refresh, purchaseFirstPackage, restore, setPremiumOverrideForDemo],
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
