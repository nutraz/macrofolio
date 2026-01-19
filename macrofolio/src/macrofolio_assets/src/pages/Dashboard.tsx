import React from 'react';
import PortfolioSummary from '../sections/PortfolioSummary';
import PerformanceChart from '../sections/PerformanceChart';
import Allocation from '../sections/Allocation';
import AssetsTable from '../sections/AssetsTable';
import { Layers, Shield, Zap } from 'lucide-react';

interface DashboardProps {
  assetTypes: string[];
  loading: boolean;
  isDemoMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ assetTypes, loading, isDemoMode }) => {
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8 animate-fade-in">
        {/* Skeleton Portfolio Summary */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-8 shadow-card-glow">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="skeleton-avatar w-10 h-10"></div>
                <div className="skeleton-text w-32"></div>
              </div>
              <div className="skeleton-title w-48"></div>
              <div className="skeleton-text w-40"></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="skeleton-card w-24 h-20"></div>
              <div className="skeleton-card w-24 h-20"></div>
              <div className="skeleton-card w-24 h-20"></div>
            </div>
          </div>
        </div>

        {/* Skeleton Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6 shadow-card-glow">
            <div className="skeleton-title w-40 mb-6"></div>
            <div className="skeleton-card h-48"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="skeleton-card h-16"></div>
              <div className="skeleton-card h-16"></div>
              <div className="skeleton-card h-16"></div>
              <div className="skeleton-card h-16"></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6 shadow-card-glow">
            <div className="skeleton-title w-40 mb-6"></div>
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="skeleton-avatar w-40 h-40 mx-auto mb-6 md:mb-0"></div>
              <div className="flex-1 space-y-3 ml-0 md:ml-6">
                <div className="skeleton-text w-full"></div>
                <div className="skeleton-text w-full"></div>
                <div className="skeleton-text w-full"></div>
                <div className="skeleton-text w-3/4"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Features */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="skeleton-card h-32"></div>
          <div className="skeleton-card h-32"></div>
          <div className="skeleton-card h-32"></div>
        </div>

        {/* Skeleton Asset Types */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6">
          <div className="skeleton-title w-40 mb-4"></div>
          <div className="flex flex-wrap gap-2">
            <div className="skeleton-card w-24 h-8"></div>
            <div className="skeleton-card w-24 h-8"></div>
            <div className="skeleton-card w-24 h-8"></div>
            <div className="skeleton-card w-24 h-8"></div>
            <div className="skeleton-card w-24 h-8"></div>
            <div className="skeleton-card w-24 h-8"></div>
          </div>
        </div>

        {/* Skeleton Table */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl overflow-hidden shadow-card-glow">
          <div className="px-6 py-5 border-b border-border">
            <div className="skeleton-title w-32 mb-2"></div>
            <div className="skeleton-text w-48"></div>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="skeleton-avatar w-10 h-10"></div>
                  <div className="space-y-2">
                    <div className="skeleton-text w-32"></div>
                    <div className="skeleton-text w-16"></div>
                  </div>
                </div>
                <div className="skeleton-text w-20"></div>
                <div className="skeleton-text w-16"></div>
                <div className="skeleton-text w-24"></div>
                <div className="skeleton-text w-24"></div>
                <div className="skeleton-text w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8 animate-fade-in">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-warning" />
            <div>
              <p className="text-warning font-medium">Demo Mode Active</p>
              <p className="text-textMuted text-sm">Data is local. Connect wallet to enable blockchain anchoring.</p>
            </div>
          </div>
          <button className="btn-secondary text-sm">
            Connect Wallet
          </button>
        </div>
      )}

      {/* Portfolio Summary - Hero Section */}
      <PortfolioSummary isDemoMode={isDemoMode} />

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PerformanceChart />
        <Allocation />
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
