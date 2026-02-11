import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Asset } from '../types';

const STORAGE_KEY = 'macrofolio.assets.v1';

export async function loadAssets(): Promise<Asset[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Asset[];
  } catch {
    return [];
  }
}

export async function saveAssets(assets: Asset[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
}

