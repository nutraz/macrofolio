// Alert Types for Macrofolio Smart Alert System

export type AlertCondition = 
  | 'price_above'    // Trigger when price goes above threshold
  | 'price_below'     // Trigger when price goes below threshold
  | 'percent_up'      // Trigger when asset gains X%
  | 'percent_down'    // Trigger when asset loses X%
  | 'volume_spike';   // Trigger when volume increases significantly

export type NotificationType = 
  | 'in_app'          // In-app notification only
  | 'email'           // Email notification (future)
  | 'push';           // Push notification (future)

export type AlertStatus = 
  | 'active'          // Alert is actively monitoring
  | 'triggered'       // Alert has been triggered
  | 'paused'          // Alert is temporarily disabled
  | 'expired';        // Alert has expired

export interface Alert {
  id: string;
  assetId: string;
  assetName: string;
  assetSymbol: string;
  assetType: 'stocks' | 'crypto' | 'gold' | 'real_estate' | 'fixed_income' | 'etf';
  condition: AlertCondition;
  threshold: number;          // Price or percentage value
  currentPrice: number;       // Price when alert was created
  status: AlertStatus;
  notificationType: NotificationType;
  createdAt: Date;
  triggeredAt?: Date;
  expiresAt?: Date;
  message?: string;           // Custom message for the alert
}

export interface AlertTrigger {
  alertId: string;
  triggeredAt: Date;
  assetPrice: number;
  message: string;
}

export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  triggeredToday: number;
  triggeredThisWeek: number;
}

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

export interface AlertFilter {
  status?: AlertStatus[];
  assetType?: string[];
  assetId?: string;
}

