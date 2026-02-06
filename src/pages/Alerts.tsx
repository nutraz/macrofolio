import React, { useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import AlertList from '../components/alerts/AlertList';
import AlertForm from '../components/alerts/AlertForm';
import { AlertCondition, NotificationType, Alert } from '../lib/types/alert';
import { Bell, Plus, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface AlertsPageProps {
  // Add props if needed
}

const AlertsPage: React.FC<AlertsPageProps> = () => {
  const { alerts, stats, loading, createAlert, updateAlert, deleteAlert, toggleAlert, triggeredAlerts, assets } = useAlerts();
  const [showForm, setShowForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<typeof assets[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'alerts' | 'triggered'>('alerts');

  // Build asset prices map
  const assetPrices: Record<string, number> = {};
  assets.forEach(asset => {
    assetPrices[asset.id] = asset.price;
  });

  const handleCreateAlert = async (condition: AlertCondition, threshold: number, notificationType: NotificationType) => {
    if (!selectedAsset) return;
    
    await createAlert(
      selectedAsset.id,
      condition,
      threshold,
      notificationType
    );
    
    setShowForm(false);
    setSelectedAsset(null);
  };

  const handleOpenForm = (asset: typeof assets[0]) => {
    setSelectedAsset(asset);
    setShowForm(true);
  };

  const handleEditAlert = (alert: Alert) => {
    const asset = assets.find(a => a.id === alert.assetId);
    if (asset) {
      setSelectedAsset(asset);
      setShowForm(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-800 rounded w-48"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-slate-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-400" />
              Smart Alerts
            </h1>
            <p className="text-slate-400 mt-1">Get notified about important portfolio events and price movements.</p>
          </div>
          <button
            onClick={() => {
              if (assets.length > 0) {
                handleOpenForm(assets[0]);
              }
            }}
            disabled={assets.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-600/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Create Alert
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm text-slate-400">Total Alerts</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalAlerts}</p>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-400">Active</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.activeAlerts}</p>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <TrendingDown className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm text-slate-400">Triggered Today</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.triggeredToday}</p>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Bell className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm text-slate-400">This Week</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.triggeredThisWeek}</p>
          </div>
        </div>

        {/* Info Banner */}
        {assets.length === 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-blue-400 font-medium">No assets available</p>
              <p className="text-slate-400 text-sm">Add assets to your portfolio to create price alerts.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('triggered')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'triggered'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
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
                  <TrendingUp className="w-5 h-5 text-slate-400" />
                  Quick Alert Setup
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {assets.slice(0, 8).map(asset => (
                    <button
                      key={asset.id}
                      onClick={() => handleOpenForm(asset)}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-blue-500/50 transition-all text-left"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                        asset.type === 'crypto' 
                          ? 'bg-amber-500/20 text-amber-400' 
                          : asset.type === 'stocks'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {asset.symbol.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{asset.symbol}</p>
                        <p className="text-xs text-slate-400 truncate">{asset.name}</p>
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
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-amber-400" />
              Recently Triggered
            </h2>
            
            {triggeredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No alerts have been triggered yet.</p>
                <p className="text-sm text-slate-500 mt-1">
                  You'll see triggered alerts here when price conditions are met.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {triggeredAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{alert.assetName}</p>
                        <p className="text-sm text-slate-400">{alert.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
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

