import React, { useState } from 'react';
import { AlertCondition, NotificationType } from '../../lib/types/alert';
import { validateAlertInput, formatThreshold } from '../../lib/utils/alertUtils';
import { X, Bell, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface AlertFormProps {
  assetId: string;
  assetName: string;
  assetSymbol: string;
  assetType: 'stocks' | 'crypto' | 'gold' | 'real_estate' | 'fixed_income' | 'etf';
  currentPrice: number;
  onSubmit: (condition: AlertCondition, threshold: number, notificationType: NotificationType) => Promise<void>;
  onCancel: () => void;
}

const AlertForm: React.FC<AlertFormProps> = ({
  assetId,
  assetName,
  assetSymbol,
  currentPrice,
  onSubmit,
  onCancel,
}) => {
  const [condition, setCondition] = useState<AlertCondition>('price_above');
  const [threshold, setThreshold] = useState<string>('');
  const [notificationType, setNotificationType] = useState<NotificationType>('in_app');
  const [error, setError] = useState<string>('');

  const conditionOptions: { value: AlertCondition; label: string; icon: React.ReactNode }[] = [
    { value: 'price_above', label: 'Price goes above', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'price_below', label: 'Price goes below', icon: <TrendingDown className="w-4 h-4" /> },
    { value: 'percent_up', label: 'Rises by %', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'percent_down', label: 'Falls by %', icon: <TrendingDown className="w-4 h-4" /> },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const thresholdValue = parseFloat(threshold);
    const validation = validateAlertInput(condition, thresholdValue, currentPrice);
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid alert configuration');
      return;
    }

    await onSubmit(condition, thresholdValue, notificationType);
  };

  const getSuggestedThresholds = () => {
    const suggestions: { label: string; value: number }[] = [];
    
    if (condition === 'price_above' || condition === 'price_below') {
      const percentOptions = [5, 10, 15, 20, 25, 50];
      percentOptions.forEach(pct => {
        if (condition === 'price_above') {
          suggestions.push({
            label: `+${pct}%`,
            value: currentPrice * (1 + pct / 100)
          });
        } else {
          suggestions.push({
            label: `-${pct}%`,
            value: currentPrice * (1 - pct / 100)
          });
        }
      });
    } else {
      suggestions.push({ label: '5%', value: 5 });
      suggestions.push({ label: '10%', value: 10 });
      suggestions.push({ label: '15%', value: 15 });
      suggestions.push({ label: '25%', value: 25 });
    }
    
    return suggestions;
  };

  const suggestedThresholds = getSuggestedThresholds();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-6 max-w-md mx-4 shadow-xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-textPrimary">Create Price Alert</h3>
              <p className="text-sm text-textMuted">{assetName} ({assetSymbol})</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-cardHover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-textMuted" />
          </button>
        </div>

        {/* Current Price */}
        <div className="bg-cardHover/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-textMuted">Current Price</span>
            <span className="text-lg font-semibold text-textPrimary">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Condition Selection */}
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">
              Alert Condition
            </label>
            <div className="grid grid-cols-2 gap-2">
              {conditionOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCondition(option.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    condition === option.value
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-cardHover/50 border-border text-textSecondary hover:border-primary/50'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Threshold Input */}
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">
              {condition === 'percent_up' || condition === 'percent_down' ? 'Percentage (%)' : `Price (${assetSymbol})`}
            </label>
            <div className="relative">
              {(condition === 'percent_up' || condition === 'percent_down') ? (
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="Enter percentage (e.g., 10)"
                  className="w-full px-4 py-3 bg-cardHover/50 border border-border rounded-lg text-textPrimary placeholder-textMuted focus:outline-none focus:border-primary transition-colors"
                />
              ) : (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted">$</span>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    placeholder="Enter price"
                    className="w-full pl-8 pr-4 py-3 bg-cardHover/50 border border-border rounded-lg text-textPrimary placeholder-textMuted focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}
            </div>
            
            {/* Suggested Thresholds */}
            <div className="flex flex-wrap gap-2 mt-3">
              {suggestedThresholds.slice(0, 4).map((suggestion) => (
                <button
                  key={suggestion.label}
                  type="button"
                  onClick={() => setThreshold(suggestion.value.toFixed(2))}
                  className="px-3 py-1.5 bg-cardHover/50 hover:bg-cardHover text-xs text-textMuted rounded-lg transition-colors"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">
              Notification Method
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNotificationType('in_app')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  notificationType === 'in_app'
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-cardHover/50 border-border text-textSecondary hover:border-primary/50'
                }`}
              >
                <Bell className="w-4 h-4" />
                In-App
              </button>
              <button
                type="button"
                onClick={() => setNotificationType('email')}
                disabled
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-textMuted text-textMuted text-sm font-medium cursor-not-allowed opacity-50"
              >
                <Clock className="w-4 h-4" />
                Email (Soon)
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {/* Preview */}
          {threshold && !error && (
            <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
              <p className="text-sm text-info">
                <strong>Alert Preview:</strong> You'll be notified when {assetSymbol}{' '}
                {condition === 'price_above' && 'rises above'}
                {condition === 'price_below' && 'falls below'}
                {condition === 'percent_up' && 'rises'}
                {condition === 'percent_down' && 'falls'}
                {' '}{formatThreshold(condition, parseFloat(threshold), assetSymbol)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-cardHover border border-border rounded-lg text-textPrimary font-medium hover:bg-cardHover/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Create Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertForm;

