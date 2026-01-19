````instructions
# Macrofolio AI Coding Agent Instructions

## Project Overview

**Macrofolio** is a Web3 decentralized portfolio tracking DApp on the **Internet Computer (ICP)** blockchain. Users manage multi-asset portfolios (stocks, crypto, gold, real estate, NFTs) with on-chain data storage via **Internet Identity** authentication.

**Tech Stack:**
- **Backend:** Motoko (ICP canisters) via dfx toolchain
- **Frontend:** React 18 + TypeScript + Vite
- **Authentication:** Internet Identity (II) + device binding
- **Monorepo:** npm workspaces with root `dfx.json` + frontend in `src/macrofolio_assets`

---

## Architecture Patterns

### Multi-Canister System (`dfx.json`)

**Three primary canisters:**

1. **`macrofolio_backend`** — Registry canister; manages user-to-canister mappings
   - Stores `userCanisters: [(Principal, Principal)]` — maps user Principal → user's dedicated canister ID
   - Exposes `getOrCreateUserCanister(): Principal` — creates/retrieves per-user canister
   - Centralizes asset type definitions (stock, crypto, gold, real estate, NFT)

2. **`macrofolio_user`** — Per-user canister (instantiated per caller)
   - Stores individual portfolio: `assets: [Asset]`, `riskProfile: ?RiskProfile`
   - **Not a shared global resource** — each user gets isolated Motoko actor
   - Data types mirror onboarding screens: `RiskProfile` (Conservative/Balanced/Aggressive), `AssetType` enum

3. **`macrofolio_assets`** — Vite-built React frontend, deployed as ICP asset canister
   - Configured in `dfx.json` with `dependencies: ["macrofolio_backend"]`
   - Built output published to `/dist` on-chain via dfx

**Key Pattern:** User data isolation via dedicated per-user canisters, not sharded database tables.

### Data Sovereignty & Registry Pattern

**Critical Implication:** You cannot query all users from a single canister. Unlike centralized SQL (`SELECT * FROM users`), ICP requires explicit registry mapping:
- `macrofolio_backend` maintains `userCanisters: [(Principal, Principal)]` — the lookup table
- Each call to `getOrCreateUserCanister()` reads/writes this registry
- **Architectural consequence:** Scaling requires pagination or index canisters for large user bases
- **Agent task:** When querying user data, always route through registry first before accessing user canister

### Data Type Alignment Across Screens

The `macrofolio_user` canister mirrors **Screen 2–5** of the onboarding flow:

```motoko
type RiskProfile = { #Conservative; #Balanced; #Aggressive }
type AssetType = { #StockETF; #GoldSilver; #FixedIncome; #RealEstate; #Crypto; #NFT }
type Asset = { id: Nat; assetType: AssetType; name: Text; quantity: Float; purchasePrice: Float; purchaseDate: Nat }
```

**Convention:** Types in `macrofolio_user` directly reflect UI requirements from spec.

### The Hub Pattern: macrofolio_backend as Controller

**Advanced consideration:** `macrofolio_backend` should eventually be set as Controller of `macrofolio_user` instances to enable remote upgrades. This is not yet implemented but matters for:
- Rolling out new `Asset` fields without user canister downtime
- Data migrations at scale
- Currently, each user canister is independently deployed—no central control

---

## Development Workflows

### Local Testing & Debugging

```bash
# Terminal 1: Start local ICP replica (binds to 127.0.0.1:4943)
dfx start --clean

# Terminal 2: Deploy all canisters
dfx deploy

# Terminal 3: Start dev server (port 5173 with proxy to replica)
cd src/macrofolio_assets && npm run dev

# Access UI at http://localhost:5173
```

**Environment Variables** (via Vite `define` in `vite.config.ts`):
- `DFX_NETWORK` — defaults to `'local'`; loaded from `.env`
- `CANISTER_ID_INTERNET_IDENTITY` — II canister ID from dfx output
- `CANISTER_ID_MACROFOLIO_BACKEND` — backend canister ID from dfx output

### Environment Variables: Vite vs. Node Trap

**Critical Pattern:** `process.env` works in Node CLI but **fails in browser**. Vite's solution:

```typescript
// vite.config.ts — define block makes vars available at build time
define: {
  'process.env.CANISTER_ID_MACROFOLIO_BACKEND': JSON.stringify(
    process.env.CANISTER_ID_MACROFOLIO_BACKEND || 'fallback-id'
  ),
}
```

**Why:** Vite replaces the string `process.env.CANISTER_ID_MACROFOLIO_BACKEND` with the actual value during build. Without this, the browser sees the literal string and breaks.

**Gotcha:** If you add a new env var, you must add it to `define` **and** redeploy. Simply updating `.env` is not enough.

**Alternative:** Use `import.meta.env` (Vite-native) instead of `process.env`, but this project standardizes on `process.env` for Node CLI consistency.

### Build Process

```bash
# Root workspace build (runs prebuild → tsc → vite build)
npm run build

# Deploys React app to macrofolio_assets canister
dfx deploy macrofolio_assets
```

**Vite config note:** `outDir: 'dist'` is hardcoded in `src/macrofolio_assets/vite.config.ts`; dfx reads from this directory.

**`dfx generate` behavior:** `dfx deploy` automatically runs `dfx generate` to create TypeScript declarations in `src/declarations/`. If you edit Motoko code without deploying, manually run:
```bash
dfx build macrofolio_backend  # Regenerates src/declarations/macrofolio_backend/
```
This is the glue between Motoko types and React imports.

---

## Critical Integration Points

### Internet Identity (II) Authentication

- **Not yet implemented in React app** — `src/App.tsx` is a placeholder
- Frontend must import `@dfinity/auth-client` and `@dfinity/principal` (deps in `src/macrofolio_assets/package.json`)
- Flow: II login → get caller `Principal` → call `macrofolio_backend.getOrCreateUserCanister()` → retrieve/create user canister
- Motoko canisters use `caller` as implicit variable for Principal verification

**Convention:** User Principal as lookup key; per-user Motoko actors for isolation.

### HTTP Outcalls & Oracles

Spec mentions oracle data for stock tickers and live pricing. **Not yet implemented in canisters.**

**Pattern: HttpAgent in Motoko**

```motoko
import Http "mo:base/Http";

public func fetchStockPrice(ticker: Text) : async ?Text {
  let url = "https://api.example.com/price?ticker=" # ticker;
  // Requires: (1) Cycles payment, (2) URL whitelisting, (3) Response parsing
  // Returns raw response body as Blob
}
```

**Gotchas & Recommendations:**
1. **Cycles Cost:** HTTPS outcalls deduct cycles (ICP's "gas"). Each request costs ~0.4 ICP. Budget carefully.
2. **CORS:** ICP bypasses browser CORS, but the target API must accept the ICP replica IP.
3. **MVP Strategy:** Start with **mock/hardcoded prices** or a simple text-based API (no JSON parsing) to avoid cycles waste during development.
4. **Caching:** Implement in `macrofolio_backend` (not per-user canister) with TTL to minimize requests.
5. **Parsing:** Motoko has limited JSON libraries; consider pre-formatted text responses for MVP.

**Recommended Approach for Now:**
- Create a `fetchPriceMock(ticker: Text) : async Float` function that returns hardcoded prices
- Replace with real outcalls only after UI integration is complete

### Asset Metadata Structure

Current `Asset` type is minimal (id, type, name, quantity, purchasePrice, purchaseDate).

**Expansion pattern:** Add optional fields per `AssetType`:
```motoko
type Asset = {
  // ... existing fields ...
  ticker: ?Text;           // For #StockETF
  walletAddress: ?Text;    // For #Crypto
  interestRate: ?Float;    // For #FixedIncome
}
```

---

## Project Conventions & Patterns

### Motoko Style

- **Stable storage:** Use `private stable var` for data persisting across upgrades; implement `preupgrade`/`postupgrade` hooks for complex types
- **Error handling:** Return `?Type` (optional) or custom `Result` type; avoid panics
- **Module imports:** Explicit `import X "mo:base/X"` per stdlib items (see `macrofolio_backend/main.mo`)
- **Node Compatibility:** Auto-generated TypeScript declarations use `node_compatibility: true` in `dfx.json` — required for Node CLI tools to import canister types

### Frontend Structure

- **Vite + React:** Entry point `src/macrofolio_assets/src/main.tsx` renders `App.tsx`
- **Tailwind CSS:** No explicit setup yet; styles in `index.css` (currently empty); add if UI complexity grows
- **Agent config:** Environment variables injected via Vite `define` block (not `import.meta.env` directly)

### File Organization

```
macrofolio/
├── dfx.json                     # Canister registry
├── package.json                 # Root workspace config
├── src/
│   ├── macrofolio_backend/      # Main registry canister
│   ├── macrofolio_user/         # Per-user canister template
│   ├── macrofolio_assets/       # React frontend (Vite)
│   └── declarations/            # Auto-generated canister type definitions
```

**Pattern:** Each Motoko canister gets a sibling TypeScript declaration folder (auto-generated by `dfx build`).

---

## Common Tasks & Gotchas

### Adding a New Canister Feature

1. Add type & function to `macrofolio_backend/main.mo` or `macrofolio_user/main.mo`
2. Run `dfx build` to regenerate TypeScript declarations in `src/declarations/`
3. Import generated types in React: `import { actor as backendActor } from '../declarations/macrofolio_backend'`
4. Redeploy: `dfx deploy`

### Debugging Frontend-Canister Communication

- Check `vite.config.ts` proxy (`/api → http://127.0.0.1:4943`)
- Verify `CANISTER_ID_*` environment variables are set (print in browser console)
- Use browser DevTools Network tab to inspect HTTPS calls to replica

### Stable Storage & Upgrade Hooks

**Gotcha:** Upgrading Motoko code **clears non-stable data** — use `stable var` for portfolio data.

**Current Risk:** `assets: [Asset]` array in `macrofolio_user/main.mo` is NOT declared `stable` — **data will be lost on upgrade**.

**Solution: Pre/Post-Upgrade Hooks Pattern**

For complex state (e.g., HashMap), Motoko requires explicit migration:

```motoko
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";

private stable var _stableAssets: [(Nat, Asset)] = [];
private var assets: HashMap.HashMap<Nat, Asset> = HashMap.fromIter(_stableAssets.vals(), 0, Nat.equal, Hash.hash);

system func preupgrade() {
  _stableAssets := Iter.toArray(assets.entries());
};

system func postupgrade() {
  assets := HashMap.fromIter(_stableAssets.vals(), 0, Nat.equal, Hash.hash);
  _stableAssets := [];
};
```

**Best Practice:** Wrap stable variables in a dedicated record for versioning:

```motoko
private stable var _stableState: {
  assets: [(Nat, Asset)];
  riskProfile: ?RiskProfile;
  nextId: Nat;
} = { assets = []; riskProfile = null; nextId = 0 };
```

### Best Practice: Versioned Stable State
When upgrading a canister, Motoko re-initializes variables. To safely migrate data:

```motoko
// 1. Define a stable type
type StableState = {
    version: Nat;
    userCanisters: [(Principal, Principal)];
    // Add new fields here with default values
};

// 2. Declare it stable
private stable var state: StableState = {
    version = 1;
    userCanisters = [];
};

// 3. In postupgrade, check version and migrate
system func postupgrade() {
    if (state.version == 1) {
        // migrate to v2 logic here
        state.version := 2;
    };
    // ... restore HashMaps from state.userCanisters
};
```

---

## Next Steps for Agent Onboarding

**Priority Order (MVP-Focused):**

1. **Frontend-to-Backend Loop (Unauth)** — Get basic data flowing before II
   - Implement counter/text exchange between `macrofolio_assets` and `macrofolio_backend`
   - Verify `CANISTER_ID_*` env vars resolve correctly
   - Confirm `dfx deploy` → `dfx build` → React import chain works

2. **Stable Storage in macrofolio_user** — Ensure data survives resets
   - Mark `assets` array as `private stable var`
   - Add `preupgrade`/`postupgrade` hooks (see Stable Storage section)
   - Test: deploy → add asset → restart replica → verify asset persists

3. **Internet Identity (II) Integration** — Route auth through registry
   - Implement II login flow in React app
   - Call `getOrCreateUserCanister()` post-login
   - Retrieve user Principal and store in React state

4. **Portfolio UI** — Render Asset list with CRUD
   - Build forms to call `addAsset()`, `updateAsset()`, `deleteAsset()`
   - Display `RiskProfile` from user canister

5. **Mock Oracles** — Price updates without cycle cost
   - Add `fetchPriceMock(ticker)` to `macrofolio_backend`
   - Use hardcoded prices for stocks/crypto
   - Real HTTPS outcalls only after UI is stable
````

