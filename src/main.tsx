import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { RevenueCatProvider } from './components/RevenueCatProvider'

// Check if we're in demo mode (default to true for easy setup)
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_REVENUECAT_API_KEY;

// Log mode for debugging
if (import.meta.env.DEV) {
  console.log(`[Macrofolio] Running in ${isDemoMode ? 'DEMO' : 'PRODUCTION'} mode`);
  console.log(`[Macrofolio] RevenueCat API key configured: ${!!import.meta.env.VITE_REVENUECAT_API_KEY}`);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RevenueCatProvider enableDemoMode={isDemoMode}>
      <App />
    </RevenueCatProvider>
  </React.StrictMode>,
)
