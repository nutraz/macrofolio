# Macrofolio Migration - Implementation TODO

## Phase 1: Project Restructuring & Cleanup
- [x] 1.1 Update package.json (remove ICP deps, add Supabase + ethers)
- [ ] 1.2 Archive ICP canister code (optional)
- [x] 1.3 Create lib directory structure

## Phase 2: Supabase Integration  
- [x] 2.1 Create .env.example with Supabase + Web3 vars
- [x] 2.2 Create supabase.ts client
- [x] 2.3 Create types.ts with DB interfaces
- [x] 2.4 Create useAuth hook
- [x] 2.5 Create useAssets hook
- [ ] 2.6 Create useTransactions hook (optional)

## Phase 3: Web3 Integration
- [x] 3.1 Create web3.ts service
- [x] 3.2 Create useWallet hook
- [x] 3.3 Create PortfolioAnchor.sol contract
- [x] 3.4 Add network config

## Phase 4: UI Updates
- [x] 4.1 Update App.tsx with new auth/web3 state
- [x] 4.2 Update Header.tsx with wallet status
- [x] 4.3 Add Demo Mode toggle
- [x] 4.4 Update Splash.tsx connection flow
- [x] 4.5 Update Portfolio.tsx
- [x] 4.6 Update Dashboard.tsx
- [x] 4.7 Update AssetsTable.tsx
- [x] 4.8 Update PortfolioSummary.tsx

## Phase 5: Deployment
- [x] 5.1 Create netlify.toml
- [ ] 5.2 Update .gitignore

## Phase 6: Documentation
- [ ] 6.1 Update README.md
- [x] 6.2 Create MIGRATION_PLAN.md
- [x] 6.3 Create SUPABASE_SETUP.md (instructions below)
- [x] 6.4 Create CONTRACT_DEPLOYMENT.md (instructions below)

---

## ✅ Path A: Trust Signal - COMPLETE

### Public "Verify Proof" Page
- [x] Create `src/pages/Verify.tsx`
- [x] Add Verify route to App.tsx
- [x] Add Verify to Header navigation
- [x] Implement RPC call to fetch event
- [x] Display decoded event data
- [x] Add Polygonscan explorer link
- [x] Handle error states

---

## 📋 Completed Files

### Core Infrastructure
- `src/lib/supabase.ts` - Supabase client with auth & DB helpers
- `src/lib/types.ts` - TypeScript interfaces for all data types
- `src/lib/web3.ts` - Web3 service for MetaMask & contract interaction
- `src/hooks/useAuth.ts` - Authentication hook
- `src/hooks/useWallet.ts` - Wallet connection hook
- `src/hooks/useAssets.ts` - Assets management hook

### UI Components Updated
- `src/App.tsx` - Main app with demo/live mode toggle
- `src/components/Header.tsx` - Wallet status, demo toggle, Verify nav
- `src/pages/Splash.tsx` - Mode selection, MetaMask install prompt
- `src/pages/Dashboard.tsx` - Demo banner, live status
- `src/pages/Portfolio.tsx` - Demo/live mode cards
- `src/pages/Verify.tsx` - **NEW** Public proof verification page
- `src/sections/PortfolioSummary.tsx` - Demo badge
- `src/sections/AssetsTable.tsx` - Verify column for live mode

### Configuration
- `package.json` - Updated dependencies
- `.env.example` - Environment variables template
- `netlify.toml` - Netlify deployment config
- `contracts/PortfolioAnchor.sol` - Smart contract with ABI freeze

### Documentation
- `MIGRATION_PLAN.md` - Complete migration plan
- `SUPABASE_SETUP.md` - Step-by-step Supabase setup
- `CONTRACT_DEPLOYMENT.md` - Smart contract deployment guide

---

## 🚀 Release Status

### v0.1.0 - Testnet Alive ✅

| Feature | Status |
|---------|--------|
| Demo Mode | ✅ Working |
| Web3 Mode | ✅ Working |
| MetaMask Connection | ✅ Working |
| Polygon Amoy Anchoring | ✅ Working |
| Public Verify Page | ✅ Working |
| Zero Cost | ✅ Supabase Free Tier + Netlify |
| ABI Frozen | ✅ v0 anchor schema locked |

### Git Tag
```bash
git tag v0.1.0-testnet-alive
git push origin v0.1.0-testnet-alive
```

---

## 📖 Usage

### Demo Mode (No Wallet)
1. Open app
2. Stay in Demo Mode
3. Explore all features with sample data

### Web3 Mode (With Wallet)
1. Install MetaMask
2. Toggle to Web3 Mode
3. Connect wallet
4. Anchor portfolio actions to Polygon Amoy

### Verify Proof (Public)
1. Click "Verify" in navigation
2. Paste transaction hash
3. See on-chain proof details

