import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Bitcoin, Flame, DollarSign, Gem, BarChart3, Zap, Activity, Clock, ExternalLink } from 'lucide-react';

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
}

// Asset configuration with API IDs
const ASSET_CONFIG = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', category: 'crypto' as const, color: 'orange' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', category: 'crypto' as const, color: 'blue' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', category: 'crypto' as const, color: 'purple' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB', category: 'crypto' as const, color: 'yellow' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP', category: 'crypto' as const, color: 'gray' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano', category: 'crypto' as const, color: 'blue' },
  { id: 'gold', symbol: 'XAU', name: 'Gold', category: 'commodity' as const, color: 'yellow' },
  { id: 'silver', symbol: 'XAG', name: 'Silver', category: 'commodity' as const, color: 'gray' },
];

// Get icon based on color
const getIcon = (id: string, color: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    orange: <Bitcoin className="w-5 h-5 text-orange-500" />,
    blue: <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">Ξ</div>,
    purple: <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">S</div>,
    yellow: <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">$</div>,
    gray: <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">X</div>,
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

// Sparkline chart component
const Sparkline: React.FC<{ data: number[]; color: string; width?: number; height?: number }> = ({ 
  data, 
  color, 
  width = 120, 
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
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
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

const MarketOverview: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketAsset[]>([]);
  const [historicalData, setHistoricalData] = useState<{ [key: string]: number[] }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch live data from CoinGecko API
  const fetchMarketData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const ids = ASSET_CONFIG.map(a => a.id).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }

      const data = await response.json();

      // Map API data to our format
      const assets: MarketAsset[] = data.map((coin: any) => {
        const config = ASSET_CONFIG.find(a => a.id === coin.id);
        return {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h,
          marketCap: coin.market_cap,
          volume24h: coin.total_volume,
          icon: getIcon(coin.id, config?.color || 'gray'),
          category: config?.category || 'crypto',
        };
      });

      // Store historical data for sparklines
      const history: { [key: string]: number[] } = {};
      data.forEach((coin: any) => {
        history[coin.id] = coin.sparkline_in_7d?.price || [];
      });

      setMarketData(assets);
      setHistoricalData(history);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Unable to load market data. Using cached values.');
      // Keep existing data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
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

  // Get change color class
  const getChangeClass = (change: number) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-danger';
    return 'text-textMuted';
  };

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
              <div className="h-4 w-24 bg-border rounded animate-pulse mt-2" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

  // Error state
  if (error && marketData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6 shadow-card-glow">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="p-3 bg-danger/10 rounded-full inline-block mb-4">
              <Activity className="w-8 h-8 text-danger" />
            </div>
            <p className="text-textPrimary mb-4">{error}</p>
            <button onClick={handleRefresh} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6 shadow-card-glow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-info/10 rounded-lg">
            <Activity className="w-5 h-5 text-info" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-textPrimary">Live Market Overview</h3>
            <p className="text-xs text-textMuted flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Real-time prices • Powered by CoinGecko
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-textMuted flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
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

      {/* Market Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {marketData.map((asset) => (
          <div
            key={asset.id}
            className="group bg-bg/50 rounded-xl p-4 border border-border hover:border-info/30 transition-all duration-300 hover:shadow-lg hover:shadow-info/5 cursor-pointer"
          >
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

            {/* Sparkline & Stats */}
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-textMuted">MCap</span>
                <span className="text-xs text-textPrimary font-medium">
                  {formatCurrency(asset.marketCap, 0)}
                </span>
              </div>
              <Sparkline 
                data={historicalData[asset.id] || []} 
                color={asset.id}
                width={80}
                height={30}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm text-textMuted">Top Gainer:</span>
            <span className="text-sm font-semibold text-success">
              {marketData.length > 0 
                ? `${marketData.reduce((a, b) => a.change24h > b.change24h ? a : b).symbol} +${marketData.reduce((a, b) => a.change24h > b.change24h ? a : b).change24h.toFixed(2)}%`
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-danger" />
            <span className="text-sm text-textMuted">Top Loser:</span>
            <span className="text-sm font-semibold text-danger">
              {marketData.length > 0 
                ? `${marketData.reduce((a, b) => a.change24h < b.change24h ? a : b).symbol} ${marketData.reduce((a, b) => a.change24h < b.change24h ? a : b).change24h.toFixed(2)}%`
                : 'N/A'}
            </span>
          </div>
        </div>
        
        <a
          href="https://www.coingecko.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-textMuted hover:text-info transition-colors"
        >
          View on CoinGecko
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default MarketOverview;

