import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// =============================================================================
// SECURITY: Explicit allow-list for environment variables
// DO NOT use wildcard prefixes (CANISTER_*, DFX_*) as they expose sensitive data
// =============================================================================

const PUBLIC_ENV_VARS = {
  // Required for Supabase (anon key is public by design)
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  
  // Network configuration
  VITE_CHAIN_ID: process.env.VITE_CHAIN_ID || '80002',
  VITE_RPC_URL: process.env.VITE_RPC_URL,
  VITE_EXPLORER_URL: process.env.VITE_EXPLORER_URL,
  
  // Contract address (public once deployed)
  VITE_CONTRACT_ADDRESS: process.env.VITE_CONTRACT_ADDRESS,
  
  // Feature flags
  // SECURITY: Default to false (live mode) for demo mode to prevent accidental demo activation
  VITE_DEMO_MODE: process.env.VITE_DEMO_MODE,
  VITE_ENABLE_ANALYTICS: process.env.VITE_ENABLE_ANALYTICS || 'false',
  
  // Network name for display
  VITE_NETWORK_NAME: process.env.VITE_NETWORK_NAME || 'Polygon Amoy',
};

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      external: ['@revenuecat/purchases-capacitor', '@capacitor/core'],
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          ethers: ['ethers'],
          supabase: ['@supabase/supabase-js'],
          recharts: ['recharts'],
        },
      },
    },
  },
  server: {
    port: 5173,
    allowedHosts: ['.netlify.app'],
  },
  define: {
    // Expose only explicitly allowed environment variables
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(PUBLIC_ENV_VARS.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(PUBLIC_ENV_VARS.VITE_SUPABASE_ANON_KEY),
    'import.meta.env.VITE_CHAIN_ID': JSON.stringify(PUBLIC_ENV_VARS.VITE_CHAIN_ID),
    'import.meta.env.VITE_RPC_URL': JSON.stringify(PUBLIC_ENV_VARS.VITE_RPC_URL),
    'import.meta.env.VITE_EXPLORER_URL': JSON.stringify(PUBLIC_ENV_VARS.VITE_EXPLORER_URL),
    'import.meta.env.VITE_CONTRACT_ADDRESS': JSON.stringify(PUBLIC_ENV_VARS.VITE_CONTRACT_ADDRESS),
    'import.meta.env.VITE_DEMO_MODE': JSON.stringify(PUBLIC_ENV_VARS.VITE_DEMO_MODE),
    'import.meta.env.VITE_ENABLE_ANALYTICS': JSON.stringify(PUBLIC_ENV_VARS.VITE_ENABLE_ANALYTICS),
    'import.meta.env.VITE_NETWORK_NAME': JSON.stringify(PUBLIC_ENV_VARS.VITE_NETWORK_NAME),
  },
});
