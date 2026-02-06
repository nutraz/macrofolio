import { useState, useEffect, useCallback } from 'react';
import { useAlerts as useAlertsContext } from '../context/AlertsContext';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: 'stocks' | 'crypto' | 'gold' | 'real_estate' | 'fixed_income' | 'etf';
  price: number;
}

export const useAlerts = () => {
  const context = useAlertsContext();
  const [assets, setAssets] = useState<Asset[]>([]);
  
  // In a real app, this would come from your portfolio context or API
  // For now, we'll mock some crypto assets for demo purposes
  useEffect(() => {
    // This would be replaced with actual asset data from your portfolio
    const mockAssets: Asset[] = [
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', type: 'crypto', price: 67500 },
      { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', type: 'crypto', price: 3450 },
      { id: 'solana', name: 'Solana', symbol: 'SOL', type: 'crypto', price: 145 },
      { id: 'cardano', name: 'Cardano', symbol: 'ADA', type: 'crypto', price: 0.45 },
      { id: 'ripple', name: 'XRP', symbol: 'XRP', type: 'crypto', price: 0.62 },
      { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', type: 'crypto', price: 7.20 },
      { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', type: 'crypto', price: 14.50 },
      { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', type: 'crypto', price: 35.80 },
    ];
    setAssets(mockAssets);
  }, []);
  
  const createAlertWithAsset = useCallback(async (
    assetId: string,
    condition: 'price_above' | 'price_below' | 'percent_up' | 'percent_down' | 'volume_spike',
    threshold: number,
    notificationType: 'in_app' | 'email' | 'push' = 'in_app'
  ) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }
    
    return context.createAlert({
      assetId: asset.id,
      assetName: asset.name,
      assetSymbol: asset.symbol,
      assetType: asset.type,
      condition,
      threshold,
      notificationType,
    }, asset.price);
  }, [assets, context]);
  
  return {
    ...context,
    assets,
    createAlert: createAlertWithAsset,
  };
};

