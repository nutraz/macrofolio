import React from 'react';
import { Plus, Download, Zap } from 'lucide-react';

interface PortfolioProps {
  isDemoMode?: boolean;
}

const Portfolio: React.FC<PortfolioProps> = ({ isDemoMode = true }) => {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary">Portfolio Management</h1>
          <p className="text-textMuted mt-1 flex items-center gap-2">
            Manage and track all your investments in one place
            {isDemoMode && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-warning/20 text-warning text-xs rounded-full">
                <Zap className="w-3 h-3" />
                Demo
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-ghost flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Asset Overview */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-textPrimary">Asset Overview</h3>
          <p className="text-textMuted">
            View detailed breakdown of your holdings across all asset classes including Stocks, Crypto, Real Estate, and more.
          </p>
          {isDemoMode && (
            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-warning text-sm">
                Demo mode: Connect your wallet to enable full asset management with blockchain anchoring.
              </p>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-textPrimary">Transaction History</h3>
          <p className="text-textMuted">
            Track all your buys, sells, and transfers with verified blockchain proofs.
          </p>
          {isDemoMode && (
            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-warning text-sm">
                Enable Web3 mode to anchor transactions to Polygon Amoy testnet.
              </p>
            </div>
          )}
        </div>

        {/* Performance Analytics */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-textPrimary">Performance Analytics</h3>
          <p className="text-textMuted">
            Analyze portfolio performance with real-time charts and historical data.
          </p>
        </div>

        {/* Blockchain Anchors */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-textPrimary flex items-center gap-2">
            Blockchain Anchors
            {!isDemoMode && (
              <span className="px-2 py-0.5 bg-success/20 text-success text-xs rounded-full">
                Active
              </span>
            )}
          </h3>
          <p className="text-textMuted">
            {isDemoMode 
              ? "Anchor your portfolio data to the blockchain for immutable proof of ownership."
              : "Your portfolio actions are being anchored to Polygon Amoy testnet for immutable proof."}
          </p>
          <div className="mt-4">
            <button className="btn-secondary w-full">
              {isDemoMode ? "Enable Web3 Mode" : "View Anchors"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
