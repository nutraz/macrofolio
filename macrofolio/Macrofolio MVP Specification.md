# Macrofolio — Web3 DApp Specification (ICP)

## Decentralized Onboarding Flow & Architecture

This specification adapts the original MVP concept for the Internet Computer ecosystem, prioritizing user sovereignty, on-chain data verification, and Web3 native monetization.

---

## 1. Exact Onboarding Flow (Web3 Native)

### Screen 0 — Splash / Value Hook (Web3)
**Goal:** Immediate clarity & trust (Decentralized)

- Headline:  
  **"Track every investment. One portfolio. On-chain."**
- Subtext:  
  Self-custodial portfolio tracking for Stocks, Gold, Real Estate, and Crypto. Zero reliance on centralized banks.
- CTA:
  - `Connect Internet Identity`
  - `Explore Demo` (Optional: Simulates read-only canister data)

---

### Screen 1 — Identity & Profile (Web3 Auth)
**Goal:** Frictionless, secure entry

**Auth Mechanism:**
- **Internet Identity (II):** Primary auth method (replaces Email/Password).
- **Device Binding:** Authenticate using TouchID, FaceID, or Ledger.

**Profile Customization:**
- Select **Profile NFT (PFP):** Choose or generate an NFT avatar stored in the user's canister to represent their "Investor Identity."
- **Recovery Setup:** Add recovery devices (confidants) per ICP standards.

---

### Screen 2 — Investor Profile (On-Chain Record)
**Goal:** Personalize analytics & risk scoring

**Question:**
**"What best describes your risk appetite?"**
- Conservative (Capital Preservation)
- Balanced (Growth + Safety)
- Aggressive (Max Growth)

**Action:**
- Store `risk_profile` in the user's canister.
- *Rationale:* On-chain storage ensures this data influences future permissionless features (e.g., DAO voting weight based on profile).

---

### Screen 3 — Asset Classes Selection
**Goal:** Customize dashboard + reduce overwhelm

**Multi-select (Stored in User Canister):**
- Stocks / ETFs (Off-chain Oracle data)
- Gold & Silver
- Fixed Income (Bonds)
- Real Estate
- Crypto Assets (ICP, ETH, BTC)
- NFTs (Digital Collectibles)

**CTA:**
- `Continue`

---

### Screen 4 — First Asset (Mandatory "Aha" Moment)
**Goal:** Immediate portfolio realization

**Prompt:**
**"Add your first holding"**

**Options:**
- Stock / ETF (Search Ticker via Oracle)
- Crypto (Token Address / Ticker)
- Gold / Silver
- Skip (Allowed, but discouraged)

---

### Screen 5 — Asset Entry (Contextual)
**Goal:** Accuracy & On-Chain Verification

#### If Stock / ETF:
- Ticker search (Oracle connection)
- Quantity
- Purchase price (Fiat value)
- Purchase date

**Live Preview:**
- Current price (via HTTPS Outcalls / Oracle)
- Unrealized P&L

#### If Crypto:
- Wallet Address integration (optional: read-only balance check)
- Token Quantity
- Average Buy-in price

#### If Gold / Silver:
- Quantity (grams / ounces)
- Purchase price

**Action:**
- `Mint Asset Record`: Write this holding to the user's portfolio canister.

---

### Screen 6 — Portfolio Summary (The "Aha" Screen)
**Goal:** Instant value realization via Web3

**Display:**
- Total portfolio value (Base currency: USD/ICP)
- Asset allocation chart (Pie Chart)
- Today’s change (24h performance)
- Top performer

**Message:**
> "Your portfolio is now synced to the blockchain. Data is immutable and yours alone."

**CTA:**
- `Set On-Chain Alerts`
- `Go to Dashboard`

---

### Screen 7 — Alerts & Notifications (Web3 Push)
**Goal:** Retention hook using ICP Infrastructure

**Options:**
- Price movement alerts (% triggers)
- Canister state changes (e.g., asset maturity reminders)
- Weekly performance summary (Push notifications via ICP)

**CTA:**
- `Finish Setup`

---

### Screen 8 — Paywall (Soft Web3 Monetization)
**Goal:** Decentralized monetization

**Display:**
- Free vs Premium (DAO Member) comparison

**Premium Unlocks:**
- Unlimited Assets
- Advanced Analytics (Historical charts)
- CSV/PDF Export
- Custom On-chain Alerts

**Payment:**
- `Pay with ICP` (or ckUSDT/ICRC token).
- **NFT Access Pass:** User receives a "Macrofolio Premium" NFT to their wallet, stored in the asset canister for lifetime access verification.

**CTA:**
- `Start Free`
- `Unlock with ICP`

---

## 2. ICP Architecture & Feature Roadmap

---

### Phase 0 — Validation (Week 0–1)
**Objective:** Ship functional Canisters, fast

**Must-have:**
- **Internet Identity** integration.
- **User Canister:** Smart contract for storing asset data (Motoko/Rust).
- **Manual Asset Entry:** UI forms writing to canister state.
- **Oracle Integration:** Basic HTTPS outcalls or trusted oracle for stock/gold prices.

---

### Phase 1 — MVP Launch (Weeks 1–4)
**Objective:** Contest-ready, DApp functional product

### Core Features (P0)
- **Unified Portfolio Dashboard:** React frontend pulling state from ICP canisters.
- **Live Prices:** Real-time updates via HTTPS outcalls or Bridge APIs.
- **P&L Calculations:** Computed logic within the canister or client-side.
- **Asset Allocation Charts:** Visualization of on-chain holdings.
- **NFT Minting:** Profile NFTs and Premium Access NFTs (ICRC-7 standard).
- **ICP Payments:** Simple ledger transfer for Premium unlock.

---

### Phase 2 — Retention & Intelligence (Weeks 5–8)
**Objective:** Make it sticky with Web3 features

### P1 Features
- **Historical Performance Charts:** Storing historical price points in a dedicated "History Canister" for rendering charts.
- **Allocation Drift Alerts:** Canister timers checking balance against target weights.
- **Currency Exposure:** Auto-calculation of Fiat vs. Crypto exposure.
- **Data Export:** Generate CSV from canister data (client-side generation).
- **Monthly Performance Reports:** Signed data snapshots for proof-of-holdings.

---

### Phase 3 — Creator Differentiation (Weeks 9–12)
**Objective:** Unique edge vs generic trackers (The "VisualPolitik" Mode)

### P2 Features
- **Macro Dashboard:**
  - On-chain Inflation rates (Oracle data).
  - Interest Rate comparisons.
  - Portfolio exposure vs. Macro Indicators.
- **Thematic Tagging:** Tagging assets as "Energy," "DeFi," etc., stored in canister metadata.
- **Portfolio Health Score:** An algorithmic score generated based on diversification and risk profile.

---

### Phase 4 — Automation & Scale (Post-MVP)
**Objective:** Move from tracker → protocol

### P3 Features
- **Read-Only Integrations:** (Optional) Use secure HTTPS outcalls to query bank/broker APIs (user inputs API keys encrypted in their canister).
- **AI Insights:** Fetch AI analysis from verified APIs and store summaries on-chain.
- **Multi-Portfolio Support:** Separate canister buckets for "Personal," "Family," or "Crypto-Only."
- **DAO Voting:** Premium NFT holders can vote on new feature integrations via SNS (Service Nervous System).

---

### Phase 5 — Advanced Monetization (Long-term)
**Objective:** Revenue expansion via Tokenomics

- **Tiered Premium Plans:** 1 month (ICP), 1 Year (NFT).
- **Creator-Exclusive Insights:** Paywalled content channels accessible only via specific NFT holdings.
- **Institutional Dashboards:** High-throughput canister clusters for professional analysis.
- **API Access:** Allow 3rd party DApps to read public portfolio data (with user permission).

---

## Key Web3 Constraints (Intentional)
- ❌ **No Trading:** Macrofolio tracks data; it is not an exchange.
- ❌ **No Custody:** Users do not deposit funds into Macrofolio; they track external assets or self-custodied wallets.
- ❌ **No KYC:** Privacy-first design using Internet Identity (no SSNs/Passports required).

These constraints **ensure regulatory compliance and speed up dapp deployment.**

---

## Success Metrics (Judges + Creator)
- Time to First Asset < 3 mins (Auth via II is fast).
- Weekly Active Wallets.
- Conversion to Premium (ICP Payments/NFT Minting).
- Avg Assets per User Canister.
- Retention after 7 days.

---

### Status: **Web3 Contest-Ready Blueprint**
Next logical steps:
- **Canister Modeling:** Define Motoko types (`Asset`, `Portfolio`, `User`).
- **DFX Setup:** Initialize local `dfx` environment.
- **IC Identity UI:** Design the "Connect Wallet" animations.
- **Demo Data Set:** Mock data for judges without wallets.

```
