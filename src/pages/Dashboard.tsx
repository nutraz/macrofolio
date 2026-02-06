import React, { useEffect, useState } from 'react';
import PortfolioSummary from '../sections/PortfolioSummary';
import PerformanceChart from '../sections/PerformanceChart';
import Allocation from '../sections/Allocation';
import AssetsTable from '../sections/AssetsTable';
import MarketOverview from '../sections/MarketOverview';
import DashboardLogo from '../components/DashboardLogo';
import { Layers, Shield, Zap, RefreshCw } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

interface DashboardProps {
  assetTypes: string[];
  loading: boolean;
  isDemoMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ assetTypes, loading: authLoading, isDemoMode }) => {
  const { assets, loading, summary, refreshPrices, isDemoMode: portfolioDemoMode } = usePortfolio();
  const [refreshing, setRefreshing] = useState(false);

  // Combine loading states
  const isLoading = authLoading || loading;

  const handleRefreshPrices = async () => {
    setRefreshing(true);
    await refreshPrices();
    setTimeout(() => setRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8 animate-fade-in">
        {/* Skeleton Portfolio Summary */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-8 shadow-card-glow">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-border animate-pulse"></div>
                <div className="w-32 h-4 bg-border rounded animate-pulse"></div>
              </div>
              <div className="w-48 h-8 bg-border rounded animate-pulse"></div>
              <div className="w-40 h-4 bg-border rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="w-24 h-20 bg-border rounded-lg animate-pulse"></div>
              <div className="w-24 h-20 bg-border rounded-lg animate-pulse"></div>
              <div className="w-24 h-20 bg-border rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Skeleton Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6 shadow-card-glow">
            <div className="w-40 h-6 bg-border rounded animate-pulse mb-6"></div>
            <div className="h-48 bg-border rounded animate-pulse"></div>
          </div>
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6 shadow-card-glow">
            <div className="w-40 h-6 bg-border rounded animate-pulse mb-6"></div>
            <div className="h-48 bg-border rounded-full w-40 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Skeleton Asset Types */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6">
          <div className="w-40 h-6 bg-border rounded animate-pulse mb-4"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-24 h-8 bg-border rounded animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Skeleton Table */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl overflow-hidden shadow-card-glow">
          <div className="px-6 py-5 border-b border-border">
            <div className="w-32 h-6 bg-border rounded animate-pulse mb-2"></div>
            <div className="w-48 h-4 bg-border rounded animate-pulse"></div>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-border rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-border rounded animate-pulse"></div>
                    <div className="w-16 h-3 bg-border rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="w-20 h-4 bg-border rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-border rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-border rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8 animate-fade-in">
      {/* Dashboard Header with Logo */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-6 relative -mx-6 px-6 rounded-b-3xl">
        {/* Top center logo */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <DashboardLogo size="lg" />
        </div>
        
        <div className="container mx-auto pt-10 text-center">
          <h1 className="text-3xl font-bold">Macrofolio Dashboard</h1>
          <p className="text-white/80 text-sm mt-1">Track every investment. One portfolio. On-chain.</p>
          
          {/* Asset Count */}
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
            <Layers className="w-4 h-4" />
            <span className="text-sm">{assets.length} Assets Tracked</span>
            {isDemoMode && <span className="text-xs bg-warning text-warning-foreground px-2 py-0.5 rounded">DEMO</span>}
          </div>
        </div>
      </div>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-warning" />
            <div>
              <p className="text-warning font-medium">Demo Mode Active</p>
              <p className="text-textMuted text-sm">Sample portfolio data loaded. Connect wallet for real blockchain anchoring.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleRefreshPrices}
              disabled={refreshing}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Prices
            </button>
          </div>
        </div>
      )}

      {/* Market Overview - Live Market Data */}
      <MarketOverview />

      {/* Portfolio Summary - Hero Section */}
      <PortfolioSummary 
        isDemoMode={isDemoMode} 
        summary={summary}
        totalAssets={assets.length}
      />

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PerformanceChart assets={assets} />
        <Allocation assets={assets} />
      </div>

      {/* Features Highlight */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-interactive bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <Shield className="w-5 h-5 text-info" />
            </div>
            <span className="text-textMuted text-sm font-medium">Self-Custodial</span>
          </div>
          <p className="text-textPrimary text-sm">
            {isDemoMode 
              ? 'Your assets remain under your control with Supabase-powered storage.'
              : 'Your assets remain under your control with Supabase + blockchain anchoring.'}
          </p>
        </div>
        
        <div className="card-interactive bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Zap className="w-5 h-5 text-success" />
            </div>
            <span className="text-textMuted text-sm font-medium">Real-Time Data</span>
          </div>
          <p className="text-textPrimary text-sm">
            Live price updates and portfolio tracking with sub-second latency.
          </p>
        </div>
        
        <div className="card-interactive bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Layers className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-textMuted text-sm font-medium">Multi-Asset</span>
          </div>
          <p className="text-textPrimary text-sm">
            Track Stocks, Crypto, ETFs, Real Estate, and more in one unified view.
          </p>
        </div>
      </div>

      {/* Asset Types Badges */}
      <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Layers className="w-5 h-5 text-textMuted" />
          <p className="text-textMuted text-sm font-medium uppercase tracking-wide">Tracked Asset Types</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {assetTypes.map((type, index) => (
            <span 
              key={index}
              className="px-4 py-2 bg-bg/50 rounded-lg text-sm text-textPrimary border border-border hover:border-success/30 hover:bg-cardHover transition-all duration-200 cursor-default"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Assets Table */}
      <AssetsTable isDemoMode={isDemoMode} />
    </div>
  );
};

export default Dashboard;

