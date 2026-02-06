# TODO - Vite Config Fix & Alerts Testing

## ✅ Completed Tasks
- [x] Fix Vite configuration path resolution (ESM-compatible)
- [x] Add react plugin to vite.config.ts
- [x] Update allowedHosts for development

## 🚀 Dev Server Ready

The Vite configuration has been fixed. To start the dev server:

```bash
cd /home/nutrazz/Projects/Macrofolio-clean/macrofolio/src/macrofolio_assets
npm run dev
```

Expected: Vite should start without errors and serve both index.html and dashboard.html

### 2. Verify Alerts Integration
The alerts system is already integrated with the Portfolio context:
- ✅ `PortfolioContext` feeds price updates to `AlertsContext` via `setCurrentPrices()`
- ✅ `AlertsContext` polls for price changes every 30 seconds
- ✅ Alert conditions are checked automatically

### 3. Test Alert Functionality
1. Navigate to http://localhost:5173/
2. Click "Try Demo Mode"
3. Go to Alerts page
4. Create an alert for Bitcoin (BTC) - e.g., price below $65,000
5. The system should trigger the alert when price condition is met

### 4. Manual Alert Test
To test without waiting for price changes:
```javascript
// In browser console, manually trigger an alert check:
const { checkAlerts } = await import('./src/context/AlertsContext');
const { assets } = await import('./src/context/PortfolioContext');
const priceMap = {};
assets.forEach(a => { priceMap[a.id] = a.currentPrice; });
checkAlerts(priceMap);
```

## 📊 Alert System Features
- ✅ Create price alerts (above/below threshold)
- ✅ Percentage-based alerts (up/down %)
- ✅ Automatic polling every 30 seconds
- ✅ Alert history (last 10 triggered)
- ✅ LocalStorage persistence
- ✅ Demo mode integration

