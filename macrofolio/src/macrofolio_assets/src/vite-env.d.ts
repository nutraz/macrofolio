/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REVENUECAT_API_KEY: string;
  readonly VITE_DEMO_MODE: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type declarations for @revenuecat/purchases-react-web
// This file provides TypeScript support until the package is installed

declare module '@revenuecat/purchases-react-web' {
  import React from 'react';

  interface PurchasesConfiguration {
    apiKey: string;
  }

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

  interface RevenueCatProviderProps {
    apiKey: string;
    children: React.ReactNode;
  }

  const RevenueCatProvider: React.FC<RevenueCatProviderProps>;
  
  const Purchases: {
    configure: (config: PurchasesConfiguration) => void;
    getCustomerInfo: () => Promise<CustomerInfo>;
    getOfferings: () => Promise<Offerings>;
    purchaseProduct: (productIdentifier: string) => Promise<CustomerInfo>;
    restorePurchases: () => Promise<CustomerInfo>;
  };

  export { RevenueCatProvider, Purchases, CustomerInfo, Offerings, Product, Offering };
}

