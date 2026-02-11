import { Platform } from 'react-native';

// RevenueCat SDK keys are "public" keys used in the client SDK.
// Set these to your project keys from the RevenueCat dashboard.
export const REVENUECAT_IOS_API_KEY = '';
export const REVENUECAT_ANDROID_API_KEY = '';

// Must match your RevenueCat Entitlement Identifier.
export const REVENUECAT_ENTITLEMENT_ID = 'premium';

export function getRevenueCatApiKey(): string {
  if (Platform.OS === 'ios') return REVENUECAT_IOS_API_KEY;
  return REVENUECAT_ANDROID_API_KEY;
}

