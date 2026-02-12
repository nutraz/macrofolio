// RevenueCat SDK Integration for Capacitor
// Uses dynamic imports to support both web (demo mode) and native platforms

// Type declarations for native modules
declare global {
  const Capacitor: {
    isNativePlatform(): boolean;
  };
}

const REVENUECAT_API_KEY = (import.meta.env?.VITE_REVENUECAT_API_KEY as string) || '';
const DEMO_MODE = import.meta.env?.VITE_DEMO_MODE === 'true' || !REVENUECAT_API_KEY;

// RevenueCat Customer Info type
export interface RevenueCatCustomer {
  subscriber: {
    original_app_user_id: string;
    entitlements: {
      active: Record<string, {
        product_identifier: string;
        expires_date: string;
        purchase_date: string;
      }>;
    };
    subscriptions: Record<string, any>;
  };
}

// RevenueCat Product type
export interface RevenueCatProduct {
  identifier: string;
  title: string;
  description: string;
  priceString: string;
  price: number;
  periodType: 'normal' | 'trial' | 'intro';
}

// RevenueCat Service
class RevenueCatService {
  private static instance: RevenueCatService;
  private initialized: boolean = false;
  private nativePurchases: any = null;

  private constructor() {}

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  // Check if running on native platform
  private isNative(): boolean {
    try {
      return typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
    } catch {
      return false;
    }
  }

  // Initialize RevenueCat - load native SDK only on native platforms
  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (DEMO_MODE) {
      if (import.meta.env.DEV) {
        console.log('[RevenueCat] Running in DEMO MODE');
      }
      this.initialized = true;
      return;
    }

    if (!REVENUECAT_API_KEY) {
      if (import.meta.env.DEV) {
        console.log('[RevenueCat] No API key configured - running in demo mode');
      }
      this.initialized = true;
      return;
    }

    // Only load native SDK on native platforms
    if (this.isNative()) {
      try {
        const PurchasesModule = await import('@revenuecat/purchases-capacitor');
        this.nativePurchases = PurchasesModule.Purchases;
        
        await this.nativePurchases.configure({
          apiKey: REVENUECAT_API_KEY
        });
        if (import.meta.env.DEV) {
          console.log('[RevenueCat] Native SDK configured successfully');
        }
        
        // Set user ID if available
        const appUserId = localStorage.getItem('macrofolio_rc_user_id');
        if (appUserId) {
          await this.nativePurchases.logIn({ appUserId });
        }
      } catch (e) {
        console.error('Failed to initialize RevenueCat native SDK', e);
      }
    } else {
      if (import.meta.env.DEV) {
        console.log('[RevenueCat] Web platform - using demo mode');
      }
    }

    this.initialized = true;
  }

  // Get or create anonymous user ID
  private getOrCreateAppUserId(): string {
    let appUserId = localStorage.getItem('macrofolio_rc_user_id');
    if (!appUserId) {
      appUserId = 'rc_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('macrofolio_rc_user_id', appUserId);
    }
    return appUserId;
  }

  // Get customer info
  async getCustomerInfo(appUserId?: string): Promise<RevenueCatCustomer | null> {
    if (DEMO_MODE) {
      return this.getDemoCustomerInfo(appUserId || 'demo_user');
    }

    // Try native SDK first
    if (this.isNative() && this.nativePurchases) {
      try {
        const customerInfo = await this.nativePurchases.getCustomerInfo();
        return this.mapNativeCustomerInfo(customerInfo);
      } catch (e) {
        console.error('[RevenueCat] Error fetching customer info:', e);
      }
    }

    if (import.meta.env.DEV) {
      console.log('[RevenueCat] Using demo data');
    }
    return this.getDemoCustomerInfo(appUserId || this.getOrCreateAppUserId());
  }

  // Map native customer info to our format
  private mapNativeCustomerInfo(nativeInfo: any): RevenueCatCustomer {
    return {
      subscriber: {
        original_app_user_id: nativeInfo.originalAppUserId || 'unknown',
        entitlements: {
          active: nativeInfo.entitlements || {}
        },
        subscriptions: nativeInfo.subscriptions || {}
      }
    };
  }

  // Get offerings (products)
  async getProducts(): Promise<RevenueCatProduct[]> {
    if (DEMO_MODE) {
      return this.getDemoProducts();
    }

    // Try native SDK first
    if (this.isNative() && this.nativePurchases) {
      try {
        const offerings = await this.nativePurchases.getOfferings();
        if (offerings.current) {
          return offerings.current.availablePackages.map((pkg: any) => ({
            identifier: pkg.product.identifier,
            title: pkg.product.title || 'Premium',
            description: pkg.product.description || 'Premium subscription',
            priceString: pkg.product.priceString || '$9.99',
            price: pkg.product.price || 9.99,
            periodType: 'normal' as const
          }));
        }
      } catch (e) {
        console.error('[RevenueCat] Error fetching products:', e);
      }
    }

    return this.getDemoProducts();
  }

  // Purchase a product
  async purchaseProduct(productId: string): Promise<boolean> {
    if (DEMO_MODE) {
      if (import.meta.env.DEV) {
        console.log('[Demo] Simulating purchase of:', productId);
      }
      const userId = this.getOrCreateAppUserId();
      localStorage.setItem(`macrofolio_purchased_${productId}`, 'true');
      return true;
    }

    // Try native SDK first
    if (this.isNative() && this.nativePurchases) {
      try {
        const offerings = await this.nativePurchases.getOfferings();
        if (offerings.current) {
          const pkg = offerings.current.availablePackages.find(
            (p: any) => p.product.identifier === productId
          );
          if (pkg) {
            await this.nativePurchases.purchasePackage({ identifier: pkg.identifier });
            return true;
          }
        }
        return false;
      } catch (error: any) {
        console.error('[RevenueCat] Purchase error:', error);
        return false;
      }
    }

    return false;
  }

  // Restore purchases
  async restorePurchases(): Promise<boolean> {
    if (DEMO_MODE) {
      if (import.meta.env.DEV) {
        console.log('[Demo] Simulating restore purchases');
      }
      return true;
    }

    if (this.isNative() && this.nativePurchases) {
      try {
        await this.nativePurchases.restorePurchases();
        return true;
      } catch (error) {
        console.error('[RevenueCat] Restore error:', error);
        return false;
      }
    }

    return true;
  }

  // Check if configured
  isConfigured(): boolean {
    return !DEMO_MODE && !!REVENUECAT_API_KEY;
  }

  // Demo mode - get demo customer info
  getDemoCustomerInfo(appUserId: string): RevenueCatCustomer {
    const hasMonthly = localStorage.getItem('macrofolio_purchased_macrofolio_monthly_subscription') === 'true';
    const hasYearly = localStorage.getItem('macrofolio_purchased_macrofolio_yearly_subscription') === 'true';
    const hasLifetime = localStorage.getItem('macrofolio_purchased_macrofolio_lifetime_subscription') === 'true';
    
    const activeEntitlements: Record<string, any> = {};
    
    if (hasMonthly || hasYearly || hasLifetime) {
      const productId = hasLifetime ? 'macrofolio_lifetime_subscription' : 
                       hasYearly ? 'macrofolio_yearly_subscription' : 
                       'macrofolio_monthly_subscription';
      
      activeEntitlements['premium'] = {
        product_identifier: productId,
        expires_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        purchase_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    }

    return {
      subscriber: {
        original_app_user_id: appUserId,
        entitlements: {
          active: activeEntitlements
        },
        subscriptions: {}
      }
    };
  }

  // Demo mode - get demo products
  getDemoProducts(): RevenueCatProduct[] {
    return [
      {
        identifier: 'macrofolio_monthly_subscription',
        title: 'Premium Monthly',
        description: 'Advanced analytics and portfolio insights',
        priceString: '$9.99/mo',
        price: 9.99,
        periodType: 'normal'
      },
      {
        identifier: 'macrofolio_yearly_subscription',
        title: 'Premium Yearly',
        description: 'Best value - 2 months free',
        priceString: '$99.99/yr',
        price: 99.99,
        periodType: 'normal'
      },
      {
        identifier: 'macrofolio_lifetime_subscription',
        title: 'Lifetime Access',
        description: 'One-time payment, lifetime updates',
        priceString: '$299.99',
        price: 299.99,
        periodType: 'normal'
      }
    ];
  }
}

export default RevenueCatService.getInstance();
