# MACROFOLIO – One Portfolio to Track Them All

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://macrofolio.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/nutrazz/macrofolio)
[![Video Demo](https://img.shields.io/badge/Video-Demo-red)](https://youtu.be/5Fve86iO7BI)
[![Built with RevenueCat](https://img.shields.io/badge/Built%20with-RevenueCat-FF6B6B)](https://www.revenuecat.com)

## 🏆 RevenueCat Shipyard Contest Submission

**Live App:** https://macrofolio.vercel.app  
**Demo Video:** https://youtu.be/5Fve86iO7BI  
**GitHub:** https://github.com/nutrazz/macrofolio  
**Twitter:** https://x.com/nutraazz

## 📊 Executive Summary

Macrofolio solves the fragmentation problem for modern DIY investors by providing a single, self-custodial dashboard to track all asset classes across multiple platforms.

### Key Features
- 📈 **Multi-Asset Tracking**: Stocks, ETFs, crypto, gold, real estate, fixed income, NFTs
- 🔒 **Self-Custodial**: Zero centralized storage of sensitive financial data
- ⛓️ **On-Chain Verification**: Portfolio proofs anchored on Polygon & Base
- 💰 **RevenueCat Integration**: Premium analytics via subscription
- 🎯 **Real-Time Updates**: Live price tracking and alerts
- 📱 **Mobile-First**: Responsive PWA, ready for TestFlight/Play Store

## 🚀 Quick Start

### Demo Mode (No Setup Required)
1. Visit https://macrofolio.vercel.app
2. Click "Try Demo Mode"
3. Explore all features immediately

### Full Experience
1. Connect MetaMask wallet
2. Add your assets (stocks, crypto, real estate, etc.)
3. View unified dashboard with performance metrics
4. Set alerts for non-listed assets
5. Anchor portfolio on-chain for verification

## 🏗️ Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **RevenueCat SDK** for subscriptions
- **Ethers.js v6** for Web3 interactions

### Backend
- **Supabase** (PostgreSQL) for authentication & asset records
- **Row-Level Security** for data privacy
- **Real-time subscriptions** for price updates

### Blockchain
- **Polygon Amoy & Base Sepolia** testnets
- **PortfolioAnchor.sol** smart contract
- **EIP-712 signatures** for secure anchoring
- **MetaMask/WalletConnect** integration

### Security
- ✅ 45 comprehensive test cases
- ✅ Zod validation schemas
- ✅ DOMPurify XSS protection
- ✅ Content Security Policy
- ✅ Input sanitization
- ✅ Session timeout management

## 💰 RevenueCat Integration

### Subscription Tiers
1. **Free**: Basic portfolio tracking, 5 assets limit
2. **Premium Monthly ($9.99)**: Unlimited assets, advanced analytics
3. **Premium Yearly ($99.99)**: Best value (2 months free)
4. **Lifetime ($299.99)**: One-time payment, lifetime updates

### Implementation
- **RevenueCat SDK** integration (`@revenuecat/purchases-js`)
- **Demo mode** for testing without API keys
- **Production mode** with real subscription processing
- **Entitlement checking** for premium features
- **Purchase/restore flows** fully implemented

## 📁 Project Structure

```
src/
├── components/     # React components
│   ├── Header.tsx
│   ├── RevenueCatProvider.tsx
│   └── Toast.tsx
├── hooks/         # Custom hooks
│   ├── useRevenueCat.ts
│   ├── useWallet.ts
│   └── useAuth.ts
├── lib/           # Core utilities
│   ├── revenuecat.ts   # RevenueCat SDK integration
│   ├── web3.ts         # Blockchain interactions
│   ├── supabase.ts     # Database client
│   └── validation.ts   # Zod schemas
├── pages/         # Application pages
│   ├── Dashboard.tsx
│   ├── Portfolio.tsx
│   ├── Premium.tsx     # RevenueCat subscription
│   └── Verify.tsx      # On-chain verification
└── __tests__/     # 45 test cases
    ├── security.test.ts
    ├── wallet.test.ts
    └── verification.test.ts
```

## 🔧 Development

```bash
# Install dependencies (includes RevenueCat SDK)
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Demo Video

[![Macrofolio Demo](https://img.youtube.com/vi/5Fve86iO7BI/0.jpg)](https://youtu.be/5Fve86iO7BI)

**Watch the full demo:** https://youtu.be/5Fve86iO7BI

**Video Highlights:**
-Highlights

    [00:05] 📊 Macfolio consolidates all asset types—stocks, crypto, real estate, and NFTs—into a single portfolio dashboard.
    [00:45] 🏠 Supports logging of non-public market assets like properties and private investments with customizable reminders.
    [01:10] 💡 Premium subscription unlocks advanced analytics including risk scoring and sector exposure for better portfolio insights.
    [01:25] 📈 Real-time updates provide instant clarity on total portfolio value and performance trends.
    [01:50] 🔒 Built on Web3 self-custodial principles, ensuring users retain full control over data with blockchain verification.
    [02:00] 🚀 Demo mode allows instant app exploration without wallet connection, easing onboarding.
    [02:15] 🔄 Premium analytics help identify concentration risks and gaps in diversification for smarter investing.

## 🏆 Contest Requirements Met

### ✅ Mandatory Requirements
1. **Working MVP** - Live at macrofolio.vercel.app
2. **RevenueCat Integration** - Complete subscription system with SDK
3. **Demo Video** - Recorded and uploaded to YouTube
4. **Written Proposal** - Comprehensive documentation

### ✅ Bonus Points
1. **Multi-Platform** - Responsive web + PWA ready
2. **Innovation** - Hybrid web2/web3 architecture
3. **Security** - 45 test cases, XSS protection
4. **User Experience** - Demo-first onboarding

### 📱 Mobile Ready
- Progressive Web App (PWA) installed
- Ready for TestFlight/Play Store submission via Capacitor

## 🎯 Unique Value Proposition

### For Users
- **One Dashboard**: Track everything in one place
- **Full Control**: Self-custodial, no data selling
- **Actionable Insights**: Premium analytics for better decisions
- **Future-Proof**: On-chain verification for audit trails

### For RevenueCat
- **Proven Integration**: Production-ready SDK integration
- **Growth Potential**: Addressable market of 100M+ DIY investors
- **Technical Excellence**: 15,000+ lines of TypeScript code
- **Security-First**: Comprehensive testing and validation

## 📈 Business Model

### Free Tier
- Basic portfolio tracking
- 5 asset limit
- Community support

### Premium Tiers ($9.99-$299.99)
- Unlimited assets
- Advanced analytics
- Priority alerts
- Premium support
- On-chain verification

### Target Market
- **100M+** DIY investors globally
- **$50M+** potential ARR at 1% penetration
- **30%+** margins with digital delivery

## 🔮 Roadmap

### Q2 2026
- [ ] iOS/Android app store deployment
- [ ] AI-powered portfolio recommendations
- [ ] Tax optimization features

### Q3 2026
- [ ] Multi-portfolio support (family/business)
- [ ] API for financial advisors
- [ ] Social features (anonymous sharing)

### Q4 2026
- [ ] Institutional tools
- [ ] DAO governance for feature voting
- [ ] White-label solutions

## 👥 Team

**Josh @VisualFaktory** - Full-stack developer with 8+ years in fintech and Web3.

## 📞 Contact & Links

- **Live App**: https://macrofolio.vercel.app
- **GitHub**: https://github.com/nutrazz/macrofolio
- **Demo Video**: https://youtu.be/5Fve86iO7BI
- **Email**: urgamparadise@gmail.com
- **Twitter**: https://x.com/nutraazz

## 📄 License

MIT License - see LICENSE file for details.

---

*Built with ❤️ for the RevenueCat Shipyard Contest 2026*
