import Purchases from 'react-native-purchases';
import { REVENUECAT_ENTITLEMENT_ID, getRevenueCatApiKey } from '../config/revenuecat';

let isConfigured = false;
let lastAppUserId: string | null = null;

function getEntitlementActive(customerInfo: any): boolean {
  return customerInfo?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_ID] !== undefined;
}

export async function getOfferingsSummary(): Promise<{
  currentOfferingIdentifier: string | null;
  availablePackageCount: number;
}> {
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  return {
    currentOfferingIdentifier: current?.identifier ?? null,
    availablePackageCount: current?.availablePackages?.length ?? 0,
  };
}

export async function initRevenueCat(appUserId?: string | null): Promise<boolean> {
  const apiKey = getRevenueCatApiKey();
  if (!apiKey) return false;

  try {
    const dev = typeof __DEV__ !== 'undefined' && __DEV__;
    if (dev) Purchases.setDebugLogsEnabled(true);

    if (!isConfigured) {
      await Purchases.configure({
        apiKey,
        ...(appUserId ? { appUserID: appUserId } : {}),
      });
      isConfigured = true;
      lastAppUserId = appUserId ?? null;
      return true;
    }

    if ((appUserId ?? null) !== lastAppUserId) {
      if (appUserId) {
        await Purchases.logIn(appUserId);
        lastAppUserId = appUserId;
      } else {
        await Purchases.logOut();
        lastAppUserId = null;
      }
    }

    return true;
  } catch (error) {
    console.error('❌ RevenueCat init error:', error);
    return false;
  }
}

export async function getPremiumStatus(): Promise<boolean> {
  const customerInfo = await Purchases.getCustomerInfo();
  return getEntitlementActive(customerInfo);
}

export async function purchaseFirstAvailablePackage(): Promise<boolean> {
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages?.[0];
  if (!pkg) throw new Error('No purchase packages available (check RevenueCat offerings).');

  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return getEntitlementActive(customerInfo);
}

export async function restorePremium(): Promise<boolean> {
  const customerInfo = await Purchases.restorePurchases();
  return getEntitlementActive(customerInfo);
}
