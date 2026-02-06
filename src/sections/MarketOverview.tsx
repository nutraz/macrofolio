import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, RefreshCw, Bitcoin, Activity, 
  Clock, Settings, Check, X, Zap, ArrowUpRight, ArrowDownRight, CircleDot, ExternalLink
} from 'lucide-react';

// Asset type definition
interface MarketAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  change7d?: number;
  marketCap: number;
  volume24h: number;
  icon: React.ReactNode;
  category: 'crypto' | 'commodity' | 'currency' | 'index';
  isVisible: boolean;
}

// All available assets to track
const ALL_ASSETS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', category: 'crypto' as const, color: 'orange' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', category: 'crypto' as const, color: 'blue' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', category: 'crypto' as const, color: 'purple' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', category: 'crypto' as const, color: 'yellow' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', category: 'crypto' as const, color: 'gray' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', category: 'crypto' as const, color: 'blue' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', category: 'crypto' as const, color: 'red' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', category: 'crypto' as const, color: 'pink' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', category: 'crypto' as const, color: 'blue' },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon', category: 'crypto' as const, color: 'purple' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', category: 'crypto' as const, color: 'yellow' },
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu', category: 'crypto' as const, color: 'brown' },
];

// Get icon
const getIcon = (color: string) => {
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

// Animated number component
const AnimatedNumber: React.FC<{ value: number; format: (v: number) => string }> = ({ value, format }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      const diff = value - displayValue;
      const step = diff / 10;
      let current = displayValue;
      
      const timer = setInterval(() => {
        current += step;
        if ((step > 0 && current >= value) || (step < 0 && current <= value)) {
          current = value;
          setIsAnimating(false);
        }
        setDisplayValue(current);
      }, 30);

      return () => clearInterval(timer);
    }
  }, [value, displayValue]);

  return (
    <span className={`transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
      {format(displayValue)}
    </span>
  );
};

// Live sparkline chart
const LiveSparkline: React.FC<{ data: number[]; isPositive: boolean; width?: number; height?: number }> = ({ 
  data, 
  isPositive,
  width = 120, 
  height = 50 
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
  const color = isPositive ? '#22c55e' : '#ef4444';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${gradientId}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Area fill */}
      <path
        d={`M 0,${height} L ${points} L ${width},${height} Z`}
        fill={`url(#${gradientId})`}
      />
      
      {/* Line */}
      <path
        d={`M ${points}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#glow-${gradientId})`}
        className="transition-all duration-500"
      />
      
      {/* Live dot */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="4"
        fill={color}
        className="animate-pulse"
      />
    </svg>
  );
};

// Asset card with live feel
const LiveAssetCard: React.FC<{ asset: MarketAsset; sparklineData: number[] }> = ({ asset, sparklineData }) => {
  const isPositive = asset.change24h >= 0;
  
  return (
    <div className="group relative bg-gradient-to-br from-card/80 to-card/40 rounded-2xl p-5 border border-border/50 hover:border-info/30 transition-all duration-300 hover:shadow-xl hover:shadow-info/10 hover:-translate-y-1 overflow-hidden">
      {/* Background glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        isPositive ? 'bg-gradient-to-br from-success/5 to-transparent' : 'bg-gradient-to-br from-danger/5 to-transparent'
      }`} />
      
      {/* Header */}
      <div className="relative flex items-center justify-between mb-4">
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
          isPositive 
            ? 'bg-success/10 text-success' 
            : 'bg-danger/10 text-danger'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
        </div>
      </div>

      {/* Price */}
      <div className="relative mb-4">
        <span className={`text-2xl font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
          <AnimatedNumber value={asset.price} format={(v) => formatCurrency(v, asset.price < 1 ? 6 : 2)} />
        </span>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-textMuted">MCap:</span>
          <span className="text-xs text-textSecondary">{formatCurrency(asset.marketCap, 0)}</span>
        </div>
      </div>

      {/* Live Sparkline */}
      <div className="relative h-14">
        <LiveSparkline 
          data={sparklineData} 
          isPositive={isPositive}
          width={140}
          height={50}
        />
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
  error: string | null;
}> = ({ lastUpdated, onRefresh, onSettings, refreshing, visibleCount, error }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="p-3 bg-gradient-to-br from-info/20 to-info/5 rounded-xl">
          <Activity className="w-6 h-6 text-info" />
        </div>
        <div className="absolute -top-1 -right-1 flex items-center gap-1">
          <CircleDot className="w-3 h-3 text-success animate-pulse" />
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-textPrimary">Live Market</h3>
          {error && (
            <span className="text-xs px-2 py-0.5 bg-warning/10 text-warning rounded-full border border-warning/20">
              Demo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-textMuted">
          <Zap className="w-4 h-4 text-warning" />
          <span>Powered by CoinGecko</span>
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
        {error && (
          <span className="text-xs text-warning flex items-center gap-1">
            Using cache
          </span>
        )}
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
          {getIcon(asset.color)}
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

  const best = assets.reduce((a, b) => a.change24h > b.change24h ? a : b);
  const worst = assets.reduce((a, b) => a.change24h < b.change24h ? a : b);
  const avgChange = assets.reduce((sum, a) => sum + a.change24h, 0) / assets.length;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-border/50">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="text-sm text-textMuted">Best:</span>
          <span className="text-sm font-semibold text-success">
            {best.symbol} +{best.change24h.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-danger" />
          <span className="text-sm text-textMuted">Worst:</span>
          <span className="text-sm font-semibold text-danger">
            {worst.symbol} {worst.change24h.toFixed(2)}%
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
        href="https://www.coingecko.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-sm text-textMuted hover:text-info transition-colors"
      >
        View on CoinGecko
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
};

const MarketOverview: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketAsset[]>([]);
  const [historicalData, setHistoricalData] = useState<{ [key: string]: number[] }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
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

  // Fetch live data
  const fetchMarketData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const visibleConfigs = ALL_ASSETS.filter(a => visibleAssets.includes(a.id));
      const ids = visibleConfigs.length > 0 
        ? visibleConfigs.map(a => a.id).join(',')
        : 'bitcoin,ethereum,solana';

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage_24h,7d`
      );

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();

      const assets: MarketAsset[] = data.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h || 0,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
        icon: getIcon(ALL_ASSETS.find(a => a.id === coin.id)?.color || 'gray'),
        category: 'crypto' as const,
        isVisible: visibleAssets.includes(coin.id),
      }));

      const history: { [key: string]: number[] } = {};
      data.forEach((coin: any) => {
        history[coin.id] = coin.sparkline_in_7d?.price || [];
      });

      setMarketData(assets);
      setHistoricalData(history);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('API Error:', err);
      
      // Fallback with realistic mock data
      const mockAssets: MarketAsset[] = [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 67234, change24h: 2.34, marketCap: 1320000000000, volume24h: 28500000000, icon: getIcon('orange'), category: 'crypto', isVisible: visibleAssets.includes('bitcoin') },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 3489, change24h: -1.23, marketCap: 420000000000, volume24h: 15200000000, icon: getIcon('blue'), category: 'crypto', isVisible: visibleAssets.includes('ethereum') },
        { id: 'solana', name: 'Solana', symbol: 'SOL', price: 178.45, change24h: 5.67, marketCap: 78000000000, volume24h: 4200000000, icon: getIcon('purple'), category: 'crypto', isVisible: visibleAssets.includes('solana') },
        { id: 'binancecoin', name: 'BNB', symbol: 'BNB', price: 584.20, change24h: 0.89, marketCap: 87000000000, volume24h: 1800000000, icon: getIcon('yellow'), category: 'crypto', isVisible: visibleAssets.includes('binancecoin') },
        { id: 'ripple', name: 'XRP', symbol: 'XRP', price: 0.5234, change24h: -2.45, marketCap: 29000000000, volume24h: 1200000000, icon: getIcon('gray'), category: 'crypto', isVisible: visibleAssets.includes('ripple') },
        { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.4567, change24h: 3.21, marketCap: 16000000000, volume24h: 450000000, icon: getIcon('blue'), category: 'crypto', isVisible: visibleAssets.includes('cardano') },
      ];
      
      const mockHistory: { [key: string]: number[] } = {};
      mockAssets.forEach(asset => {
        const basePrice = asset.price;
        mockHistory[asset.id] = Array.from({ length: 168 }, (_, i) => {
          const volatility = 0.02;
          return basePrice * (1 + (Math.random() - 0.5) * volatility * (1 + i * 0.01));
        });
      });

      setMarketData(mockAssets.filter(a => visibleAssets.includes(a.id) || visibleAssets.length === 0));
      setHistoricalData(mockHistory);
      setLastUpdated(new Date());
      setError('Using cached data - API rate limited');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [visibleAssets]);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(() => fetchMarketData(true), 60000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const visibleMarketData = useMemo(() => {
    if (visibleAssets.length === 0) return marketData;
    return marketData.filter(a => visibleAssets.includes(a.id));
  }, [marketData, visibleAssets]);

  // Loading skeleton
  if (loading && marketData.length === 0) {
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
              <div className="h-12 bg-border rounded" />
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
        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-xl flex items-center gap-2">
            <Activity className="w-4 h-4 text-warning" />
            <span className="text-sm text-warning">{error}</span>
          </div>
        )}

        {/* Header */}
        <MarketHeader
          lastUpdated={lastUpdated}
          onRefresh={() => fetchMarketData(true)}
          onSettings={() => setShowSettings(!showSettings)}
          refreshing={refreshing}
          visibleCount={visibleAssets.length}
          error={error}
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
                  sparklineData={historicalData[asset.id] || []} 
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

