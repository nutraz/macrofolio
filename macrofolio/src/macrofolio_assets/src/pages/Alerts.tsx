import React, { useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { usePortfolio } from '../context/PortfolioContext';
import AlertList from '../components/alerts/AlertList';
import AlertForm from '../components/alerts/AlertForm';
import { AlertCondition, NotificationType, Alert } from '../lib/types/alert';
import { Bell, Plus, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface AlertsPageProps {
  // Add props if needed
}

const AlertsPage: React.FC<AlertsPageProps> = () => {
  const { alerts, stats, loading, createAlert, updateAlert, deleteAlert, toggleAlert, triggeredAlerts } = useAlerts();
  const { assets, refreshPrices } = usePortfolio();
  const [showForm, setShowForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<{ id: string; name: string; symbol: string; type: 'stocks' | 'crypto' | 'gold' | 'real_estate' | 'fixed_income' | 'etf'; price: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'alerts' | 'triggered'>('alerts');

  // Build asset prices map
  const assetPrices: Record<string, number> = {};
  assets.forEach(asset => {
    assetPrices[asset.id] = asset.currentPrice;
  });

  const handleCreateAlert = async (condition: AlertCondition, threshold: number, notificationType: NotificationType) => {
    if (!selectedAsset) return;
    
    await createAlert(
      {
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        assetSymbol: selectedAsset.symbol,
        assetType: selectedAsset.type,
        condition,
        threshold,
        notificationType,
      },
      selectedAsset.price
    );
    
    setShowForm(false);
    setSelectedAsset(null);
  };

  const handleOpenForm = (asset: { id: string; name: string; symbol: string; type: 'stocks' | 'crypto' | 'gold' | 'real_estate' | 'fixed_income' | 'etf'; price: number }) => {
    setSelectedAsset(asset);
    setShowForm(true);
  };

  const handleEditAlert = (alert: Alert) => {
    const asset = assets.find(a => a.id === alert.assetId);
    if (asset) {
      setSelectedAsset({
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        type: asset.type,
        price: asset.currentPrice,
      });
      setShowForm(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-bg text-textPrimary p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-cardHover rounded w-48"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-cardHover rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-cardHover rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-bg text-textPrimary">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="w-8 h-8 text-primary" />
              Smart Alerts
            </h1>
            <p className="text-textMuted mt-1">Get notified about important portfolio events and price movements.</p>
          </div>
          <button
            onClick={() => {
              if (assets.length > 0) {
                const firstAsset = assets[0];
                handleOpenForm({
                  id: firstAsset.id,
                  name: firstAsset.name,
                  symbol: firstAsset.symbol,
                  type: firstAsset.type,
                  price: firstAsset.currentPrice,
                });
              }
            }}
            disabled={assets.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Create Alert
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-info/10 rounded-lg">
                <Bell className="w-5 h-5 text-info" />
              </div>
              <span className="text-sm text-textMuted">Total Alerts</span>
            </div>
            <p className="text-3xl font-bold text-textPrimary">{stats.totalAlerts}</p>
          </div>
          
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <span className="text-sm text-textMuted">Active</span>
            </div>
            <p className="text-3xl font-bold text-textPrimary">{stats.activeAlerts}</p>
          </div>
          
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-warning/10 rounded-lg">
                <TrendingDown className="w-5 h-5 text-warning" />
              </div>
              <span className="text-sm text-textMuted">Triggered Today</span>
            </div>
            <p className="text-3xl font-bold text-textPrimary">{stats.triggeredToday}</p>
          </div>
          
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Bell className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm text-textMuted">This Week</span>
            </div>
            <p className="text-3xl font-bold text-textPrimary">{stats.triggeredThisWeek}</p>
          </div>
        </div>

        {/* Info Banner */}
        {assets.length === 0 && (
          <div className="bg-info/10 border border-info/20 rounded-xl p-4 mb-8 flex items-start gap-3">
            <Info className="w-5 h-5 text-info mt-0.5" />
            <div>
              <p className="text-info font-medium">No assets in portfolio</p>
              <p className="text-textMuted text-sm">Add some assets to your portfolio to create price alerts.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'bg-primary text-primary-foreground'
                : 'bg-cardHover/50 text-textSecondary hover:bg-cardHover'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('triggered')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'triggered'
                ? 'bg-primary text-primary-foreground'
                : 'bg-cardHover/50 text-textSecondary hover:bg-cardHover'
            }`}
          >
            Triggered ({triggeredAlerts.length})
          </button>
        </div>

        {activeTab === 'alerts' ? (
          <>
            {/* Asset Quick Actions */}
            {assets.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-textMuted" />
                  Quick Alert Setup
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {assets.slice(0, 8).map(asset => (
                    <button
                      key={asset.id}
                      onClick={() => handleOpenForm(asset)}
                      className="flex items-center gap-3 p-3 bg-gradient-to-br from-card to-card/50 border border-border rounded-xl hover:border-primary/50 transition-all text-left"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                        asset.type === 'crypto' 
                          ? 'bg-warning/20 text-warning' 
                          : asset.type === 'stocks'
                            ? 'bg-info/20 text-info'
                            : 'bg-success/20 text-success'
                      }`}>
                        {asset.symbol.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-textPrimary truncate">{asset.symbol}</p>
                        <p className="text-xs text-textMuted truncate">{asset.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Alerts List */}
            <AlertList
              alerts={alerts}
              assetPrices={assetPrices}
              onToggle={toggleAlert}
              onDelete={deleteAlert}
              onEdit={handleEditAlert}
            />
          </>
        ) : (
          /* Triggered Alerts */
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-warning" />
              Recently Triggered
            </h2>
            
            {triggeredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-textMuted mx-auto mb-4" />
                <p className="text-textMuted">No alerts have been triggered yet.</p>
                <p className="text-sm text-textMuted mt-1">
                  You'll see triggered alerts here when price conditions are met.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {triggeredAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 bg-warning/10 border border-warning/20 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-warning/20 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium text-textPrimary">{alert.assetName}</p>
                        <p className="text-sm text-textMuted">{alert.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="px-3 py-1.5 bg-cardHover hover:bg-cardHover/80 rounded-lg text-sm text-textSecondary transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alert Creation Modal */}
        {showForm && selectedAsset && (
          <AlertForm
            assetId={selectedAsset.id}
            assetName={selectedAsset.name}
            assetSymbol={selectedAsset.symbol}
            assetType={selectedAsset.type}
            currentPrice={selectedAsset.price}
            onSubmit={handleCreateAlert}
            onCancel={() => {
              setShowForm(false);
              setSelectedAsset(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AlertsPage;

