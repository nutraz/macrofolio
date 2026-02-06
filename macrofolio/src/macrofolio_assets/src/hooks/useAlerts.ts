import { useContext } from 'react';
import AlertsContext from '../context/AlertsContext';

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertsProvider');
  }
  return context;
}

export default useAlerts;

