# Macrofolio Live DApp - Implementation Guide

## ✅ Completed So Far
- [x] Updated App.tsx to use VITE_DEMO_MODE environment variable
- [x] Updated .env.example with complete documentation
- [x] Created local test template (.env.local.example)
- [x] Created transition plan and TODO tracker

---

## 🎯 Next Steps

### Step 1: Initialize Supabase Database

**Instructions:**
1. Go to your Supabase Dashboard: https://supabase.com
2. Select your `macrofolio` project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New query**
5. Copy and paste the entire contents of `SUPABASE_SETUP.md`
6. Click **Run** to execute the SQL

**What this creates:**
- `users` table - User profiles linked to auth
- `assets` table - Portfolio assets (stocks, crypto, gold, etc.)
- `transactions` table - Buy/sell/transfer records
- `anchors` table - Blockchain proof records
- RLS policies - Security policies for data access
- Rate limiting function - Prevents anchor enumeration

---

### Step 2: Deploy Smart Contract to Polygon Amoy

**Using Remix IDE:**

1. **Access Remix:** Go to https://remix.ethereum.org

2. **Create Contract File:**
   - Right click on `contracts` folder
   - Create New File → `PortfolioAnchor.sol`
   - Paste content from `macrofolio/contracts/PortfolioAnchor.sol`

3. **Compile:**
   - Go to **Solidity Compiler** tab (left sidebar)
   - Select Compiler version: `0.8.19`
   - Check **Auto compile**
   - Ensure no compilation errors

4. **Deploy:**
   - Go to **Deploy** tab
   - Select Environment: **Injected Provider - MetaMask**
   - Ensure MetaMask is connected to **Polygon Amoy Testnet** (Chain ID: 80002)
   - Click **Deploy** (accept gas fees in MetaMask)

5. **Get Contract Address:**
   - After deployment, copy the contract address from Remix
   - Save this for VITE_CONTRACT_ADDRESS

6. **Verify (Optional):**
   - Go to https://amoy.polygonscan.com
   - Search your contract address
   - Click **Verify and Publish**
   - Paste contract source code

---

### Step 3: Configure Netlify Environment Variables

**Site Dashboard → Site settings → Environment variables**

Add these variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `VITE_CONTRACT_ADDRESS` | Your deployed contract address |
| `VITE_CHAIN_ID` | 80002 |
| `VITE_RPC_URL` | https://rpc-amoy.polygon.technology |
| `VITE_DEMO_MODE` | false |

**After saving:**
- Trigger a new deployment in Netlify
- Site will rebuild with live backend

---

### Step 4: Local Testing (Optional but Recommended)

```bash
cd macrofolio/src/macrofolio_assets

# Create local .env from template
cp .env.local.example .env

# Edit with your actual values
nano .env

# Run development server
npm run dev
```

**Verify:**
- [ ] Demo mode banner is gone
- [ ] Browser Network tab shows requests to Supabase
- [ ] Wallet connection works
- [ ] No console errors

---

## 📋 Quick Reference: Supabase SQL Setup

The SQL in `SUPABASE_SETUP.md` creates these tables:

```sql
