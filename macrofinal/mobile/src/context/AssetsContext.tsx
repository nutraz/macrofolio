import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Asset, AssetType } from '../types';
import { loadAssets, saveAssets } from '../storage/assetsStorage';

type AssetDraft = {
  name: string;
  symbol: string;
  type: AssetType;
  category?: string;
  amount: number;
  price: number;
  changePct: number;
};

type AssetsContextValue = {
  assets: Asset[];
  loading: boolean;
  addAsset: (draft: AssetDraft) => Promise<Asset>;
  updateAsset: (assetId: string, updates: Partial<AssetDraft>) => Promise<Asset>;
  deleteAsset: (assetId: string) => Promise<void>;
  getAssetById: (assetId: string) => Asset | undefined;
};

const AssetsContext = createContext<AssetsContextValue | null>(null);

function nowIso() {
  return new Date().toISOString();
}

function generateId() {
  // Good enough for hackathon; avoids extra dependency.
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Mock assets for development/demo
const MOCK_ASSETS: Asset[] = [
  {
    id: 'mock-aapl',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    type: 'Stock',
    category: 'Technology',
    amount: 10,
    price: 175.34,
    changePct: 1.25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    type: 'Crypto',
    category: 'Cryptocurrency',
    amount: 0.5,
    price: 51234.56,
    changePct: -0.75,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-eth',
    name: 'Ethereum',
    symbol: 'ETH',
    type: 'Crypto',
    category: 'Cryptocurrency',
    amount: 2.5,
    price: 3456.78,
    changePct: 2.15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-tsla',
    name: 'Tesla Inc.',
    symbol: 'TSLA',
    type: 'Stock',
    category: 'Automotive',
    amount: 5,
    price: 245.67,
    changePct: -1.50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function AssetsProvider({ children }: { children: React.ReactNode }) {
  // Start with empty array - mock assets will be loaded after mount
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // Try to load from storage first
      const loaded = await loadAssets();
      
      if (!mounted) return;
      
      // If no assets in storage, use mock data for demo
      if (loaded.length === 0) {
        setAssets(MOCK_ASSETS);
        // Save mock data to storage for persistence
        await saveAssets(MOCK_ASSETS);
      } else {
        setAssets(loaded);
      }
      
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (next: Asset[]) => {
    setAssets(next);
    await saveAssets(next);
  }, []);

  const addAsset = useCallback(
    async (draft: AssetDraft) => {
      const ts = nowIso();
      const nextAsset: Asset = {
        id: generateId(),
        name: draft.name.trim(),
        symbol: draft.symbol.trim().toUpperCase(),
        type: draft.type,
        category: draft.category?.trim() ? draft.category.trim() : undefined,
        amount: Number(draft.amount) || 0,
        price: Number(draft.price) || 0,
        changePct: Number(draft.changePct) || 0,
        createdAt: ts,
        updatedAt: ts,
      };

      const next = [nextAsset, ...assets];
      await persist(next);
      return nextAsset;
    },
    [assets, persist],
  );

  const updateAsset = useCallback(
    async (assetId: string, updates: Partial<AssetDraft>) => {
      const ts = nowIso();
      const next = assets.map((asset) => {
        if (asset.id !== assetId) return asset;
        return {
          ...asset,
          ...updates,
          name: updates.name !== undefined ? updates.name.trim() : asset.name,
          symbol:
            updates.symbol !== undefined
              ? updates.symbol.trim().toUpperCase()
              : asset.symbol,
          category:
            updates.category !== undefined
              ? updates.category.trim() || undefined
              : asset.category,
          updatedAt: ts,
        };
      });

      const updated = next.find((a) => a.id === assetId);
      if (!updated) throw new Error('Asset not found');

      await persist(next);
      return updated;
    },
    [assets, persist],
  );

  const deleteAsset = useCallback(
    async (assetId: string) => {
      const next = assets.filter((a) => a.id !== assetId);
      await persist(next);
    },
    [assets, persist],
  );

  const getAssetById = useCallback(
    (assetId: string) => assets.find((a) => a.id === assetId),
    [assets],
  );

  const value = useMemo<AssetsContextValue>(
    () => ({
      assets,
      loading,
      addAsset,
      updateAsset,
      deleteAsset,
      getAssetById,
    }),
    [assets, loading, addAsset, updateAsset, deleteAsset, getAssetById],
  );

  return <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>;
}

export function useAssets() {
  const ctx = useContext(AssetsContext);
  if (!ctx) throw new Error('useAssets must be used within AssetsProvider');
  return ctx;
}
