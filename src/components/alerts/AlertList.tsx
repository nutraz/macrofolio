import React from 'react';
import { Bell, TrendingUp, TrendingDown } from 'lucide-react';
import AlertCard from './AlertCard';
import type { Alert } from '../../lib/types/alert';

interface AlertListProps {
  alerts: Alert[];
  assetPrices: Record<string, number>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (alert: Alert) => void;
}

const AlertList: React.FC<AlertListProps> = ({ alerts, assetPrices, onToggle, onDelete, onEdit }) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No alerts yet</h3>
        <p className="text-slate-400 max-w-sm mx-auto">
          Create your first price alert to get notified when your assets hit your target prices.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Group by status */}
      {['active', 'paused', 'triggered'].map((status) => {
        const filteredAlerts = alerts.filter(a => a.status === status);
        if (filteredAlerts.length === 0) return null;
        
        return (
          <div key={status}>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              {status === 'active' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
              {status === 'paused' && <Bell className="w-4 h-4 text-slate-500" />}
              {status === 'triggered' && <TrendingDown className="w-4 h-4 text-amber-500" />}
              {status.charAt(0).toUpperCase() + status.slice(1)} ({filteredAlerts.length})
            </h3>
            <div className="grid gap-3">
              {filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  currentPrice={assetPrices[alert.assetId]}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertList;

