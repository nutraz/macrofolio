# Technical Architecture Deep Dive

## Overview

Macrofolio is built on a modern, modular architecture that combines traditional web2 technologies with optional web3 capabilities. This document provides a comprehensive technical overview of the system's components, data flows, and architectural decisions.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (PWA)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React + TypeScript + Vite + Tailwind + ShadCN/UI  │   │
│  └─────────────────────────────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Service Layer (Custom Hooks & API Clients)         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │   │
│  │  │ useAuth  │ │useAssets │ │ useWallet        │    │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Supabase     │  │  RevenueCat   │  │  Polygon      │
│  Backend      │  │  Monetization │  │  Blockchain   │
│  (Web2)       │  │  (SaaS)       │  │  (Optional)   │
└───────────────┘  └───────────────┘  └───────────────┘
```

## 📦 Component Details

### Frontend Layer

#### Core Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Component Library | 18+ |
| TypeScript | Type Safety | 5.x |
| Vite | Build Tool & Dev Server | 5.x |
| Tailwind CSS | Utility-First Styling | 3.x |
| ShadCN/UI | Component Library | Latest |
| React Query | Data Fetching & Caching | 5.x |

#### Project Structure

```
macrofolio/src/macrofolio_assets/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── DashboardLogo.tsx
│   │   ├── Toast.tsx
│   │   └── TestContract.jsx
│   ├── pages/               # Route-level components
│   │   ├── Dashboard.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Analytics.tsx
│   │   ├── Premium.tsx
│   │   ├── Verify.tsx
│   │   ├── Alerts.tsx
│   │   └── Splash.tsx
│   ├── sections/            # Dashboard sections
│   │   ├── AssetsTable.tsx
│   │   ├── PerformanceChart.tsx
│   │   ├── Allocation.tsx
│   │   └── PortfolioSummary.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication logic
│   │   ├── useAssets.ts     # Asset management
│   │   ├── useWallet.ts     # Web3 wallet connection
│   │   ├── useRevenueCat.ts # Subscription management
│   │   └── index.ts
│   ├── lib/                 # Utilities & configurations
│   │   ├── supabase.ts      # Supabase client
│   │   ├── web3.ts          # Web3 utilities
│   │   ├── contracts/       # Contract ABIs & addresses
│   │   ├── types.ts         # TypeScript definitions
│   │   └── validation.ts    # Zod schemas
│   ├── __tests__/           # Test files
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

### Backend Layer (Supabase)

#### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'stock', 'crypto', 'gold', 'real_estate', 'nft'
  quantity DECIMAL(20, 8) NOT NULL,
  purchase_price DECIMAL(20, 8),
  purchase_date DATE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id),
  type TEXT NOT NULL, -- 'buy', 'sell', 'transfer'
  quantity DECIMAL(20, 8) NOT NULL,
  price DECIMAL(20, 8) NOT NULL,
  fees DECIMAL(20, 8) DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio anchors (blockchain verification)
CREATE TABLE anchors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  tx_hash TEXT NOT NULL,
  block_number INTEGER,
  merkle_root TEXT,
  verified_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Row-Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE anchors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own assets"
  ON assets FOR ALL
  USING (auth.uid() = user_id);
```

### Blockchain Layer (Optional)

#### Smart Contract Architecture

```
contracts/
├── Macrofolio.sol          # Main portfolio contract
├── PortfolioAnchor.sol     # Verification anchor
└── interfaces/
    ├── IMacrofolio.sol
    └── IPortfolioAnchor.sol
```

#### Core Contract Features

```solidity
// PortfolioAnchor.sol
contract PortfolioAnchor {
    struct PortfolioSnapshot {
        uint256 timestamp;
        bytes32 merkleRoot;
        uint256 totalValueUSD;
        AssetData[] assets;
    }
    
    mapping(address => PortfolioSnapshot[]) public snapshots;
    
    function anchorPortfolio(
        bytes32 _merkleRoot,
        uint256 _totalValueUSD,
        AssetData[] calldata _assets
    ) external {
        // Create verifiable snapshot
    }
    
    function verifyPortfolio(
        address _user,
        uint256 _snapshotIndex,
        bytes32[] calldata _proof
    ) external view returns (bool) {
        // Verify on-chain proof
    }
}
```

#### Network Configuration

| Network | Chain ID | RPC URL | Contract Address |
|---------|----------|---------|------------------|
| Polygon Amoy (Testnet) | 80002 | https://rpc-amoy.polygon.technology | [Polygonscan](https://amoy.polygonscan.com/) |
| Polygon Mainnet (Future) | 137 | https://polygon-rpc.com | TBD |

### Monetization Layer (RevenueCat)

#### Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| Free | $0/mo | Basic tracking, 10 assets |
| Pro | $9.99/mo | Unlimited assets, analytics |
| Enterprise | $29.99/mo | API access, custom integrations |

#### Entitlement Management

```typescript
// useRevenueCat hook
const { isPro, isEnterprise } = useRevenueCat();

if (isPro) {
  // Grant premium features
}
```

## 🔄 Data Flows

### Portfolio Update Flow

```
User Updates Asset
        │
        ▼
┌───────────────────┐
│  React Component  │
└─────────┬─────────┘
          │ API Call
          ▼
┌───────────────────┐
│  Supabase Client  │
└─────────┬─────────┘
          │ RLS Check
          ▼
┌───────────────────┐
│  PostgreSQL DB    │
└───────────────────┘
          │
          ▼ (Optional)
┌───────────────────┐
│  Smart Contract   │ (Verification)
└───────────────────┘
```

### Price Update Flow

```
External Price Feed (Chainlink, CoinGecko)
        │
        ▼
┌───────────────────┐
│  Webhook/API      │
└─────────┬─────────┘
          │ Batch Update
          ▼
┌───────────────────┐
│  Supabase Edge    │
│  Functions        │
└─────────┬─────────┘
          │ Real-time
          ▼
┌───────────────────┐
│  Frontend (React  │
│  Query Cache)     │
└───────────────────┘
          │
          ▼
┌───────────────────┐
│  User Interface   │ (Updated Prices)
└───────────────────┘
```

## 🔐 Security Architecture

### Implemented Security Measures

1. **Authentication**
   - Supabase Auth with email/password
   - Wallet-based authentication (Web3)
   - Session management with JWT tokens

2. **Database Security**
   - Row-Level Security (RLS) on all tables
   - Input validation with Zod schemas
   - Prepared statements to prevent SQL injection

3. **Frontend Security**
   - Content Security Policy (CSP) headers
   - XSS prevention with DOMPurify
   - CORS configuration

4. **Smart Contract Security**
   - Reentrancy guards
   - Input validation
   - Event logging for auditing

### Future Security Enhancements

- Zero-knowledge proofs for private verification
- Post-quantum cryptography migration
- Hardware Security Module (HSM) integration

## 📊 Performance Optimization

### Frontend Optimizations

- Code splitting with React.lazy()
- Image optimization and lazy loading
- Memoization with useMemo and useCallback
- Virtual scrolling for large asset lists

### Backend Optimizations

- Database indexing on frequently queried columns
- Connection pooling with PgBouncer
- Edge Functions for serverless operations

### Caching Strategy

```
┌─────────────────────────────────────────────────┐
│  Cache Layers                                   │
├─────────────────────────────────────────────────┤
│  L1: React Query (Client-side)                  │
│  L2: Supabase Realtime (Subscriptions)          │
│  L3: CDN (Static Assets)                        │
└─────────────────────────────────────────────────┘
```

## 🚀 Deployment Architecture

### Vercel (Frontend)

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

### Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Blockchain
VITE_CONTRACT_ADDRESS=your_contract_address
VITE_RPC_URL=https://rpc-amoy.polygon.technology
VITE_CHAIN_ID=80002

# RevenueCat
VITE_REVENUECAT_API_KEY=your_revenuecat_key
```

## 📈 Scalability Considerations

### Horizontal Scaling

- Stateless frontend deployment
- Database read replicas for heavy queries
- CDN for static asset delivery

### Vertical Scaling

- Database connection pooling
- Optimized query patterns
- Efficient indexing strategy

## 🧪 Testing Strategy

### Test Coverage Goals

| Type | Coverage Target | Tools |
|------|----------------|-------|
| Unit Tests | 80% | Jest |
| Integration Tests | 70% | React Testing Library |
| E2E Tests | 50% | Cypress |
| Smart Contract Tests | 95% | Hardhat + Mocha |

### Test Structure

```
__tests__/
├── unit/
│   ├── hooks/
│   │   ├── useAuth.test.ts
│   │   └── useAssets.test.ts
│   └── lib/
│       └── validation.test.ts
├── integration/
│   ├── components/
│   └── pages/
├── e2e/
│   └── portfolio.cy.ts
└── security/
    └── security.test.ts
```

## 🔧 Maintenance & Monitoring

### Logging

- Frontend: Sentry for error tracking
- Backend: Supabase logs
- Blockchain: Tenderly for contract monitoring

### Analytics

- Vercel Analytics
- Supabase pg_stat_statements
- Custom performance metrics

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Next Review**: Q2 2025

