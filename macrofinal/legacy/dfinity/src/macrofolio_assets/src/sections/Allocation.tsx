import React from 'react';
import { PieChart, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AllocationItem {
  name: string;
  value: number;
  color: string;
  textColor: string;
  bgColor: string;
  trend?: 'up' | 'down' | 'stable';
}

const Allocation: React.FC = () => {
  const allocations: AllocationItem[] = [
    { name: 'Stocks & ETFs', value: 45, color: '#3b82f6', textColor: 'text-blue-400', bgColor: 'bg-blue-400', trend: 'up' },
    { name: 'Cryptocurrency', value: 30, color: '#8b5cf6', textColor: 'text-purple-400', bgColor: 'bg-purple-400', trend: 'down' },
    { name: 'Gold & Silver', value: 15, color: '#f59e0b', textColor: 'text-amber-400', bgColor: 'bg-amber-400', trend: 'stable' },
    { name: 'Real Estate', value: 7, color: '#10b981', textColor: 'text-emerald-400', bgColor: 'bg-emerald-400', trend: 'up' },
    { name: 'Fixed Income', value: 3, color: '#ef4444', textColor: 'text-red-400', bgColor: 'bg-red-400', trend: 'stable' },
  ];

  const totalValue = 124580.25;
  const cryptoExposure = allocations.find(a => a.name === 'Cryptocurrency')?.value || 0;

  // Calculate diversification score based on allocation
  const diversificationScore = 78;

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-success" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-danger" />;
      default:
        return <Minus className="w-3 h-3 text-textMuted" />;
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6 shadow-card-glow card-interactive border-t-4 border-t-green-500/50 animate-fade-in">
      {/* Glow rail - visible color lane on left */}
      <div className="absolute inset-y-0 left-0 w-1 bg-green-500/80 shadow-[0_0_20px_rgba(34,197,94,0.6)]" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary transition-colors hover:text-white">Asset Allocation</h2>
          <p className="text-sm text-textMuted">Portfolio distribution across asset classes</p>
        </div>
        <div className="p-2 bg-bg/50 rounded-lg transition-colors hover:bg-bg/70">
          <PieChart className="w-5 h-5 text-textMuted" />
        </div>
      </div>
      {/* Directional underline - visible section header */}
      <div className="mt-3 h-[2px] w-12 bg-gradient-to-r from-green-500/80 to-transparent" />

      <div className="flex flex-col md:flex-row items-start md:items-center">
        {/* Pie Chart */}
        <div className="w-full md:w-1/2 mb-6 md:mb-0">
          <div className="relative w-40 h-40 mx-auto group">
            {/* Simple pie chart using conic gradient */}
            <div 
              className="w-full h-full rounded-full shadow-glow-blue transition-transform duration-500 group-hover:scale-105"
              style={{
                background: `conic-gradient(
                  #3b82f6 0% 45%, 
                  #8b5cf6 45% 75%, 
                  #f59e0b 75% 90%, 
                  #10b981 90% 97%, 
                  #ef4444 97% 100%
                )`,
              }}
            />
            {/* Center circle for donut effect */}
            <div 
              className="absolute inset-2 bg-card rounded-full flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-110"
              style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-textPrimary transition-transform duration-200">${(totalValue / 1000).toFixed(1)}k</p>
                <p className="text-xs text-textMuted">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Allocation List */}
        <div className="w-full md:w-1/2">
          <div className="space-y-3">
            {allocations.map((item) => (
              <div key={item.name} className="flex items-center justify-between group">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3 shadow-sm transition-transform duration-200 group-hover:scale-125" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-textMuted text-sm group-hover:text-textPrimary transition-colors">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-textPrimary transition-transform duration-200 group-hover:scale-105">
                    {item.value}%
                  </span>
                  <div className="w-20 bg-bg/50 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-500 group-hover:opacity-80" 
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                  {getTrendIcon(item.trend)}
                </div>
              </div>
            ))}
          </div>

          {/* Diversification Score - Signature Element */}
          <div className="mt-6 pt-6 border-t border-border ring-2 ring-green-500/30 ring-offset-4 ring-offset-card rounded-xl p-4 transition-all duration-200 hover:ring-green-500/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-textMuted text-sm font-medium">Diversification Score</span>
                <div className="group relative">
                  <AlertCircle className="w-4 h-4 text-textMuted cursor-help transition-colors hover:text-textPrimary" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-bg text-textPrimary text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-border z-10">
                    Higher scores indicate better risk distribution
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bg"></div>
                  </div>
                </div>
              </div>
              <span className={`text-xl font-bold transition-colors duration-300 ${
                diversificationScore >= 70 ? 'text-success' : 
                diversificationScore >= 50 ? 'text-warning' : 'text-danger'
              }`}>
                {diversificationScore}/100
              </span>
            </div>
            <div className="w-full bg-bg/50 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  diversificationScore >= 70 ? 'bg-success' : 
                  diversificationScore >= 50 ? 'bg-warning' : 'bg-danger'
                }`}
                style={{ width: `${diversificationScore}%` }}
              ></div>
            </div>
          </div>

          {/* Advisory / Rebalancing Hint */}
          <div className="mt-4 p-3 rounded-lg bg-warning/5 border border-warning/20 transition-all duration-200 hover:bg-warning/10">
            <div className="flex items-start space-x-2">
              {cryptoExposure > 40 ? (
                <>
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-textMuted text-xs mb-1">Portfolio Advisory</p>
                    <p className="text-textPrimary text-sm">
                      Heavy exposure to Crypto ({cryptoExposure}%). Consider rebalancing to reduce volatility risk.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-textMuted text-xs mb-1">Portfolio Advisory</p>
                    <p className="text-textPrimary text-sm">
                      Well-diversified portfolio with balanced risk distribution across asset classes.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Allocation;
