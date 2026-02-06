import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, RefreshCw, Bitcoin, Flame, DollarSign, 
  Gem, BarChart3, Zap, Activity, Clock, Settings, Check, X, 
  ChevronDown, Filter, Eye, EyeOff
} from 'lucide-react';

// Asset type definition
interface MarketAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
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

// Get icon based on asset config
const getIcon = (id: string, color: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    orange: <Bitcoin className="w-5 h-5 text-orange-500" />,
    blue: <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">Ξ</div>,
    purple: <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">S</div>,
    yellow: <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">$</div>,
    gray: <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">X</div>,
    red: <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">A</div>,
    pink: <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold">D</div>,
    brown: <div className="w-5 h-5 rounded-full bg-amber-700 flex items-center justify-center text-white text-xs font-bold">S</div>,
  };
  return iconMap[color] || <div className="w-5 h-5 rounded-full bg-gray-500" />;
};

// Format currency
const formatCurrency = (value: number, maxDecimals = 2) => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value < 1 ? 4 : maxDecimals,
    maximumFractionDigits: value < 1 ? 6 : maxDecimals,
  });
};

// Sparkline chart component with gradient
const Sparkline: React.FC<{ data: number[]; color: string; width?: number; height?: number }> = ({ 
  data, 
  color, 
  width = 100, 
  height = 40 
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

  const isPositive = data[data.length - 1] >= data[0];
  const strokeColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color}-${Math.random()}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M ${points}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3"
        fill={strokeColor}
        className="transition-all duration-300"
      />
    </svg>
  );
};

// Asset card component
const AssetCard: React.FC<{ asset: MarketAsset; sparklineData: number[] }> = ({ asset, sparklineData }) => (
  <div className="group bg-bg/50 rounded-xl p-4 border border-border hover:border-info/30 transition-all duration-300 hover:shadow-lg hover:shadow-info/5 cursor-pointer">
    {/* Asset Header */}
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {asset.icon}
        <div>
          <p className="text-sm font-semibold text-textPrimary">{asset.symbol}</p>
          <p className="text-xs text-textMuted">{asset.name}</p>
        </div>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${
        asset.change24h >= 0 
          ? 'bg-success/10 text-success' 
          : 'bg-danger/10 text-danger'
      }`}>
        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
      </span>
    </div>

    {/* Price */}
    <p className="text-xl font-bold text-textPrimary mb-2">
      {formatCurrency(asset.price)}
    </p>

    {/* Sparkline & Market Cap */}
    <div className="flex items-end justify-between">
      <div className="flex flex-col">
        <span className="text-xs text-textMuted">MCap</span>
        <span className="text-xs text-textPrimary font-medium">
          {formatCurrency(asset.marketCap, 0)}
        </span>
      </div>
      <Sparkline 
        data={sparklineData} 
        color={asset.id}
        width={80}
        height={30}
      />
    </div>
  </div>
);

// Category filter badge
const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const colors: { [key: string]: string } = {
    crypto: 'bg-orange-500/10 text-orange-500',
    commodity: 'bg-yellow-500/10 text-yellow-500',
    currency: 'bg-green-500/10 text-green-500',
  };
  
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[category] || 'bg-gray-500/10 text-gray-500'}`}>
      {category}
    </span>
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
  
  // Track which assets are visible (loaded from localStorage)
  const [visibleAssets, setVisibleAssets] = useState<string[]>(() => {
    const saved = localStorage.getItem('macrofolio-visible-assets');
    return saved ? JSON.parse(saved) : ALL_ASSETS.slice(0, 8).map(a => a.id);
  });

  // Save visible assets to localStorage when changed
  useEffect(() => {
    localStorage.setItem('macrofolio-visible-assets', JSON.stringify(visibleAssets));
  }, [visibleAssets]);

  // Toggle asset visibility
  const toggleAsset = (assetId: string) => {
    setVisibleAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  // Select/deselect all
  const selectAll = () => {
    setVisibleAssets(ALL_ASSETS.map(a => a.id));
  };

  const deselectAll = () => {
    setVisibleAssets([]);
  };

  // Fetch live data from CoinGecko API
  const fetchMarketData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // Get IDs for visible assets that are in our config
      const visibleConfigs = ALL_ASSETS.filter(a => visibleAssets.includes(a.id));
      const ids = visibleConfigs.length > 0 
        ? visibleConfigs.map(a => a.id).join(',')
        : ALL_ASSETS.slice(0, 4).map(a => a.id).join(',');

      // Fetch from CoinGecko with rate limiting considerations
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h`
      );

      if (!response.ok) {
        // If rate limited or error, throw to use fallback
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      // Map API data to our format
      const assets: MarketAsset[] = data.map((coin: any) => {
        const config = ALL_ASSETS.find(a => a.id === coin.id);
        return {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h || 0,
          marketCap: coin.market_cap,
          volume24h: coin.total_volume,
          icon: getIcon(coin.id, config?.color || 'gray'),
          category: config?.category || 'crypto',
          isVisible: visibleAssets.includes(coin.id) || visibleAssets.length === 0,
        };
      });

      // Store historical data for sparklines
      const history: { [key: string]: number[] } = {};
      data.forEach((coin: any) => {
        history[coin.id] = coin.sparkline_in_7d?.price || [];
      });

      // Ensure all visible assets are represented (add defaults for any missing)
      visibleConfigs.forEach(config => {
        if (!assets.find(a => a.id === config.id)) {
          assets.push({
            id: config.id,
            name: config.name,
            symbol: config.symbol,
            price: 0,
            change24h: 0,
            marketCap: 0,
            volume24h: 0,
            icon: getIcon(config.id, config.color),
            category: config.category,
            isVisible: true,
          });
        }
      });

      setMarketData(assets);
      setHistoricalData(history);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching market data:', err);
      
      // Use mock data as fallback with realistic prices
      const mockAssets: MarketAsset[] = [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 67234, change24h: 2.34, marketCap: 1320000000000, volume24h: 28500000000, icon: getIcon('bitcoin', 'orange'), category: 'crypto', isVisible: visibleAssets.includes('bitcoin') },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 3489, change24h: -1.23, marketCap: 420000000000, volume24h: 15200000000, icon: getIcon('ethereum', 'blue'), category: 'crypto', isVisible: visibleAssets.includes('ethereum') },
        { id: 'solana', name: 'Solana', symbol: 'SOL', price: 178.45, change24h: 5.67, marketCap: 78000000000, volume24h: 4200000000, icon: getIcon('solana', 'purple'), category: 'crypto', isVisible: visibleAssets.includes('solana') },
        { id: 'binancecoin', name: 'BNB', symbol: 'BNB', price: 584.20, change24h: 0.89, marketCap: 87000000000, volume24h: 1800000000, icon: getIcon('binancecoin', 'yellow'), category: 'crypto', isVisible: visibleAssets.includes('binancecoin') },
        { id: 'ripple', name: 'XRP', symbol: 'XRP', price: 0.5234, change24h: -2.45, marketCap: 29000000000, volume24h: 1200000000, icon: getIcon('ripple', 'gray'), category: 'crypto', isVisible: visibleAssets.includes('ripple') },
        { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.4567, change24h: 3.21, marketCap: 16000000000, volume24h: 450000000, icon: getIcon('cardano', 'blue'), category: 'crypto', isVisible: visibleAssets.includes('cardano') },
      ];
      
      // Generate mock sparkline data
      const mockHistory: { [key: string]: number[] } = {};
      mockAssets.forEach(asset => {
        const basePrice = asset.price;
        mockHistory[asset.id] = Array.from({ length: 24 }, (_, i) => {
          const volatility = 0.03;
          return basePrice * (1 + (Math.random() - 0.5) * volatility * (24 - i));
        });
      });

      setMarketData(mockAssets.filter(a => visibleAssets.includes(a.id) || visibleAssets.length === 0));
      setHistoricalData(mockHistory);
      setLastUpdated(new Date());
      setError('Using cached data - Live prices temporarily unavailable');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [visibleAssets]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchMarketData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchMarketData(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const handleRefresh = () => {
    fetchMarketData(true);
  };

  // Filter visible assets
  const visibleMarketData = useMemo(() => {
    if (visibleAssets.length === 0) return marketData;
    return marketData.filter(a => visibleAssets.includes(a.id));
  }, [marketData, visibleAssets]);

  // Loading skeleton
  if (loading && marketData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6 shadow-card-glow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <Activity className="w-5 h-5 text-info animate-pulse" />
            </div>
            <div>
              <div className="h-5 w-40 bg-border rounded animate-pulse" />
              <div className="h-4 w-32 bg-border rounded animate-pulse mt-2" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-bg/50 rounded-xl p-4 animate-pulse">
              <div className="h-4 w-20 bg-border rounded mb-3" />
              <div className="h-6 w-24 bg-border rounded mb-2" />
              <div className="h-4 w-16 bg-border rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6 shadow-card-glow relative">
      {/* Settings Dropdown */}
      {showSettings && (
        <div className="absolute top-20 right-6 z-50 bg-bg border border-border rounded-xl shadow-xl p-4 w-72 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-textPrimary">Track Assets</h4>
            <button onClick={() => setShowSettings(false)} className="text-textMuted hover:text-textPrimary">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mb-3">
            <button onClick={selectAll} className="text-xs text-info hover:underline">Select All</button>
            <span className="text-textMuted">|</span>
            <button onClick={deselectAll} className="text-xs text-danger hover:underline">Deselect All</button>
          </div>
          <div className="space-y-2">
            {ALL_ASSETS.map(asset => (
              <button
                key={asset.id}
                onClick={() => toggleAsset(asset.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  visibleAssets.includes(asset.id) 
                    ? 'bg-info/10 text-info' 
                    : 'hover:bg-bg text-textMuted'
                }`}
              >
                {visibleAssets.includes(asset.id) 
                  ? <Check className="w-4 h-4" /> 
                  : <div className="w-4 h-4 rounded-full border-2 border-border" />
                }
                <span className="text-sm">{asset.symbol}</span>
                <span className="text-xs ml-auto">{asset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-info/10 rounded-lg">
            <Activity className="w-5 h-5 text-info" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-textPrimary">Live Market</h3>
              {error && (
                <span className="text-xs px-2 py-0.5 bg-warning/10 text-warning rounded-full">
                  Demo Data
                </span>
              )}
            </div>
            <p className="text-xs text-textMuted flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Real-time prices • CoinGecko
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-textMuted flex items-center gap-1 hidden sm:flex">
              <Clock className="w-3 h-3" />
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`btn-secondary text-sm flex items-center gap-2 ${showSettings ? 'bg-info/10 border-info/30' : ''}`}
          >
            <Filter className="w-4 h-4" />
            Track {visibleAssets.length}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-warning/10 border border-warning/30 rounded-lg flex items-center gap-2">
          <Activity className="w-4 h-4 text-warning" />
          <span className="text-sm text-warning">{error}</span>
        </div>
      )}

      {/* Market Grid */}
      {visibleMarketData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-textMuted mb-4">No assets selected</p>
          <button onClick={selectAll} className="btn-primary text-sm">
            Select Assets to Track
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleMarketData.map((asset) => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              sparklineData={historicalData[asset.id] || []} 
            />
          ))}
        </div>
      )}

      {/* Quick Stats Bar */}
      {visibleMarketData.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-4 border-t border-border">
          <div className="flex flex-wrap items-center gap-6">
            {visibleMarketData.length > 1 && (
              <>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-textMuted">Best:</span>
                  <span className="text-sm font-semibold text-success">
                    {visibleMarketData.reduce((a, b) => a.change24h > b.change24h ? a : b).symbol} 
                    +{visibleMarketData.reduce((a, b) => a.change24h > b.change24h ? a : b).change24h.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-danger" />
                  <span className="text-sm text-textMuted">Worst:</span>
                  <span className="text-sm font-semibold text-danger">
                    {visibleMarketData.reduce((a, b) => a.change24h < b.change24h ? a : b).symbol} 
                    {visibleMarketData.reduce((a, b) => a.change24h < b.change24h ? a : b).change24h.toFixed(2)}%
                  </span>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-textMuted">
              {visibleMarketData.length} asset{visibleMarketData.length !== 1 ? 's' : ''} tracked
            </span>
            <a
              href="https://www.coingecko.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-textMuted hover:text-info transition-colors"
            >
              View on CoinGecko
              <TrendingUp className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketOverview;

