import React from 'react';
import { TrendingUp } from 'lucide-react';

const PerformanceChart: React.FC = () => {
  // Mock data for sparkline
  const chartData = [30, 45, 35, 50, 42, 60, 55, 65, 70, 62, 75, 80];
  const maxValue = Math.max(...chartData);
  
  // Generate path for sparkline
  const points = chartData.map((value, index) => {
    const x = (index / (chartData.length - 1)) * 100;
    const y = ((maxValue - value) / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6 shadow-card-glow card-interactive border-t-4 border-t-blue-500/50 animate-fade-in">
      {/* Glow rail - visible color lane on left */}
      <div className="absolute inset-y-0 left-0 w-1 bg-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary transition-colors hover:text-white">Portfolio Performance</h2>
          <p className="text-sm text-textMuted">Track your portfolio growth over time</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
          <span className="text-success text-xs font-medium">Live</span>
        </div>
      </div>
      {/* Directional underline - visible section header */}
      <div className="mt-3 h-[2px] w-12 bg-gradient-to-r from-primary/80 to-transparent" />

      {/* Chart Area - Implies capability without placeholder text */}
      <div className="relative h-48 bg-gradient-to-br from-bg/50 to-bg/20 rounded-xl border border-border overflow-hidden group">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-20" 
             style={{
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
               backgroundSize: '20px 20px'
             }}>
        </div>
        
        {/* Faded line chart (visual placeholder until real data) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="2"
            points={points}
            vectorEffect="non-scaling-stroke"
            className="transition-all duration-500"
          />
          <polyline
            fill="url(#gradient)"
            stroke="none"
            points={`0,100 ${points} 100,100`}
            opacity="0.1"
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Tooltip hint */}
        <div className="absolute bottom-3 right-3 text-xs text-textMuted bg-bg/80 px-2 py-1 rounded opacity-60 group-hover:opacity-100 transition-opacity">
          Hover to see details
        </div>
      </div>

      {/* Stats Grid - Identity blocks for visibility */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="interactive-row rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 text-center border border-border hover:border-success/30 transition-all duration-200">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="w-3 h-3 text-success" />
            <p className="text-textMuted text-xs uppercase tracking-wide">Today</p>
          </div>
          <p className="text-xl font-bold text-success transition-transform duration-200">+2.5%</p>
        </div>
        <div className="interactive-row rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 text-center border border-border hover:border-info/30 transition-all duration-200">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="w-3 h-3 text-info" />
            <p className="text-textMuted text-xs uppercase tracking-wide">This Week</p>
          </div>
          <p className="text-xl font-bold text-info transition-transform duration-200">+5.1%</p>
        </div>
        <div className="interactive-row rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 text-center border border-border hover:border-warning/30 transition-all duration-200">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="w-3 h-3 text-warning" />
            <p className="text-textMuted text-xs uppercase tracking-wide">This Month</p>
          </div>
          <p className="text-xl font-bold text-warning transition-transform duration-200">+8.7%</p>
        </div>
        <div className="interactive-row rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 text-center border border-border hover:border-purple-500/30 transition-all duration-200">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className="w-3 h-3 text-purple-500" />
            <p className="text-textMuted text-xs uppercase tracking-wide">All Time</p>
          </div>
          <p className="text-xl font-bold text-purple-500 transition-transform duration-200">+24.3%</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
