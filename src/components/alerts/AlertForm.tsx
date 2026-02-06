import React, { useState } from 'react';
import { X, Bell, TrendingUp, TrendingDown, AlertTriangle, Check } from 'lucide-react';
import type { AlertCondition, NotificationType } from '../../lib/types/alert';
import { validateAlertInput } from '../../lib/utils/alertUtils';

interface AlertFormProps {
  assetId: string;
  assetName: string;
  assetSymbol: string;
  assetType: 'stocks' | 'crypto' | 'gold' | 'real_estate' | 'fixed_income' | 'etf';
  currentPrice: number;
  onSubmit: (condition: AlertCondition, threshold: number, notificationType: NotificationType) => Promise<void>;
  onCancel: () => void;
  existingAlert?: {
    id: string;
    condition: AlertCondition;
    threshold: number;
    notificationType: NotificationType;
  };
}

const AlertForm: React.FC<AlertFormProps> = ({ 
  assetId, 
  assetName, 
  assetSymbol, 
  assetType, 
  currentPrice, 
  onSubmit, 
  onCancel,
  existingAlert 
}) => {
  const [condition, setCondition] = useState<AlertCondition>(existingAlert?.condition || 'price_above');
  const [threshold, setThreshold] = useState<number>(existingAlert?.threshold || currentPrice * 1.1);
  const [notificationType, setNotificationType] = useState<NotificationType>(existingAlert?.notificationType || 'in_app');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const conditionOptions: { value: AlertCondition; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      value: 'price_above', 
      label: 'Price Above', 
      icon: <TrendingUp className="w-5 h-5" />,
      description: `Trigger when ${assetSymbol} goes above your target price`
    },
    { 
      value: 'price_below', 
      label: 'Price Below', 
      icon: <TrendingDown className="w-5 h-5" />,
      description: `Trigger when ${assetSymbol} falls below your target price`
    },
    { 
      value: 'percent_up', 
      label: '% Increase', 
      icon: <TrendingUp className="w-5 h-5" />,
      description: `Trigger when ${assetSymbol} rises by percentage`
    },
    { 
      value: 'percent_down', 
      label: '% Decrease', 
      icon: <TrendingDown className="w-5 h-5" />,
      description: `Trigger when ${assetSymbol} falls by percentage`
    },
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validation = validateAlertInput(condition, threshold, currentPrice);
    if (!validation.valid) {
      setError(validation.error || 'Invalid input');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(condition, threshold, notificationType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };
  
  const getThresholdPlaceholder = () => {
    if (condition === 'percent_up' || condition === 'percent_down') {
      return 'e.g., 5';
    }
    return `e.g., ${(currentPrice * 1.1).toFixed(2)}`;
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {existingAlert ? 'Edit Alert' : 'Create Alert'}
              </h2>
              <p className="text-sm text-slate-400">{assetName} ({assetSymbol})</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Price */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Current Price</span>
              <span className="font-semibold text-white">${currentPrice.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Condition Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Alert Condition
            </label>
            <div className="grid grid-cols-2 gap-3">
              {conditionOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCondition(option.value)}
                  className={`p-3 rounded-xl border transition-all duration-200 text-left ${
                    condition === option.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                  }`}
                >
                  <div className={`${condition === option.value ? 'text-blue-400' : 'text-slate-400'} mb-1`}>
                    {option.icon}
                  </div>
                  <p className={`text-sm font-medium ${condition === option.value ? 'text-white' : 'text-slate-300'}`}>
                    {option.label}
                  </p>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {conditionOptions.find(c => c.value === condition)?.description}
            </p>
          </div>
          
          {/* Threshold Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {condition === 'percent_up' || condition === 'percent_down' ? 'Percentage (%)' : 'Target Price ($)'}
            </label>
            <div className="relative">
              {condition !== 'percent_up' && condition !== 'percent_down' && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              )}
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)}
                placeholder={getThresholdPlaceholder()}
                step={condition === 'percent_up' || condition === 'percent_down' ? '0.1' : '0.01'}
                min="0"
                className={`w-full ${condition === 'percent_up' || condition === 'percent_down' ? '' : 'pl-8'} pr-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
              />
              {(condition === 'percent_up' || condition === 'percent_down') && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
              )}
            </div>
            {condition !== 'percent_up' && condition !== 'percent_down' && (
              <p className="mt-1 text-xs text-slate-500">
                Current: ${currentPrice.toLocaleString()}
              </p>
            )}
          </div>
          
          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notification
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'in_app', label: 'In-App' },
                { value: 'email', label: 'Email' },
                { value: 'push', label: 'Push' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setNotificationType(option.value as NotificationType)}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    notificationType === option.value
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-slate-700 hover:border-slate-600 text-slate-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-600/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {existingAlert ? 'Update Alert' : 'Create Alert'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertForm;

