import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Asset, AssetType } from '../lib/types';

interface AssetsState {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  totalValue: number;
}

/**
 * Hook for managing portfolio assets
 */
export function useAssets(userId: string | null) {
  const [state, setState] = useState<AssetsState>({
    assets: [],
    loading: false,
    error: null,
    totalValue: 0
  });

  const fetchAssets = useCallback(async () => {
    if (!userId) {
      setState({ assets: [], loading: false, error: null, totalValue: 0 });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const assets = data || [];
      const totalValue = assets.reduce((sum, asset) => {
        // Handle both computed and stored total_value
        const value = asset.total_value ?? (asset.quantity * asset.price_per_unit);
        return sum + value;
      }, 0);

      setState({
        assets,
        loading: false,
        error: null,
        totalValue
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch assets'
      }));
    }
  }, [userId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const addAsset = useCallback(async (asset: Omit<Asset, 'id' | 'created_at' | 'total_value'>) => {
    if (!userId) return { data: null, error: new Error('Not authenticated') };

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('assets')
        .insert({ ...asset, user_id: userId })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const newAssets = [data, ...state.assets];
      const totalValue = newAssets.reduce((sum, a) => {
        const value = a.total_value ?? (a.quantity * a.price_per_unit);
        return sum + value;
      }, 0);

      setState(prev => ({
        ...prev,
        assets: newAssets,
        totalValue,
        loading: false,
        error: null
      }));

      return { data, error: null };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to add asset'
      }));
      return { data: null, error };
    }
  }, [userId, state.assets]);

  const updateAsset = useCallback(async (id: string, updates: Partial<Asset>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const newAssets = state.assets.map(a => a.id === id ? data : a);
      const totalValue = newAssets.reduce((sum, a) => {
        const value = a.total_value ?? (a.quantity * a.price_per_unit);
        return sum + value;
      }, 0);

      setState(prev => ({
        ...prev,
        assets: newAssets,
        totalValue,
        loading: false,
        error: null
      }));

      return { data, error: null };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to update asset'
      }));
      return { data: null, error };
    }
  }, [state.assets]);

  const deleteAsset = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const newAssets = state.assets.filter(a => a.id !== id);
      const totalValue = newAssets.reduce((sum, a) => {
        const value = a.total_value ?? (a.quantity * a.price_per_unit);
        return sum + value;
      }, 0);

      setState(prev => ({
        ...prev,
        assets: newAssets,
        totalValue,
        loading: false,
        error: null
      }));

      return { error: null };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to delete asset'
      }));
      return { error };
    }
  }, [state.assets]);

  const getAssetsByType = useCallback((type: AssetType) => {
    return state.assets.filter(a => a.asset_type === type);
  }, [state.assets]);

  return {
    ...state,
    refetch: fetchAssets,
    addAsset,
    updateAsset,
    deleteAsset,
    getAssetsByType
  };
}

export default useAssets;

