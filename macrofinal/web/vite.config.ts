import { defineConfig } from 'vite'
import path from 'path'

// =============================================================================
// SECURITY: Explicit allow-list for environment variables
// =============================================================================

const PUBLIC_ENV_VARS = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  VITE_CHAIN_ID: process.env.VITE_CHAIN_ID || '80002',
  VITE_RPC_URL: process.env.VITE_RPC_URL,
  VITE_EXPLORER_URL: process.env.VITE_EXPLORER_URL,
  VITE_CONTRACT_ADDRESS: process.env.VITE_CONTRACT_ADDRESS,
  VITE_DEMO_MODE: process.env.VITE_DEMO_MODE,
  VITE_ENABLE_ANALYTICS: process.env.VITE_ENABLE_ANALYTICS || 'false',
  VITE_NETWORK_NAME: process.env.VITE_NETWORK_NAME || 'Polygon Amoy',
};

export default defineConfig({
  root: path.resolve(__dirname),
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
      },
    },
  },
  server: {
    port: 5173,
    allowedHosts: ['.netlify.app'],
  },
  define: {
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
