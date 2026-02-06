import React from 'react';
import { Alert, AlertCondition } from '../../lib/types/alert';
import { formatCondition, formatThreshold, getTimeElapsed } from '../../lib/utils/alertUtils';
import { Bell, BellOff, Trash2, Edit2, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';

interface AlertCardProps {
  alert: Alert;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (alert: Alert) => void;
  currentPrice?: number;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onToggle, onDelete, onEdit, currentPrice }) => {
  const getConditionIcon = () => {
    switch (alert.condition) {
      case 'price_above':
      case 'percent_up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'price_below':
      case 'percent_down':
        return <TrendingDown className="w-4 h-4 text-danger" />;
      default:
        return <Bell className="w-4 h-4 text-info" />;
    }
  };

  const getStatusBadge = () => {
    switch (alert.status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-success/20 text-success rounded-full text-xs">
            <Bell className="w-3 h-3" />
            Active
          </span>
        );
      case 'triggered':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-warning/20 text-warning rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Triggered
          </span>
        );
      case 'paused':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-textMuted/20 text-textMuted rounded-full text-xs">
            <BellOff className="w-3 h-3" />
            Paused
          </span>
        );
      case 'expired':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-danger/20 text-danger rounded-full text-xs">
            <Clock className="w-3 h-3" />
            Expired
          </span>
        );
    }
  };

  const formatCurrentPrice = () => {
    if (currentPrice !== undefined) {
      return `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${alert.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-4 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Asset Icon */}
          <div className={`p-2 rounded-lg ${
            alert.condition.includes('up') 
              ? 'bg-success/10' 
              : alert.condition.includes('down')
                ? 'bg-danger/10'
                : 'bg-info/10'
          }`}>
            <span className="text-lg font-bold">{alert.assetSymbol.slice(0, 2)}</span>
          </div>

          {/* Alert Details */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-textPrimary">{alert.assetName}</h4>
              {getStatusBadge()}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-textSecondary mb-2">
              {getConditionIcon()}
              <span>
                {formatCondition(alert.condition)} {formatThreshold(alert.condition, alert.threshold, alert.assetSymbol)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-textMuted">
              <span>Created {getTimeElapsed(alert.createdAt)}</span>
              {alert.triggeredAt && (
                <span className="text-warning">
                  Triggered {getTimeElapsed(alert.triggeredAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Current Price */}
        <div className="text-right">
          <div className="text-lg font-semibold text-textPrimary">
            {formatCurrentPrice()}
          </div>
          <div className="text-xs text-textMuted">
            Current Price
          </div>
        </div>
      </div>

      {/* Actions */}
      {alert.status !== 'triggered' && alert.status !== 'expired' && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          <button
            onClick={() => onToggle(alert.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              alert.status === 'active'
                ? 'bg-warning/10 text-warning hover:bg-warning/20'
                : 'bg-success/10 text-success hover:bg-success/20'
            }`}
          >
            {alert.status === 'active' ? (
              <>
                <BellOff className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Resume
              </>
            )}
          </button>

          {onEdit && (
            <button
              onClick={() => onEdit(alert)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-cardHover hover:bg-cardHover/80 text-textPrimary transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}

          <button
            onClick={() => onDelete(alert.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-danger/10 text-danger hover:bg-danger/20 transition-colors ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {/* Triggered Message */}
      {alert.status === 'triggered' && alert.message && (
        <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-sm text-warning">{alert.message}</p>
        </div>
      )}
    </div>
  );
};

export default AlertCard;

