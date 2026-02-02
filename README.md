<div align="center">
  <img src="https://raw.githubusercontent.com/nutraz/macrofolio/main/macrofolio/src/public/ChatGPT%20Image%20Jan%2018%2C%202026%2C%2005_03_10%20PM.png" alt="Macrofolio Logo" width="150" height="150" />
  
  # **Macrofolio 📊**
  
  **Blockchain-powered Investment Portfolio Tracker for Josh @VisualFaktory's Shipyard Brief**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Polygon](https://img.shields.io/badge/Polygon-Amoy-blue)](https://polygon.technology/)
  [![RevenueCat](https://img.shields.io/badge/Monetization-RevenueCat-orange)](https://www.revenuecat.com/)]
</div>

## 🎯 Problem Statement
*Josh's investors juggle stocks, gold, funds, fixed income, real estate across multiple platforms — messy to track and hard to understand at a glance.*

## ✨ Solution
Macrofolio provides a unified, blockchain-based portfolio tracker where users can:
- Log investments across all asset classes
- Get real-time price updates via blockchain transparency
- Set alerts for non-listed products
- Access premium risk & diversification analysis

## 🚀 Live Demos
| Platform | Link | Status |
|----------|------|--------|
| 🌐 Web Demo | [macrofolio.vercel.app](https://macrofolio.vercel.app/) | Live |
| 📱 Mobile | Progressive Web App | Responsive |
| 🔗 Smart Contract | [Polygonscan](https://amoy.polygonscan.com/) | Deployed |

## 🏗️ Architecture

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Frontend │ │ Backend │ │ Blockchain │
│ (React+Vite) │◄──►│ (Supabase) │◄──►│ (Polygon Amoy)│
│ Tailwind CSS │ │ PostgreSQL │ │ Solidity │
└─────────────────┘ └─────────────────┘ └─────────────────┘
│ │ │
└───────────────────────┼───────────────────────┘
│
┌─────────────────┐
│ RevenueCat │
│ Monetization │
└─────────────────┘
text


## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Blockchain**: Solidity, Hardhat, Polygon Amoy Testnet
- **Mobile**: Progressive Web App (PWA)
- **Monetization**: RevenueCat for premium subscriptions

## 📁 Project Structure

macrofolio/
├── src/
│ ├── macrofolio_assets/ # Frontend React app
│ │ ├── src/
│ │ │ ├── components/ # React components
│ │ │ ├── pages/ # Page components
│ │ │ ├── sections/ # Dashboard sections
│ │ │ └── tests/ # Test files
│ │ ├── public/ # Static assets
│ │ └── package.json
│ ├── macrofolio_backend/ # ICP canister backend
│ └── macrofolio_anchor/ # Solidity smart contract
├── test/ # Smart contract tests
├── scripts/ # Deployment scripts
└── README.md # This file
text


## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MetaMask wallet (for Web3 mode)
- Git

### Installation
```bash
# Clone repository
git clone https://github.com/nutraz/macrofolio.git
cd macrofolio

# Install dependencies
cd macrofolio/src/macrofolio_assets
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your keys

# Run development server
npm run dev

Environment Variables
env

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CONTRACT_ADDRESS=your_contract_address
VITE_RPC_URL=https://rpc-amoy.polygon.technology
VITE_CHAIN_ID=80002

📱 Features
Core Features

    ✅ Multi-Asset Tracking: Stocks, Crypto, Gold, Real Estate, NFTs

    ✅ Real-Time Updates: Blockchain-powered price updates

    ✅ Unified Dashboard: Single view across all investments

    ✅ Demo Mode: Test without wallet connection

    ✅ Web3 Mode: Full blockchain integration with MetaMask

Premium Features (RevenueCat)

    🔒 Advanced Analytics: Risk assessment & diversification scoring

    ⚡ Priority Updates: Real-time alerts and notifications

    📊 Export Tools: CSV/PDF portfolio reports

    🎯 Custom Alerts: Price targets for any asset

🔐 Security

    Smart contracts audited and deployed on Polygon Amoy

    Supabase with Row Level Security (RLS)

    Input validation with Zod schemas

    XSS prevention with DOMPurify

    CSP headers for enhanced security

🧪 Testing
bash

# Run all tests
npm test

# Smart contract tests
npm run test:contracts

# Security tests
npm run test:security

# Frontend tests
cd src/macrofolio_assets && npm test

📄 License

MIT License - see LICENSE file for details.
👥 Contributors

    @nutraz - Lead Developer

🙏 Acknowledgments

    Josh @VisualFaktory for the Shipyard Brief

    Polygon Team for Amoy Testnet

    Supabase for backend infrastructure

    RevenueCat for monetization platform

<div align="center"> <sub>Built with ❤️ for the Web3 community</sub> </div> 
