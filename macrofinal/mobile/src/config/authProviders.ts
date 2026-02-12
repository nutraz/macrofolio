export const AUTH_PROVIDERS = {
  email: true,
  google: true,
  facebook: false,
  discord: true,
  x: true,

  // This app uses WalletConnect v2 for wallet sign-in.
  // Supabase also has a "Web3 Wallet" provider, but wiring that end-to-end is separate.
  walletconnect: true,

  // Keep hidden unless you enable it in Supabase + configure it.
  apple: false,
} as const;

