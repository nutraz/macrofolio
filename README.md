<div align="center">
  <img src="macrofolio/src/public/ChatGPT Image Jan 18, 2026, 05_03_10 PM.png" alt="Macrofolio" width="400">
</div>

# Macrofolio

**Track every investment. One portfolio. On-chain.**

Macrofolio is a self-custodial portfolio tracking DApp that enables users to track stocks, ETFs, crypto, gold, real estate, NFTs, and fixed income assets in a unified dashboard. Built with Web3 principles, it ensures users maintain complete control over their financial data with zero reliance on centralized banks.

![Macrofolio Dashboard]([[https://via.placeholder.com/1200x600/1a1a2e/e94560?text=Macrofolio+Dashboard](https://6979bb3469101700083fef75--macrofolio.netlify.app/)](https://6979bb3469101700083fef75--macrofolio.netlify.app/))

## ✨ Features

### Core Functionality
- **Unified Portfolio Dashboard** - View all your assets across multiple classes in one place
- **Multi-Asset Support** - Track Stocks/ETFs, Crypto, Gold & Silver, Real Estate, Fixed Income, and NFTs
- **Real-Time Updates** - Live price tracking with sub-second latency
- **Portfolio Analytics** - Performance charts, allocation breakdowns, and P&L calculations

### Web3 Features
- **Self-Custodial** - Your data stays secure. No centralized servers or custodial control
- **MetaMask Integration** - Connect your Web3 wallet for full functionality
- **Blockchain Anchoring** - Immutable portfolio proofs on Polygon Amoy and Base Sepolia
- **Privacy-First** - Zero KYC requirements on testnet

### Demo Mode
- Explore the full dashboard experience without connecting a wallet
- Local data storage for testing and onboarding
- Seamless transition to Web3 mode when ready

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   React +   │  │  Tailwind   │  │  TypeScript │             │
│  │   Vite      │  │    CSS      │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                        Service Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Supabase   │  │  Ethers.js  │  │  React Hooks │            │
│  │   Auth      │  │   (Web3)    │  │  (useWallet)│            │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│                        Data Layer                                │
│  ┌───────────────────┐        ┌───────────────────┐            │
│  │   Supabase DB     │        │  Blockchain       │            │
│  │   (PostgreSQL)    │        │  (Polygon/Base)   │            │
│  │                   │        │                   │            │
│  │  • User Profiles  │        │  • Asset Anchors  │            │
│  │  • Asset Records  │        │  • Proof of       │            │
│  │  • Transactions   │        │    Holdings       │            │
│  └───────────────────┘        └───────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Authentication | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| Web3 | Ethers.js v6, MetaMask |
| Blockchains | Polygon Amoy, Base Sepolia |
| Smart Contracts | Solidity (PortfolioAnchor) |
| Deployment | Netlify |
| Payments | RevenueCat (subscription management) |

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0
- MetaMask browser extension (for Web3 features)
- Supabase account (for backend services)

### Installation

```bash
# Navigate to project directory
cd macrofolio/

# Install dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

### Environment Setup

Create a `.env` file in the `src/macrofolio_assets` directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Web3 Configuration
VITE_CONTRACT_ADDRESS=your_portfolio_anchor_contract_address

# Network (optional - defaults to Polygon Amoy)
VITE_NETWORK_NAME=polygonAmoy
```

### Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

The development server will start at `http://localhost:8080` with API requests proxied to the local blockchain replica.

## 📱 Application Pages

| Page | Route | Description |
|------|-------|-------------|
| Splash | `/` | Landing page with value proposition and mode selection |
| Dashboard | `/dashboard` | Portfolio overview with summary, charts, and asset list |
| Portfolio | `/portfolio` | Detailed asset management and transactions |
| Analytics | `/analytics` | Advanced performance metrics and historical data |
| Alerts | `/alerts` | Price movement and portfolio notifications |
| Premium | `/premium` | Subscription management via RevenueCat |
| Verify | `/verify` | On-chain verification of portfolio proofs |

## 🔐 Authentication

### Demo Mode (No Wallet Required)
- Email-based authentication via Supabase
- Local data storage for demo purposes
- Full dashboard access with simulated data

### Web3 Mode
- MetaMask wallet connection
- Automatic network detection and switching
- Blockchain-native identity management

## ⛓️ Supported Networks

| Network | Chain ID | Type |
|---------|----------|------|
| Polygon Amoy | 80002 | Testnet |
| Base Sepolia | 84532 | Testnet |

## 📦 Smart Contract

The `PortfolioAnchor.sol` contract enables immutable portfolio anchoring:

```solidity
// Core functions
function anchor(string actionType, bytes32 dataHash) returns (bytes32);
function batchAnchor(string[] actionTypes, bytes32[] dataHashes);

// Events
event PortfolioAnchored(
    address indexed user, 
    string actionType, 
    bytes32 dataHash, 
    uint256 timestamp
);
```

## 🎨 Design System

### Theme
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#eab308)
- **Danger**: Red (#ef4444)
- **Background**: Dark gradient (slate-900 to slate-800)

### Components
- Glassmorphism cards with backdrop blur
- Interactive hover states with glow effects
- Responsive grid layouts
- Animated transitions and loading states

## 📊 Asset Types

Macrofolio supports tracking for:

- 📈 **Stocks / ETFs** - Equity positions and index funds
- 🪙 **Crypto Assets** - Digital currencies and tokens
- 🥇 **Gold & Silver** - Precious metals
- 🏠 **Real Estate** - Property holdings
- 📋 **Fixed Income** - Bonds and debentures
- 🖼️ **NFTs** - Digital collectibles

## 🔒 Security Features

- **Self-Custodial**: Users retain full control of their assets
- **No KYC**: Privacy-first design with no identity requirements
- **End-to-End Encryption**: Secure data transmission
- **Wallet Connection**: Non-custodial wallet integration

## 📈 Roadmap

### Phase 1 - MVP
- [x] Unified portfolio dashboard
- [x] Demo mode with local data
- [x] MetaMask integration
- [x] Multi-chain support

### Phase 2 - Enhancement
- [ ] Historical performance charts
- [ ] Advanced analytics
- [ ] CSV/PDF export
- [ ] Custom alerts
- [ ] RevenueCat subscription integration

### Phase 3 - Expansion
- [ ] AI-powered insights
- [ ] Multi-portfolio support
- [ ] DAO governance integration
- [ ] Institutional features

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - See LICENSE file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Ethers.js](https://docs.ethers.org/) - Ethereum library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next-generation frontend tooling
- [RevenueCat](https://www.revenuecat.com/) - Subscription management

---

**Macrofolio** - Track every investment. One portfolio. On-chain.

