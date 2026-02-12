// Database Types for Supabase

// Asset Types
export type AssetType = 
  | 'stock' 
  | 'crypto' 
  | 'gold' 
  | 'real_estate' 
  | 'nft' 
  | 'fixed_income';

// Transaction Types
export type TransactionType = 'buy' | 'sell' | 'transfer';

// Transaction Status
export type TransactionStatus = 'pending' | 'anchored';

// User Profile (Supabase Auth-linked)
export interface User {
  id: string;
  email: string;
  wallet_address?: string | null;
  created_at: string;
}

// Asset
export interface Asset {
  id: string;
  user_id: string;
  asset_type: AssetType;
  name: string;
  symbol?: string | null;
  quantity: number;
  price_per_unit: number;
  total_value?: number; // Computed
  created_at: string;
}

// Transaction
export interface Transaction {
  id: string;
  user_id: string;
  asset_id?: string | null;
  type: TransactionType;
  amount: number;
  tx_hash?: string | null;
  status: TransactionStatus;
  created_at: string;
  // Joined data
  assets?: Asset | null;
}

// Anchor (Blockchain Proof)
export interface Anchor {
  id: string;
  user_id: string;
  action_type: string;
  data_hash: string;
  chain_tx?: string | null;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

// Portfolio Summary
export interface PortfolioSummary {
  totalValue: number;
  todayChange: number;
  todayChangePercent: number;
  totalAssets: number;
  assetsByType: Record<AssetType, number>;
}

// UI/Demo Portfolio Types (local-only data model)
export type PortfolioAssetType =
  | 'stocks'
  | 'crypto'
  | 'gold'
  | 'real_estate'
  | 'fixed_income'
  | 'etf';

export interface PortfolioAsset {
  id: string;
  name: string;
  symbol: string;
  type: PortfolioAssetType;
  quantity: number;
  currentPrice: number;
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
  isPremium?: boolean;
}

export interface PortfolioContextSummary {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

// Web3 Types (EVM/MetaMask)
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  networkName: string | null;
  balance: string | null;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// ICP Wallet State (Internet Identity)
export interface ICPWalletState {
  isConnected: boolean;
  principal: string | null;
  network: string | null;
  loading: boolean;
  error: string | null;
}

export interface ICPNetworkConfig {
  name: string;
  host: string;
  explorerUrl: string;
}

// Unified Auth State combining all authentication methods
export interface UnifiedAuthState {
  isConnected: boolean;
  authMethod: 'demo' | 'metamask' | 'icp' | 'supabase' | null;
  userId: string | null;
  displayAddress: string | null;
  network: string | null;
  dataSource: string;
}

// Anchor Result
export interface AnchorResult {
  hash: string;
  txHash: string;
  timestamp: number;
}

// Demo Mode Data
export interface DemoAsset {
  id: number;
  name: string;
  symbol: string;
  type: string;
  quantity: number;
  price: number;
  value: number;
  change24h: number;
}
