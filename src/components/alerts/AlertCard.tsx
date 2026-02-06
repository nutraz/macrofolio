import React from 'react';
import { Bell, TrendingUp, TrendingDown, Edit2, Trash2, Play, Pause, Check } from 'lucide-react';
import { Alert, AlertCondition } from '../../lib/types/alert';
import { formatCondition, formatThreshold, getTimeElapsed } from '../../lib/utils/alertUtils';

interface AlertCardProps {
  alert: Alert;
  currentPrice?: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (alert: Alert) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, currentPrice, onToggle, onDelete, onEdit }) => {
  const isTriggered = alert.status === 'triggered';
  const isPaused = alert.status === 'paused';
  const isActive = alert.status === 'active';
  
  const getConditionIcon = (condition: AlertCondition) => {
    switch (condition) {
      case 'price_above':
      case 'percent_up':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'price_below':
      case 'percent_down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };
  
  const getStatusColor = () => {
    if (isTriggered) return 'border-l-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent';
    if (isPaused) return 'border-l-slate-500 bg-gradient-to-r from-slate-500/5 to-transparent';
    return 'border-l-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent';
  };
  
  const getStatusBadge = () => {
    if (isTriggered) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
          <Check className="w-3 h-3" />
          Triggered
        </span>
      );
    }
    if (isPaused) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
          <Pause className="w-3 h-3" />
          Paused
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
        <Bell className="w-3 h-3" />
        Active
      </span>
    );
  };
  
  const priceChange = currentPrice !== undefined 
    ? ((currentPrice - alert.currentPrice) / alert.currentPrice) * 100 
    : 0;
  
  return (
    <div className={`relative p-4 rounded-xl border border-slate-700/50 ${getStatusColor()} hover:border-slate-600 transition-all duration-200`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Asset Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
            alert.assetType === 'crypto' 
              ? 'bg-amber-500/20 text-amber-400' 
              : alert.assetType === 'stocks'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {alert.assetSymbol.slice(0, 2)}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white truncate">{alert.assetName}</h3>
              {getStatusBadge()}
            </div>
            
            {/* Condition */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              {getConditionIcon(alert.condition)}
              <span>
                {formatCondition(alert.condition)} {formatThreshold(alert.condition, alert.threshold, alert.assetSymbol)}
              </span>
            </div>
            
            {/* Current Price Info */}
            {currentPrice !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Current:</span>
                <span className="font-medium text-white">${currentPrice.toLocaleString()}</span>
                <span className={`text-xs ${priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
            )}
            
            {/* Trigger Time */}
            {alert.triggeredAt && (
              <p className="text-xs text-amber-400 mt-1">
                Triggered {getTimeElapsed(alert.triggeredAt)}
              </p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(alert.id)}
            className={`p-2 rounded-lg transition-colors ${
              isActive 
                ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-400' 
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
            }`}
            title={isActive ? 'Pause' : 'Activate'}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => onEdit(alert)}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDelete(alert.id)}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;

