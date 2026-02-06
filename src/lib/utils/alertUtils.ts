import type { Alert, AlertCondition } from '../types/alert';

/**
 * Generate a unique ID for alerts
 */
export const generateAlertId = (): string => {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format alert condition for display
 */
export const formatCondition = (condition: AlertCondition): string => {
  const conditionMap: Record<AlertCondition, string> = {
    'price_above': 'Price goes above',
    'price_below': 'Price goes below',
    'percent_up': 'Rises by',
    'percent_down': 'Falls by',
    'volume_spike': 'Volume spikes',
  };
  return conditionMap[condition] || condition;
};

/**
 * Format threshold value based on condition
 */
export const formatThreshold = (condition: AlertCondition, threshold: number, symbol: string): string => {
  if (condition === 'percent_up' || condition === 'percent_down' || condition === 'volume_spike') {
    return `${threshold.toFixed(1)}%`;
  }
  return `${symbol}${threshold.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Check if an alert should trigger based on current price
 */
export const checkAlertCondition = (
  condition: AlertCondition,
  threshold: number,
  currentPrice: number,
  originalPrice?: number
): boolean => {
  switch (condition) {
    case 'price_above':
      return currentPrice >= threshold;
    case 'price_below':
      return currentPrice <= threshold;
    case 'percent_up':
      if (!originalPrice) return false;
      const percentUp = ((currentPrice - originalPrice) / originalPrice) * 100;
      return percentUp >= threshold;
    case 'percent_down':
      if (!originalPrice) return false;
      const percentDown = ((originalPrice - currentPrice) / originalPrice) * 100;
      return percentDown >= threshold;
    case 'volume_spike':
      return false;
    default:
      return false;
  }
};

/**
 * Generate alert message when triggered
 */
export const generateAlertMessage = (alert: Alert, currentPrice: number): string => {
  const { condition, threshold, assetName, assetSymbol } = alert;
  
  switch (condition) {
    case 'price_above':
      return `${assetSymbol} has risen above $${threshold.toLocaleString()}! Current price: $${currentPrice.toLocaleString()}`;
    case 'price_below':
      return `${assetSymbol} has fallen below $${threshold.toLocaleString()}! Current price: $${currentPrice.toLocaleString()}`;
    case 'percent_up':
      return `${assetName} is up ${threshold.toFixed(1)}% or more! Current price: $${currentPrice.toLocaleString()}`;
    case 'percent_down':
      return `${assetName} is down ${threshold.toFixed(1)}% or more! Current price: $${currentPrice.toLocaleString()}`;
    case 'volume_spike':
      return `Unusual volume detected for ${assetName}`;
    default:
      return `Alert triggered for ${assetName}`;
  }
};

/**
 * Get time elapsed since alert creation or triggering
 */
export const getTimeElapsed = (date: Date): string => {
  const now = new Date();
  const elapsed = now.getTime() - new Date(date).getTime();
  
  const minutes = Math.floor(elapsed / 60000);
  const hours = Math.floor(elapsed / 3600000);
  const days = Math.floor(elapsed / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

/**
 * Check if alert is expired
 */
export const isAlertExpired = (alert: Alert): boolean => {
  if (!alert.expiresAt) return false;
  return new Date() > new Date(alert.expiresAt);
};

/**
 * Get default expiry date (7 days from now)
 */
export const getDefaultExpiry = (): Date => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return expiry;
};

/**
 * Validate alert input
 */
export const validateAlertInput = (
  condition: AlertCondition,
  threshold: number,
  currentPrice: number
): { valid: boolean; error?: string } => {
  if (threshold <= 0) {
    return { valid: false, error: 'Threshold must be greater than 0' };
  }
  
  if ((condition === 'price_above' || condition === 'price_below') && threshold <= 0) {
    return { valid: false, error: 'Price threshold must be greater than 0' };
  }
  
  if (condition === 'price_above' && threshold <= currentPrice) {
    return { valid: false, error: 'Price above threshold must be higher than current price' };
  }
  
  if (condition === 'price_below' && threshold >= currentPrice) {
    return { valid: false, error: 'Price below threshold must be lower than current price' };
  }
  
  if ((condition === 'percent_up' || condition === 'percent_down') && threshold > 100) {
    return { valid: false, error: 'Percentage change cannot exceed 100%' };
  }
  
  return { valid: true };
};

/**
 * Sort alerts by various criteria
 */
export const sortAlerts = (
  alerts: Alert[],
  criteria: 'date' | 'price' | 'status' | 'asset'
): Alert[] => {
  const sorted = [...alerts];
  
  switch (criteria) {
    case 'date':
      return sorted.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'price':
      return sorted.sort((a, b) => b.currentPrice - a.currentPrice);
    case 'status':
      return sorted.sort((a, b) => a.status.localeCompare(b.status));
    case 'asset':
      return sorted.sort((a, b) => a.assetName.localeCompare(b.assetName));
    default:
      return sorted;
  }
};

