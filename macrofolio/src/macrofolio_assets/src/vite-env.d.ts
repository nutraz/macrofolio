/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_CONTRACT_ADDRESS: string;
  // Add any other VITE_ env vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

