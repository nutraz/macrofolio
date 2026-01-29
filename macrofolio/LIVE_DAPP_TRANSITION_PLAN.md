# Macrofolio Live DApp Transition Plan

## 📋 Current State Assessment

### ✅ Already Completed
1. **Smart Contract Security** - PortfolioAnchor.sol with:
   - EIP-712 signature verification
   - Rate limiting (10 anchors/hour, 1-min delay)
   - O(1) anchor verification (no unbounded arrays)
   - Nonce-based replay protection

2. **Frontend Security Features:**
   - DemoModeGuard component with watermarks
   - TransactionButton with demo checks
   - ModeSwitcher with confirmation dialogs
   - Input validation with Zod schemas
   - XSS protection with DOMPurify

3. **Backend Security:**
   - Supabase RLS policies with null checks
   - Rate limiting function for anchor verification
   - Public read access for anchors (verification)

4. **Wallet Integration:**
   - useWallet hook with session management
   - EIP-712 typed data signing support
   - Auto-disconnect on network/account changes

### ⚠️ Needs Updating
1. **App.tsx** - Hardcoded `useState(true)` for demo mode
2. **Environment Configuration** - Need proper .env setup
3. **Netlify Configuration** - Environment variables for live deployment

---

## 🎯 Implementation Plan

### Phase 1: Environment Variable Setup

#### Step 1.1: Update App.tsx Demo Mode Logic
```typescript
// Current (line 231):
const [isDemoMode, setIsDemoMode] = useState(true);

// Replace with:
const isDemoMode = import.meta.env.VITE_DEMO_MODE !== 'false'; // Defaults to true if not set
```

#### Step 1.2: Create Environment Template
- Update `.env.example` with all required variables
- Add VITE_DEMO_MODE documentation

#### Step 1.3: Document Required Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon public key |
| `VITE_CONTRACT_ADDRESS` | Yes | Deployed contract address |
| `VITE_CHAIN_ID` | Yes | Network chain ID (80002 for Amoy) |
| `VITE_RPC_URL` | Yes | RPC endpoint |
| `VITE_DEMO_MODE` | No | Set to "false" for live mode |

---

### Phase 2: Supabase Setup

#### Step 2.1: Create Supabase Project
1. Visit https://supabase.com
2. Create new project: `macrofolio`
3. Note project URL and anon key

#### Step 2.2: Run Database Schema
Execute SQL from `SUPABASE_SETUP.md`:
- Create `users`, `assets`, `transactions`, `anchors` tables
- Enable RLS policies
- Create rate limiting function

---

### Phase 3: Smart Contract Deployment

#### Step 3.1: Deploy to Polygon Amoy
Using Remix IDE:
1. Go to remix.ethereum.org
2. Create new file, paste PortfolioAnchor.sol
3. Compile (Solidity 0.8.19)
4. Choose "Injected Provider - MetaMask"
5. Connect to Polygon Amoy (Chain ID: 80002)
6. Get test POL from Amoy Faucet
7. Deploy and copy contract address

#### Step 3.2: Verify on Polygonscan (Optional)
- Click "Verify and Publish" in Amoy Polygonscan
- Paste contract source code

---

### Phase 4: Netlify Configuration

#### Step 4.1: Add Environment Variables
Navigate to: Site configuration > Environment variables

Add:
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key
VITE_CONTRACT_ADDRESS = 0x...
VITE_CHAIN_ID = 80002
VITE_RPC_URL = https://rpc-amoy.polygon.technology
VITE_DEMO_MODE = false  ← KEY TRIGGER
```

#### Step 4.2: Trigger Redeploy
- Save variables
- Trigger new build in Netlify

---

### Phase 5: Verification Checklist

#### Application Changes
- [ ] App.tsx uses environment variable for demo mode
- [ ] No hardcoded `useState(true)` for isDemoMode
- [ ] Demo mode banner only shows when VITE_DEMO_MODE is not "false"

#### Backend Setup
- [ ] Supabase project created
- [ ] All tables created with RLS policies
- [ ] Project URL and anon key noted

#### Smart Contract
- [ ] Contract deployed to Polygon Amoy
- [ ] Contract address copied
- [ ] Test tokens obtained

#### Deployment
- [ ] Netlify environment variables configured
- [ ] VITE_DEMO_MODE set to "false"
- [ ] Site redeployed successfully

---

## 🔄 After Transition

### What Changes
1. **Demo Mode Banner** - Disappears when VITE_DEMO_MODE=false
2. **Connect Wallet** - Triggers real MetaMask connection
3. **Anchor Portfolio** - Sends real transactions to blockchain
4. **Data Source** - Changes from "Demo Mode" to "Supabase + Web3"

### Troubleshooting
| Issue | Solution |
|-------|----------|
| Blank page after deploy | Check browser console for network errors |
| "Invalid Chain ID" | Ensure MetaMask on Polygon Amoy (80002) |
| Contract calls fail | Verify VITE_CONTRACT_ADDRESS and test tokens |

---

## 📁 Files to Modify

1. **macrofolio/src/macrofolio_assets/src/App.tsx**
   - Change demo mode detection
   - Remove hardcoded `useState(true)`

2. **macrofolio/src/macrofolio_assets/.env.example**
   - Add VITE_DEMO_MODE documentation
   - Update variable list

3. **macrofolio/src/macrofolio_assets/vite.config.ts**
   - Already configured ✓

---

## 🚀 Quick Start Commands

```bash
# 1. Create .env file from example
cd macrofolio/src/macrofolio_assets
cp .env.example .env

# 2. Edit .env with your values
nano .env

# 3. Test locally
npm run dev

# 4. Deploy to Netlify
netlify deploy --prod
```

