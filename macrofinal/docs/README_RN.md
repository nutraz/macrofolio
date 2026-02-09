# Macrofolio Mobile - React Native Portfolio Tracker

## Hackathon Submission - React Native Mobile App

This is a new React Native mobile application built for the hackathon.

## Quick Start

```bash
# Install dependencies
cd macrofinal/mobile
npm install

# Start the development server
npm run start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## RevenueCat Integration

The app uses RevenueCat for in-app purchases and subscriptions:

- **Free Tier**: Track up to 10 investments with basic portfolio total
- **Premium Tier ($4.99/month or $49.99/year)**: 
  - Unlimited investments
  - Real-time price updates
  - Risk analysis (volatility, Sharpe ratio)
  - Diversification metrics (country/sector exposure)
  - Advanced charts
  - Export functionality

## Architecture

- React Native with TypeScript
- RevenueCat for monetization
- AsyncStorage for local data persistence
- Push notifications for amortization reminders

## Features Implemented

### Core (Free)
- ✅ Add/Edit/Delete investments
- ✅ Manual entry for all asset types
- ✅ Portfolio summary
- ✅ Basic allocation view

### Premium
- ✅ Real-time price API integration
- ✅ Risk analysis metrics
- ✅ Diversification analysis
- ✅ Advanced performance charts
- ✅ Export to CSV/PDF

## Next Steps

1. Install React Native CLI: `npm install -g react-native-cli`
2. Set up Android Studio/Xcode for native builds
3. Configure RevenueCat with your API keys
4. Add real stock/crypto API (Alpha Vantage, CoinGecko, etc.)
