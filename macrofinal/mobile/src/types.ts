export type AssetType = 'Stock' | 'Crypto' | 'Commodity' | 'Real Estate';

export type Asset = {
  id: string;
  name: string;
  symbol: string;
  type: AssetType;
  category?: string;
  amount: number;
  price: number;
  changePct: number; // daily change percentage (manual for MVP)
  createdAt: string;
  updatedAt: string;
};
