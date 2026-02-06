import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { Alert, AlertStatus, CreateAlertInput, AlertStats } from '../lib/types/alert';
import { generateAlertId, checkAlertCondition, generateAlertMessage, isAlertExpired } from '../lib/utils/alertUtils';

interface AlertsContextType {
  alerts: Alert[];
  triggeredAlerts: Alert[];
  stats: AlertStats;
  loading: boolean;
  createAlert: (input: CreateAlertInput, currentPrice: number) => Promise<Alert>;
  updateAlert: (id: string, updates: Partial<Alert>) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  toggleAlert: (id: string) => Promise<void>;
  checkAlerts: (assetPrices: Record<string, number>) => Alert[];
  markAsRead: (id: string) => void;
  clearTriggered: () => void;
  getAlertsByAsset: (assetId: string) => Alert[];
  setCurrentPrices: (prices: Record<string, number>) => void;
}

const STORAGE_KEY = 'macrofolio_alerts';
const POLL_INTERVAL = 30000; // Check every 30 seconds

const AlertsContext = createContext<AlertsContextType | null>(null);

export const useAlerts = () => {
  const context = React.useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertsProvider');
  }
  return context;
};

interface AlertsProviderProps {
  children: React.ReactNode;
  isDemoMode?: boolean;
}

export const AlertsProvider: React.FC<AlertsProviderProps> = ({ 
  children,
  isDemoMode = false
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const lastCheckRef = useRef<number>(Date.now());

  // Load alerts from localStorage on mount
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Filter out expired alerts
          const validAlerts = parsed.filter((alert: Alert) => !isAlertExpired(alert));
          setAlerts(validAlerts);
        }
      } catch (error) {
        console.error('Failed to load alerts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAlerts();
  }, []);

  // Save alerts to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    }
  }, [alerts, loading]);

  // Polling: Check alerts against current prices every 30 seconds
  useEffect(() => {
    if (loading || Object.keys(currentPrices).length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      // Don't check more frequently than every 5 seconds
      if (now - lastCheckRef.current < 5000) return;
      
      lastCheckRef.current = now;
      
      // Check active alerts against current prices
      const activeAlerts = alerts.filter(a => a.status === 'active');
      if (activeAlerts.length === 0) return;

      const triggered: Alert[] = [];
      
      activeAlerts.forEach(alert => {
        const currentPrice = currentPrices[alert.assetId];
        if (!currentPrice) return;

        if (checkAlertCondition(alert.condition, alert.threshold, currentPrice, alert.currentPrice)) {
          const updatedAlert: Alert = {
            ...alert,
            status: 'triggered',
            triggeredAt: new Date(),
          };
          
          triggered.push(updatedAlert);
          
          // Update the alert in state
          setAlerts(prev => prev.map(a => 
            a.id === alert.id ? updatedAlert : a
          ));

          // Add to triggered alerts list (keep last 10)
          setTriggeredAlerts(prev => {
            const withMessage = { ...updatedAlert, message: generateAlertMessage(updatedAlert, currentPrice) };
            return [withMessage, ...prev].slice(0, 10);
          });
          
          // Log for debugging
          console.log(`[Alert] ${alert.assetSymbol} alert triggered! Price: $${currentPrice.toLocaleString()}`);
        }
      });
      
      if (triggered.length > 0) {
        console.log(`[Alert] ${triggered.length} alert(s) triggered`);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [alerts, loading, currentPrices]);

  // Calculate stats
  const stats: AlertStats = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      totalAlerts: alerts.length,
      activeAlerts: alerts.filter(a => a.status === 'active').length,
      triggeredToday: alerts.filter(a => 
        a.status === 'triggered' && 
        new Date(a.triggeredAt || 0) >= today
      ).length,
      triggeredThisWeek: alerts.filter(a => 
        a.status === 'triggered' && 
        new Date(a.triggeredAt || 0) >= weekAgo
      ).length,
    };
  }, [alerts]);

  // Create a new alert
  const createAlert = useCallback(async (input: CreateAlertInput, currentPrice: number): Promise<Alert> => {
    const newAlert: Alert = {
      id: generateAlertId(),
      assetId: input.assetId,
      assetName: input.assetName,
      assetSymbol: input.assetSymbol,
      assetType: input.assetType,
      condition: input.condition,
      threshold: input.threshold,
      currentPrice,
      status: 'active',
      notificationType: input.notificationType || 'in_app',
      createdAt: new Date(),
      expiresAt: input.expiresAt,
      message: input.message,
    };

    setAlerts((prev: Alert[]) => [...prev, newAlert]);
    
    // Immediately check if this new alert should trigger
    const price = currentPrices[input.assetId] || currentPrice;
    if (checkAlertCondition(input.condition, input.threshold, price, currentPrice)) {
      const triggeredAlert = { ...newAlert, status: 'triggered' as AlertStatus, triggeredAt: new Date() };
      setAlerts(prev => prev.map(a => a.id === newAlert.id ? triggeredAlert : a));
      setTriggeredAlerts(prev => [
        { ...triggeredAlert, message: generateAlertMessage(triggeredAlert, price) },
        ...prev
      ].slice(0, 10));
    }
    
    return newAlert;
  }, [currentPrices]);

  // Update an existing alert
  const updateAlert = useCallback(async (id: string, updates: Partial<Alert>) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, ...updates } : alert
    ));
  }, []);

  // Delete an alert
  const deleteAlert = useCallback(async (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    setTriggeredAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Toggle alert active/paused state
  const toggleAlert = useCallback(async (id: string) => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id === id) {
        const newStatus: AlertStatus = alert.status === 'active' ? 'paused' : 'active';
        return { ...alert, status: newStatus };
      }
      return alert;
    }));
  }, []);

  // Check all alerts against current prices
  const checkAlerts = useCallback((assetPrices: Record<string, number>): Alert[] => {
    const triggered: Alert[] = [];

    alerts.forEach(alert => {
      if (alert.status !== 'active') return;
      
      const currentPrice = assetPrices[alert.assetId];
      if (!currentPrice) return;

      if (checkAlertCondition(alert.condition, alert.threshold, currentPrice, alert.currentPrice)) {
        const updatedAlert: Alert = {
          ...alert,
          status: 'triggered',
          triggeredAt: new Date(),
        };
        
        triggered.push(updatedAlert);
        
        // Update the alert in state
        setAlerts(prev => prev.map(a => 
          a.id === alert.id ? updatedAlert : a
        ));

        // Add to triggered alerts list (keep last 10)
        setTriggeredAlerts(prev => {
          const withMessage = { ...updatedAlert, message: generateAlertMessage(updatedAlert, currentPrice) };
          return [withMessage, ...prev].slice(0, 10);
        });
      }
    });

    return triggered;
  }, [alerts]);

  // Mark triggered alert as read
  const markAsRead = useCallback((id: string) => {
    setTriggeredAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Clear all triggered alerts
  const clearTriggered = useCallback(() => {
    setTriggeredAlerts([]);
  }, []);

  // Get alerts for a specific asset
  const getAlertsByAsset = useCallback((assetId: string): Alert[] => {
    return alerts.filter(alert => alert.assetId === assetId);
  }, [alerts]);

  const value: AlertsContextType = {
    alerts,
    triggeredAlerts,
    stats,
    loading,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,
    checkAlerts,
    markAsRead,
    clearTriggered,
    getAlertsByAsset,
    setCurrentPrices,
  };

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  );
};

export default AlertsProvider;

