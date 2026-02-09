import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Asset type definition
export interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: 'stocks' | 'crypto' | 'gold' | 'real_estate' | 'fixed_income' | 'etf';
  quantity: number;
  currentPrice: number;
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
  isPremium?: boolean;
}

// Portfolio summary
export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

// Demo assets data
const DEMO_ASSETS: Asset[] = [
  {
    id: '1',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    type: 'stocks',
    quantity: 10,
    currentPrice: 178.50,
    purchasePrice: 150.00,
    purchaseDate: '2024-01-15',
    notes: 'Long-term growth',
  },
  {
    id: '2',
    name: 'Bitcoin',
    symbol: 'BTC',
    type: 'crypto',
    quantity: 0.5,
    currentPrice: 67500.00,
    purchasePrice: 42000.00,
    purchaseDate: '2023-06-20',
    notes: 'HODL',
  },
  {
    id: '3',
    name: 'Vanguard Total Stock',
    symbol: 'VTI',
    type: 'etf',
    quantity: 25,
    currentPrice: 245.30,
    purchasePrice: 220.00,
    purchaseDate: '2024-02-01',
  },
  {
    id: '4',
    name: 'Gold Bullion',
    symbol: 'GOLD',
    type: 'gold',
    quantity: 5,
    currentPrice: 2045.00,
    purchasePrice: 1900.00,
    purchaseDate: '2023-12-10',
    notes: 'Inflation hedge',
  },
  {
    id: '5',
    name: 'US Treasury Bond',
    symbol: 'USTB',
    type: 'fixed_income',
    quantity: 50,
    currentPrice: 98.50,
    purchasePrice: 100.00,
    purchaseDate: '2024-03-01',
    notes: 'Safe haven',
  },
  {
    id: '6',
    name: 'Ethereum',
    symbol: 'ETH',
    type: 'crypto',
    quantity: 3,
    currentPrice: 3450.00,
    purchasePrice: 2800.00,
    purchaseDate: '2024-01-05',
    notes: 'DeFi exposure',
  },
];

// Portfolio context type
interface PortfolioContextType {
  assets: Asset[];
  loading: boolean;
  summary: PortfolioSummary | null;
  addAsset: (asset: Omit<Asset, 'id'>) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  refreshPrices: () => Promise<void>;
  isDemoMode: boolean;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export const usePortfolio = () => {
  const context = React.useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
};

// Provider component
interface PortfolioProviderProps {
  children: React.ReactNode;
  isDemoMode?: boolean;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({ 
  children, 
  isDemoMode = false 
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);

  // Load demo assets on mount
  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      
      if (isDemoMode) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setAssets(DEMO_ASSETS);
      } else {
        // In production, load from Supabase
        await new Promise(resolve => setTimeout(resolve, 500));
        setAssets([]);
      }
      
      setLoading(false);
    };
    
    loadAssets();
  }, [isDemoMode]);

  // Calculate summary when assets change
  useEffect(() => {
    if (assets.length === 0) {
      setSummary(null);
      return;
    }

    const totalValue = assets.reduce((sum, asset) => sum + (asset.quantity * asset.currentPrice), 0);
    const totalCost = assets.reduce((sum, asset) => sum + (asset.quantity * asset.purchasePrice), 0);
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    
    // Simulate day change (random between -2% and +2%)
    const dayChangePercent = (Math.random() * 4) - 2;
    const dayChange = totalValue * (dayChangePercent / 100);

    setSummary({
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent,
      dayChange,
      dayChangePercent,
    });
  }, [assets]);

  const addAsset = useCallback(async (asset: Omit<Asset, 'id'>) => {
    const newAsset: Asset = {
      ...asset,
      id: crypto.randomUUID(),
    };
    setAssets(prev => [...prev, newAsset]);
  }, []);

  const updateAsset = useCallback(async (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(asset => 
      asset.id === id ? { ...asset, ...updates } : asset
    ));
  }, []);

  const deleteAsset = useCallback(async (id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
  }, []);

  const refreshPrices = useCallback(async () => {
    // Simulate price refresh with random changes
    setAssets(prev => prev.map(asset => {
      const change = (Math.random() * 0.04) - 0.02; // -2% to +2%
      const newPrice = asset.currentPrice * (1 + change);
      return { ...asset, currentPrice: newPrice };
    }));
  }, []);

  const value: PortfolioContextType = {
    assets,
    loading,
    summary,
    addAsset,
    updateAsset,
    deleteAsset,
    refreshPrices,
    isDemoMode,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export default PortfolioProvider;

