import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Bitcoin, Flame, DollarSign, Gem, BarChart3, Zap } from 'lucide-react';

// Market asset types
interface MarketAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  icon: React.ReactNode;
  category: 'crypto' | 'commodity' | 'currency' | 'index';
}

// Live market data (simulated for demo)
const INITIAL_MARKET_DATA: MarketAsset[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 67500,
    change24h: 2.34,
    icon: <Bitcoin className="w-5 h-5 text-orange-500" />,
    category: 'crypto'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3450,
    change24h: -1.23,
    icon: <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">Ξ</div>,
    category: 'crypto'
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    price: 175.50,
    change24h: 5.67,
    icon: <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">S</div>,
    category: 'crypto'
  },
  {
    id: 'gold',
    name: 'Gold',
    symbol: 'XAU',
    price: 2045.30,
    change24h: 0.45,
    icon: <Gem className="w-5 h-5 text-yellow-500" />,
    category: 'commodity'
  },
  {
    id: 'silver',
    name: 'Silver',
    symbol: 'XAG',
    price: 23.45,
    change24h: -0.78,
    icon: <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">Ag</div>,
    category: 'commodity'
  },
  {
    id: 'dxy',
    name: 'US Dollar Index',
    symbol: 'DXY',
    price: 103.85,
    change24h: 0.12,
    icon: <DollarSign className="w-5 h-5 text-green-600" />,
    category: 'currency'
  },
  {
    id: 'sp500',
    name: 'S&P 500',
    symbol: 'SPX',
    price: 5234.18,
    change24h: 0.89,
    icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
    category: 'index'
  },
  {
    id: 'nasdaq',
    name: 'NASDAQ',
    symbol: 'NDX',
    price: 16428.82,
    change24h: 1.23,
    icon: <Flame className="w-5 h-5 text-orange-600" />,
    category: 'index'
  },
];

// Sparkline component for mini charts
const Sparkline: React.FC<{ data: number[]; color: string; isPositive: boolean }> = ({ data, color, isPositive }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-24 h-10" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle 
        cx={100} 
        cy={isPositive ? ((max - data[data.length - 1]) / range) * 100 : ((data[data.length - 1] - min) / range) * 100} 
        r="3" 
        fill={color} 
      />
    </svg>
  );
};

const MarketOverview: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketAsset[]>(INITIAL_MARKET_DATA);
  const [sparklineData, setSparklineData] = useState<{ [key: string]: number[] }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Generate initial sparkline data
  useEffect(() => {
    const generateSparkline = (basePrice: number) => {
      const points = 20;
      return Array.from({ length: points }, (_, i) => {
        const volatility = 0.02;
        const change = (Math.random() - 0.5) * volatility * basePrice;
        return basePrice + change * (i + 1);
      });
    };

    const sparklines: { [key: string]: number[] } = {};
    INITIAL_MARKET_DATA.forEach(asset => {
      sparklines[asset.id] = generateSparkline(asset.price);
    });
    setSparklineData(sparklines);
  }, []);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(asset => {
        const changePercent = (Math.random() * 0.5 - 0.25); // -0.25% to +0.25%
        const newPrice = asset.price * (1 + changePercent / 100);
        
        // Update sparkline
        setSparklineData(sparklines => ({
          ...sparklines,
          [asset.id]: [...(sparklines[asset.id] || []).slice(1), newPrice]
        }));

        return {
          ...asset,
          price: newPrice,
        };
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMarketData(prev => prev.map(asset => {
      const change = (Math.random() * 4) - 2; // -2% to +2%
      const newPrice = asset.price * (1 + change / 100);
      
      setSparklineData(sparklines => ({
        ...sparklines,
        [asset.id]: [...(sparklines[asset.id] || []).slice(1), newPrice]
      }));

      return {
        ...asset,
        price: newPrice,
        change24h: asset.change24h + (Math.random() * 0.5 - 0.25),
      };
    }));
    
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  const formatPrice = (price: number, category: string) => {
    if (category === 'commodity' || category === 'index') {
      return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 100 ? 2 : 0,
      maximumFractionDigits: price < 100 ? 2 : 0,
    });
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center gap-0.5 text-sm ${isPositive ? 'text-success' : 'text-danger'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6 shadow-card-glow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-info/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-info" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-textPrimary">Market Overview</h3>
            <p className="text-xs text-textMuted flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Live prices • Updated {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {/* Market Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {marketData.map((asset) => (
          <div
            key={asset.id}
            className="bg-bg/50 rounded-xl p-4 border border-border hover:border-info/30 transition-all duration-200 group cursor-pointer"
          >
            {/* Asset Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {asset.icon}
                <div>
                  <p className="text-sm font-medium text-textPrimary">{asset.symbol}</p>
                  <p className="text-xs text-textMuted">{asset.name}</p>
                </div>
              </div>
            </div>

            {/* Price */}
            <p className="text-lg font-bold text-textPrimary mb-2">
              {formatPrice(asset.price, asset.category)}
            </p>

            {/* Change & Sparkline */}
            <div className="flex items-center justify-between">
              {formatChange(asset.change24h)}
              <Sparkline
                data={sparklineData[asset.id] || []}
                color={asset.change24h >= 0 ? '#22c55e' : '#ef4444'}
                isPositive={asset.change24h >= 0}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-textMuted mb-1">Top Gainer</p>
            <p className="text-sm font-semibold text-success flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" />
              SOL +5.67%
            </p>
          </div>
          <div>
            <p className="text-xs text-textMuted mb-1">Top Loser</p>
            <p className="text-sm font-semibold text-danger flex items-center justify-center gap-1">
              <TrendingDown className="w-3 h-3" />
              XAG -0.78%
            </p>
          </div>
          <div>
            <p className="text-xs text-textMuted mb-1">Market Sentiment</p>
            <p className="text-sm font-semibold text-warning flex items-center justify-center gap-1">
              <Flame className="w-3 h-3" />
              Neutral
            </p>
          </div>
          <div>
            <p className="text-xs text-textMuted mb-1">24h Volume</p>
            <p className="text-sm font-semibold text-info flex items-center justify-center gap-1">
              <BarChart3 className="w-3 h-3" />
              $128B
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;

