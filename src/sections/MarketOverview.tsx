import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, RefreshCw, Bitcoin, Activity, 
  Clock, Settings, Check, X, Zap, ArrowUpRight, ArrowDownRight, 
  CircleDot, ExternalLink, Wifi, WifiOff
} from 'lucide-react';

// Asset type definition
interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  icon: React.ReactNode;
  color: string;
  binanceSymbol: string;
}

// All available assets to track (using Binance symbols)
const ALL_ASSETS: MarketAsset[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 0, change24h: 0, changePercent24h: 0, high24h: 0, low24h: 0, volume24h: 0, icon: null, color: 'orange', binanceSymbol: 'btcusdt' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 0, change24h: 0, changePercent24h: 0, high24h: 0, low24h: 0, volume24h: 0, icon: null, color: 'blue', binanceSymbol: 'ethusdt' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', price: 0, change24h: 0, changePercent24h: 0, high24h: 0, low24h: 0, volume24h: 0, icon: null, color: 'purple', binanceSymbol: 'solusdt' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', price: 0, change24h: 0, changePercent24h: 0, high24h: 0, low24h: 0, volume24h: 0, icon: null, color: 'yellow', binanceSymbol: 'bnbusdt' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', price: 0, change24h: 0, changePercent24h: 0, high24h: 0, low24h: 0, volume24h: 0, icon: null, color: 'gray', binanceSymbol: 'xrpusdt' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0, change24h: 0, changePercent24h: 0, high24h: 0, low24h: 0, volume24h: 0, icon: null, color: 'blue', binanceSymbol: 'adausdt' },
  { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', price: 0, change24h: 0, changePercent24h: 0, high24h: 0, low24h: 0, volume24h: 0, icon: null, color: 'red', binanceSymbol: 'avaxusdt' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', price: 0, change24h: 0, changePercent24h: 0, high24h: 0, low24h: 0, volume24h: 0, icon: null, color: 'pink', binanceSymbol: 'dotusdt' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', price: 0, change24h: 0, changePercent24h: 0, high24h: 0, low24h: 0, volume24h: 0, icon: null, color: 'blue', binanceSymbol: 'linkusdt' },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon', price: 0, change24h: 0, changePercent24h: 0, high24h: 0, low24h: 0, volume24h: 0, icon: null, color: 'purple', binanceSymbol: 'maticusdt' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', price: 0, change24h: 0, changePercent24h: 0, high24h: 0, low24h: 0, volume24h: 0, icon: null, color: 'yellow', binanceSymbol: 'dogeusdt' },
  { id: 'shibainu', symbol: 'SHIB', name: 'Shiba Inu', price: 0, change24h: 0, changePercent24h: 0, high24h: 0, low24h: 0, volume24h: 0, icon: null, color: 'brown', binanceSymbol: 'shibusdt' },
];

// Initialize icons
ALL_ASSETS.forEach(asset => {
  const icons: { [key: string]: React.ReactNode } = {
    orange: <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20"><Bitcoin className="w-5 h-5 text-white" /></div>,
    blue: <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20"><span className="text-white font-bold text-sm">Ξ</span></div>,
    purple: <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/20"><span className="text-white font-bold text-sm">S</span></div>,
    yellow: <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20"><span className="text-white font-bold text-sm">$</span></div>,
    gray: <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg shadow-gray-500/20"><span className="text-white font-bold text-xs">X</span></div>,
    red: <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20"><span className="text-white font-bold text-sm">A</span></div>,
    pink: <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/20"><span className="text-white font-bold text-sm">D</span></div>,
    brown: <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-700/20"><span className="text-white font-bold text-xs">S</span></div>,
  };
  asset.icon = icons[asset.color] || icons.gray;
});

// Get icon based on color
const getIcon = (color: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    orange: <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600"><Bitcoin className="w-3 h-3 text-white m-1" /></div>,
    blue: <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"><span className="text-white text-[8px] font-bold">Ξ</span></div>,
    purple: <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center"><span className="text-white text-[8px] font-bold">S</span></div>,
    yellow: <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center"><span className="text-white text-[8px] font-bold">$</span></div>,
    gray: <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center"><span className="text-white text-[8px] font-bold">X</span></div>,
    red: <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center"><span className="text-white text-[8px] font-bold">A</span></div>,
    pink: <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center"><span className="text-white text-[8px] font-bold">D</span></div>,
    brown: <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center"><span className="text-white text-[8px] font-bold">S</span></div>,
  };
  return icons[color] || icons.gray;
};

// Format currency
const formatCurrency = (value: number, decimals = 2) => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value < 0.01) return `$${value.toFixed(6)}`;
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Mini sparkline for price movement
const MiniSparkline: React.FC<{ price: number; prevPrice: number }> = ({ price, prevPrice }) => {
  const isPositive = price >= prevPrice;
  const color = isPositive ? '#22c55e' : '#ef4444';
  
  return (
    <div className="flex items-center gap-1">
      <div className={`w-0 h-0 border-l-[4px] border-l-transparent ${isPositive ? 'border-b-[8px] border-b-success' : 'border-t-[8px] border-t-danger'}`} />
      <div className={`w-1.5 h-3 rounded-full ${isPositive ? 'bg-success' : 'bg-danger'}`} />
      <div className={`w-1 h-2 rounded-full ${isPositive ? 'bg-success/70' : 'bg-danger/70'}`} />
    </div>
  );
};

// Real-time price display with flash effect
const LivePrice: React.FC<{ price: number; prevPrice: number }> = ({ price, prevPrice }) => {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (price !== prevPrice) {
      setDirection(price > prevPrice ? 'up' : 'down');
      const timer = setTimeout(() => setDirection(null), 500);
      return () => clearTimeout(timer);
    }
  }, [price, prevPrice]);

  return (
    <span className={`text-2xl font-bold transition-all duration-300 ${
      direction === 'up' ? 'text-success scale-105' : 
      direction === 'down' ? 'text-danger scale-105' : 
      'text-textPrimary'
    }`}>
      {formatCurrency(price, price < 1 ? 6 : 2)}
    </span>
  );
};

// Asset card component
const LiveAssetCard: React.FC<{ asset: MarketAsset; prevPrice: number }> = ({ asset, prevPrice }) => {
  const isPositive = asset.changePercent24h >= 0;

  return (
    <div className="group relative bg-gradient-to-br from-card/80 to-card/40 rounded-2xl p-5 border border-border/50 hover:border-info/30 transition-all duration-300 hover:shadow-xl hover:shadow-info/10 hover:-translate-y-1 overflow-hidden">
      {/* Live indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <CircleDot className="w-2 h-2 text-success animate-pulse" />
      </div>

      {/* Background glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        isPositive ? 'bg-gradient-to-br from-success/5 to-transparent' : 'bg-gradient-to-br from-danger/5 to-transparent'
      }`} />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {asset.icon}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-textPrimary">{asset.symbol}</span>
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 text-success" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-danger" />
              )}
            </div>
            <span className="text-xs text-textMuted">{asset.name}</span>
          </div>
        </div>
        
        {/* 24h Change Badge */}
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
          isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
        </div>
      </div>

      {/* Live Price */}
      <div className="relative mb-3">
        <LivePrice price={asset.price} prevPrice={prevPrice} />
        <MiniSparkline price={asset.price} prevPrice={prevPrice} />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex flex-col">
          <span className="text-textMuted">24h High</span>
          <span className="text-textSecondary">{formatCurrency(asset.high24h)}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-textMuted">24h Low</span>
          <span className="text-textSecondary">{formatCurrency(asset.low24h)}</span>
        </div>
      </div>
    </div>
  );
};

// Header component
const MarketHeader: React.FC<{ 
  lastUpdated: Date | null; 
  onRefresh: () => void;
  onSettings: () => void;
  refreshing: boolean;
  visibleCount: number;
  isConnected: boolean;
}> = ({ lastUpdated, onRefresh, onSettings, refreshing, visibleCount, isConnected }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="p-3 bg-gradient-to-br from-info/20 to-info/5 rounded-xl">
          <Activity className="w-6 h-6 text-info" />
        </div>
        <div className={`absolute -top-1 -right-1 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          isConnected ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
        }`}>
          {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isConnected ? 'Live' : 'Offline'}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-textPrimary">Live Market</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-textMuted">
          <Zap className="w-4 h-4 text-warning" />
          <span>Binance WebSocket</span>
          {lastUpdated && (
            <>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lastUpdated.toLocaleTimeString()}
              </span>
            </>
          )}
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3">
      {/* Stats */}
      <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-bg/50 rounded-lg border border-border/50">
        <span className="text-sm text-textMuted">{visibleCount} assets</span>
        <span className="text-xs text-success flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Connected
        </span>
      </div>

      {/* Settings */}
      <button
        onClick={onSettings}
        className="btn-secondary flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Track</span>
        <span className="bg-info/20 text-info px-2 py-0.5 rounded-full text-xs font-semibold">
          {visibleCount}
        </span>
      </button>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="btn-primary flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Updating...' : 'Refresh'}
      </button>
    </div>
  </div>
);

// Settings dropdown
const AssetSettings: React.FC<{
  visibleAssets: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onClose: () => void;
}> = ({ visibleAssets, onToggle, onSelectAll, onDeselectAll, onClose }) => (
  <div className="absolute top-24 right-0 z-50 w-80 bg-bg/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
    <div className="p-4 border-b border-border/50">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-textPrimary">Select Assets</h4>
        <button onClick={onClose} className="p-1 hover:bg-bg rounded-lg transition-colors">
          <X className="w-5 h-5 text-textMuted" />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button 
          onClick={onSelectAll}
          className="text-xs text-info hover:underline flex items-center gap-1"
        >
          <Check className="w-3 h-3" /> Select All
        </button>
        <span className="text-border">|</span>
        <button 
          onClick={onDeselectAll}
          className="text-xs text-danger hover:underline flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Deselect All
        </button>
      </div>
    </div>
    <div className="max-h-80 overflow-y-auto p-2 space-y-1">
      {ALL_ASSETS.map(asset => (
        <button
          key={asset.id}
          onClick={() => onToggle(asset.id)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
            visibleAssets.includes(asset.id) 
              ? 'bg-info/10 text-info' 
              : 'hover:bg-bg text-textSecondary'
          }`}
        >
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            visibleAssets.includes(asset.id) 
              ? 'border-info bg-info' 
              : 'border-border'
          }`}>
            {visibleAssets.includes(asset.id) && <Check className="w-3 h-3 text-white" />}
          </div>
          {asset.icon}
          <div className="flex-1 text-left">
            <span className="font-semibold text-sm">{asset.symbol}</span>
            <span className="text-xs text-textMuted ml-2">{asset.name}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

// Stats footer
const StatsFooter: React.FC<{ assets: MarketAsset[] }> = ({ assets }) => {
  if (assets.length < 2) return null;

  const best = assets.reduce((a, b) => a.changePercent24h > b.changePercent24h ? a : b);
  const worst = assets.reduce((a, b) => a.changePercent24h < b.changePercent24h ? a : b);
  const avgChange = assets.reduce((sum, a) => sum + a.changePercent24h, 0) / assets.length;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-border/50">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="text-sm text-textMuted">Best:</span>
          <span className="text-sm font-semibold text-success">
            {best.symbol} +{best.changePercent24h.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-danger" />
          <span className="text-sm text-textMuted">Worst:</span>
          <span className="text-sm font-semibold text-danger">
            {worst.symbol} {worst.changePercent24h.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-info" />
          <span className="text-sm text-textMuted">Avg:</span>
          <span className={`text-sm font-semibold ${avgChange >= 0 ? 'text-success' : 'text-danger'}`}>
            {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
          </span>
        </div>
      </div>
      
      <a
        href="https://www.binance.com/en/trade"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-sm text-textMuted hover:text-info transition-colors"
      >
        Trade on Binance
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
};

const MarketOverview: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketAsset[]>(ALL_ASSETS.map(a => ({ ...a, prevPrice: 0 })));
  const [prevPrices, setPrevPrices] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  
  // Persist visible assets
  const [visibleAssets, setVisibleAssets] = useState<string[]>(() => {
    const saved = localStorage.getItem('macrofolio-visible-assets');
    return saved ? JSON.parse(saved) : ALL_ASSETS.slice(0, 6).map(a => a.id);
  });

  useEffect(() => {
    localStorage.setItem('macrofolio-visible-assets', JSON.stringify(visibleAssets));
  }, [visibleAssets]);

  const toggleAsset = (assetId: string) => {
    setVisibleAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const selectAll = () => setVisibleAssets(ALL_ASSETS.map(a => a.id));
  const deselectAll = () => setVisibleAssets([]);

  // Fetch 24h ticker data via REST API
  const fetch24hData = useCallback(async () => {
    try {
      const symbols = visibleAssets.map(id => {
        const asset = ALL_ASSETS.find(a => a.id === id);
        return asset?.binanceSymbol;
      }).filter(Boolean).join(',');

      if (symbols.length === 0) return;

      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbols.map((s: string) => `"${s.toUpperCase()}"`).join(',')}]`
      );

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();

      setMarketData(prev => prev.map(asset => {
        const ticker = data.find((t: any) => t.symbol.toLowerCase() === asset.binanceSymbol);
        if (ticker) {
          return {
            ...asset,
            change24h: parseFloat(ticker.priceChange),
            changePercent24h: parseFloat(ticker.priceChangePercent),
            high24h: parseFloat(ticker.highPrice),
            low24h: parseFloat(ticker.lowPrice),
            volume24h: parseFloat(ticker.volume),
          };
        }
        return asset;
      }));

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching 24h data:', err);
    }
  }, [visibleAssets]);

  // Connect to WebSocket for real-time prices
  useEffect(() => {
    const visibleSymbols = visibleAssets
      .map(id => {
        const asset = ALL_ASSETS.find(a => a.id === id);
        return asset?.binanceSymbol;
      })
      .filter(Boolean);

    if (visibleSymbols.length === 0) return;

    // Connect to Binance WebSocket
    const streams = visibleSymbols.map(s => `${s}@trade`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setLoading(false);
      // Fetch 24h data on connection
      fetch24hData();
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.data && message.data.e === 'trade') {
        const { s, p } = message.data; // symbol, price
        const price = parseFloat(p);
        const binanceSymbol = s.toLowerCase();

        setMarketData(prev => prev.map(asset => {
          if (asset.binanceSymbol === binanceSymbol) {
            setPrevPrices(prevPrices => ({
              ...prevPrices,
              [asset.id]: prevPrices[asset.id] ?? asset.price
            }));
            return { ...asset, price };
          }
          return asset;
        }));
        setLastUpdated(new Date());
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [visibleAssets, fetch24hData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetch24hData().finally(() => setRefreshing(false));
  };

  const visibleMarketData = useMemo(() => {
    if (visibleAssets.length === 0) return marketData;
    return marketData.filter(a => visibleAssets.includes(a.id));
  }, [marketData, visibleAssets]);

  // Loading skeleton
  if (loading && marketData.every(a => a.price === 0)) {
    return (
      <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-border rounded-xl animate-pulse" />
          <div>
            <div className="h-6 w-40 bg-border rounded animate-pulse" />
            <div className="h-4 w-32 bg-border rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-bg/50 rounded-2xl p-5 animate-pulse">
              <div className="h-6 w-20 bg-border rounded mb-3" />
              <div className="h-8 w-32 bg-border rounded mb-4" />
              <div className="h-4 bg-border rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Settings Dropdown */}
      {showSettings && (
        <AssetSettings
          visibleAssets={visibleAssets}
          onToggle={toggleAsset}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div className="bg-gradient-to-br from-card/80 to-card/40 border border-border/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        {/* Header */}
        <MarketHeader
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          onSettings={() => setShowSettings(!showSettings)}
          refreshing={refreshing}
          visibleCount={visibleAssets.length}
          isConnected={isConnected}
        />

        {/* Empty State */}
        {visibleMarketData.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-bg/50 rounded-full inline-block mb-4">
              <Activity className="w-8 h-8 text-textMuted" />
            </div>
            <p className="text-textMuted mb-4">No assets selected</p>
            <button onClick={selectAll} className="btn-primary">
              Select Assets
            </button>
          </div>
        ) : (
          <>
            {/* Asset Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleMarketData.map((asset) => (
                <LiveAssetCard 
                  key={asset.id} 
                  asset={asset}
                  prevPrice={prevPrices[asset.id] ?? asset.price}
                />
              ))}
            </div>

            {/* Stats Footer */}
            <StatsFooter assets={visibleMarketData} />
          </>
        )}
      </div>
    </div>
  );
};

export default MarketOverview;

