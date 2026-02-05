/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REVENUECAT_API_KEY?: string;
  readonly VITE_DEMO_MODE?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type declarations for native modules (only available on mobile platforms)
declare global {
  const Capacitor: {
    isNativePlatform(): boolean;
  };
}

declare module '@capacitor/core' {
  export const Capacitor: {
    isNativePlatform(): boolean;
  };
}

declare module '@revenuecat/purchases-capacitor' {
  export const Purchases: any;
}
