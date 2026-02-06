/**
 * Alert Types
 * 
 * Defines all type definitions for the smart alerts system.
 */

// Alert condition types
export type AlertCondition = 
  | 'price_above'    // Trigger when price goes above threshold
  | 'price_below'    // Trigger when price goes below threshold
  | 'percent_up'     // Trigger when price rises by percentage
  | 'percent_down'   // Trigger when price falls by percentage
  | 'volume_spike';  // Trigger when volume spikes (future)

// Alert status types
export type AlertStatus = 'active' | 'paused' | 'triggered' | 'expired';

// Notification types
export type NotificationType = 'in_app' | 'email' | 'push';

// Base alert interface
export interface Alert {
  id: string;
  assetId: string;
  assetName: string;
  assetSymbol: string;
  assetType: 'stocks' | 'crypto' | 'gold' | 'real_estate' | 'fixed_income' | 'etf';
  condition: AlertCondition;
  threshold: number;
  currentPrice: number;
  status: AlertStatus;
  notificationType: NotificationType;
  createdAt: Date;
  triggeredAt?: Date;
  expiresAt?: Date;
  message?: string;
}

// Input for creating a new alert
export interface CreateAlertInput {
  assetId: string;
  assetName: string;
  assetSymbol: string;
  assetType: 'stocks' | 'crypto' | 'gold' | 'real_estate' | 'fixed_income' | 'etf';
  condition: AlertCondition;
  threshold: number;
  notificationType?: NotificationType;
  expiresAt?: Date;
  message?: string;
}

// Alert statistics
export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  triggeredToday: number;
  triggeredThisWeek: number;
}

// Price data for alerts
export interface PriceData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
}

