import React from 'react';
import { ArrowUp, ArrowDown, AlertCircle, Download, Plus, Zap, ExternalLink } from 'lucide-react';

interface Asset {
  id: number;
  name: string;
  symbol: string;
  type: string;
  quantity: number;
  price: number;
  value: number;
  change24h: number;
}

const AssetsTable: React.FC<{ isDemoMode?: boolean }> = ({ isDemoMode = true }) => {
  const assets: Asset[] = [
    { id: 1, name: 'Apple Inc.', symbol: 'AAPL', type: 'Stock', quantity: 10, price: 182.63, value: 1826.30, change24h: 2.5 },
    { id: 2, name: 'Bitcoin', symbol: 'BTC', type: 'Crypto', quantity: 0.5, price: 42580.00, value: 21290.00, change24h: 3.2 },
    { id: 3, name: 'Gold', symbol: 'XAU', type: 'Commodity', quantity: 50, price: 64.28, value: 3214.00, change24h: -0.5 },
    { id: 4, name: 'Vanguard S&P 500 ETF', symbol: 'VOO', type: 'ETF', quantity: 25, price: 415.32, value: 10383.00, change24h: 1.8 },
    { id: 5, name: 'Tesla Inc.', symbol: 'TSLA', type: 'Stock', quantity: 5, price: 218.89, value: 1094.45, change24h: -1.2 },
    { id: 6, name: 'Ethereum', symbol: 'ETH', type: 'Crypto', quantity: 2, price: 2280.50, value: 4561.00, change24h: 4.1 },
    { id: 7, name: 'Microsoft Corp.', symbol: 'MSFT', type: 'Stock', quantity: 8, price: 402.65, value: 3221.20, change24h: 1.5 },
  ];

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Stock': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Crypto': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'ETF': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'Commodity': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl overflow-hidden shadow-card-glow animate-fade-in">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-textPrimary transition-colors hover:text-white">Your Assets</h2>
          <p className="text-textMuted text-sm flex items-center gap-2">
            Track all your holdings in one place
            {isDemoMode && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-warning/20 text-warning text-xs rounded-full">
                <Zap className="w-3 h-3" />
                Demo
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-bg/50 rounded-xl px-4 py-3 border border-border transition-all duration-200 hover:bg-bg/70">
          <p className="text-textMuted text-xs uppercase tracking-wide">Total Value</p>
          <p className="text-2xl font-bold text-textPrimary transition-transform duration-200 hover:scale-105">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full" role="grid" aria-label="Assets table">
          <thead className="bg-bg/50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">Asset</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">Price</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">Value</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">24h Change</th>
              {!isDemoMode && (
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-textMuted uppercase tracking-wider">Status</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {assets.map((asset) => (
              <tr 
                key={asset.id} 
                className="interactive-row"
                tabIndex={0}
                role="row"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center border border-border transition-transform duration-200 hover:scale-110">
                      <span className="font-bold text-blue-400">{asset.symbol.charAt(0)}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-textPrimary transition-colors hover:text-white">{asset.name}</div>
                      <div className="text-sm text-textMuted">{asset.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeColor(asset.type)}`}>
                    {asset.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary">
                  {asset.quantity.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary">
                  ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-textPrimary transition-colors hover:text-white">
                  ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    asset.change24h >= 0 
                      ? 'bg-success/10 text-success border border-success/20 hover:bg-success/20' 
                      : 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20'
                  }`}>
                    {asset.change24h >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </span>
                </td>
                {!isDemoMode && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-info/10 text-info text-xs font-medium rounded-full border border-info/20">
                      <ExternalLink className="w-3 h-3" />
                      Verify
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-bg/50 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-textMuted text-sm transition-colors hover:text-textPrimary">
            <AlertCircle className="w-4 h-4" />
            <span>Showing {assets.length} assets • {isDemoMode ? 'Demo data' : 'Last anchored: Just now'}</span>
          </div>
          <div className="flex gap-3">
            <button 
              className="btn-ghost px-4 py-2 text-sm flex items-center transition-all duration-200 hover:bg-cardHover"
              aria-label="Export data to CSV"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button 
              className="btn-primary px-4 py-2 text-sm flex items-center transition-all duration-200"
              aria-label="Add new asset"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsTable;
