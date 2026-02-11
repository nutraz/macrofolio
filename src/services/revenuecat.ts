import Purchases from 'react-native-purchases';

// REPLACE WITH YOUR REVENUECAT API KEY from app.revenuecat.com
const REVENUECAT_API_KEY = 'appl_YOUR_API_KEY_HERE';

export const initRevenueCat = async () => {
  try {
    Purchases.setDebugLogsEnabled(true);
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    console.log('✅ RevenueCat initialized');
    return true;
  } catch (error) {
    console.error('❌ RevenueCat init error:', error);
    return false;
  }
};

export const checkPremiumStatus = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active?.premium !== undefined;
    console.log('Premium status:', isPremium);
    return isPremium;
  } catch (error) {
    console.error('Error checking premium:', error);
    return false;
  }
};

export const purchasePremium = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current?.availablePackages.length) {
      const purchaseResult = await Purchases.purchasePackage(
        offerings.current.availablePackages[0]
      );
      return purchaseResult;
    }
    return null;
  } catch (error) {
    console.error('Purchase error:', error);
    return null;
  }
};
