import { TrendingUp, TrendingDown, Wallet, Zap } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

interface PortfolioSummaryProps {
  isDemoMode?: boolean;
  summary?: {
    totalValue: number;
    totalCost: number;
    totalGain: number;
    totalGainPercent: number;
    dayChange: number;
    dayChangePercent: number;
  } | null;
  totalAssets?: number;
}

export default function PortfolioSummary({ isDemoMode = true, summary: propSummary }: PortfolioSummaryProps) {
  const { summary: contextSummary, assets } = usePortfolio();
  
  // Use prop summary if provided, otherwise use context
  const portfolioData = propSummary || contextSummary || {
    totalValue: 0,
    totalCost: 0,
    totalGain: 0,
    totalGainPercent: 0,
    dayChange: 0,
    dayChangePercent: 0,
  };

  const isPositive = portfolioData.dayChange >= 0;
  const isGainPositive = portfolioData.totalGain >= 0;
  const assetCount = assets.length;

  // Calculate top and worst performers
  const getTopWorstPerformers = () => {
    if (assets.length === 0) return { top: 'N/A', worst: 'N/A' };
    
    const performers = assets.map(asset => {
      const gain = ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;
      return { symbol: asset.symbol, gain };
    });
    
    performers.sort((a, b) => b.gain - a.gain);
    return {
      top: performers[0].symbol,
      worst: performers[performers.length - 1].symbol,
    };
  };

  const { top, worst } = getTopWorstPerformers();

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="card-interactive bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-8 shadow-card-glow relative overflow-hidden animate-fade-in">
      {/* Demo Mode Badge */}
      {isDemoMode && (
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-warning/20 border border-warning/30 rounded-full">
          <Zap className="w-3 h-3 text-warning" />
          <span className="text-xs font-medium text-warning">Demo Data</span>
        </div>
      )}
      
      {/* Left Accent Rail - Gradient Edge */}
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-accent" />
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        {/* Main Value - HERO SECTION */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-success/10 rounded-lg transition-colors duration-200 hover:bg-success/20">
              <Wallet className="w-5 h-5 text-success" />
            </div>
            <p className="text-textMuted text-sm font-medium tracking-wide uppercase">Total Portfolio Value</p>
          </div>
          
          {/* Hero Number with Glow */}
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-textPrimary mb-3 drop-shadow-lg transition-all duration-300 hover:scale-[1.01]">
            {formatCurrency(portfolioData.totalValue)}
          </h1>
          
          {/* Day Change Indicator */}
          <div className={`flex items-center space-x-3 ${isPositive ? 'text-success' : 'text-danger'} transition-all duration-300`}>
            <div className={`inline-flex items-center gap-1 rounded-md ${isPositive ? 'bg-success/10' : 'bg-danger/10'} px-2 py-1 transition-colors duration-200 hover:bg-opacity-20`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-semibold text-sm">
                {isPositive ? '+' : ''}{formatCurrency(Math.abs(portfolioData.dayChange))}
              </span>
            </div>
            <span className="text-textMuted text-sm">
              ({isPositive ? '+' : ''}{portfolioData.dayChangePercent.toFixed(2)}%) today
            </span>
          </div>

          {/* Total Gain/Loss */}
          <div className={`mt-3 flex items-center gap-2 ${isGainPositive ? 'text-success' : 'text-danger'}`}>
            <span className="text-sm text-textMuted">Total Gain/Loss:</span>
            <span className="font-semibold">
              {isGainPositive ? '+' : ''}{formatCurrency(portfolioData.totalGain)} 
              ({isGainPositive ? '+' : ''}{portfolioData.totalGainPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="interactive-row rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 text-center border border-border hover:border-info/30 transition-all duration-200">
            <p className="text-textMuted text-xs mb-1 uppercase tracking-wide">Assets</p>
            <p className="text-2xl font-bold text-info transition-transform duration-200">{assetCount}</p>
          </div>
          <div className="interactive-row rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 text-center border border-border hover:border-success/30 transition-all duration-200">
            <p className="text-textMuted text-xs mb-1 uppercase tracking-wide">Top</p>
            <p className="text-2xl font-bold text-success transition-transform duration-200">{top}</p>
          </div>
          <div className="interactive-row rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 text-center border border-border hover:border-purple-500/30 transition-all duration-200">
            <p className="text-textMuted text-xs mb-1 uppercase tracking-wide">Worst</p>
            <p className="text-2xl font-bold text-purple-400 transition-transform duration-200">{worst}</p>
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
          <span className="text-success text-sm font-medium">{isDemoMode ? 'Demo Data' : 'Live Data'}</span>
        </div>
        <p className="text-textMuted text-sm transition-colors hover:text-textPrimary">
          {isDemoMode ? 'Not connected to blockchain' : 'Last anchored: Just now'}
        </p>
      </div>
    </div>
  );
}

