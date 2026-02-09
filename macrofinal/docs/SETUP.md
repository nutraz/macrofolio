# Macrofolio - Full Setup Guide

## Current Status
✅ Dev server running in **Demo Mode**

## What's Needed to Make It Fully Alive

### 1. Supabase Setup (Backend & Auth)

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create new project (free tier works)
   - Get your project URL and anon key

2. **Create `.env` file:**
   ```bash
   cd macrofinal/web
   cp .env.example .env
   ```

3. **Add environment variables:**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run database migrations (SQL):**
   ```sql
   -- Create users table
   create table users (
     id uuid references auth.users not null primary key,
     email text,
     wallet_address text,
     created_at timestamp with time zone default timezone('utc'::text, now())
   );

   -- Create assets table
   create table assets (
     id uuid default uuid_generate_v4() primary key,
     user_id uuid references auth.users not null,
     name text not null,
     symbol text,
     type text not null,
     quantity numeric,
     purchase_price numeric,
     purchase_date date,
     current_price numeric,
     notes text,
     created_at timestamp with time zone default timezone('utc'::text, now())
   );

   -- Enable RLS policies
   alter table users enable row level security;
   alter table assets enable row level security;

   -- Create policies
   create policy "Users can see own data" on users for select using (auth.uid() = id);
   create policy "Users can manage own assets" on assets for all using (auth.uid() = user_id);
   ```

### 2. MetaMask & Polygon Amoy Setup

1. **Install MetaMask:**
   - Download from https://metamask.io
   - Create new wallet or import existing

2. **Add Polygon Amoy Testnet:**
   - Network Name: `Polygon Amoy`
   - RPC URL: `https://rpc-amoy.polygon.technology`
   - Chain ID: `80002`
   - Currency Symbol: `MATIC`
   - Explorer: `https://www.oklink.com/amoy`

3. **Get Testnet MATIC:**
   - Visit https://faucet.polygon.technology
   - Request free MATIC for testing

### 3. Contract Deployment (Optional - for blockchain features)

1. **Deploy PortfolioAnchor.sol:**
   ```bash
   cd macrofinal/chain
   npx hardhat compile
   npx hardhat run scripts/deploy.ts --network polygonAmoy
   ```

2. **Add contract address to `.env`:**
   ```env
   VITE_CONTRACT_ADDRESS=0x...
   VITE_CHAIN_ID=80002
   VITE_RPC_URL=https://rpc-amoy.polygon.technology
   ```

### 4. RevenueCat Setup (Monetization)

1. **Create RevenueCat Account:**
   - Go to https://revenuecat.com
   - Create new project

2. **Configure In-App Purchases:**
   - Set up subscription offerings
   - Free tier: Basic features
   - Premium tier ($4.99/month): Advanced analytics

3. **Add keys to `.env`:**
   ```env
   VITE_REVENUECAT_API_KEY=your-api-key
   ```

### 5. Restart Dev Server

After setting up `.env`:
```bash
cd macrofinal/web
npm run dev
```

## Quick Start (Minimal Setup)

For basic functionality (no blockchain):
1. Create Supabase project
2. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to `.env`
3. Restart dev server
4. Sign up / log in to use the app

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_SUPABASE_URL | Yes | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Yes | Supabase anonymous key |
| VITE_DEMO_MODE | No | Set to "false" to disable demo mode |
| VITE_CHAIN_ID | No | Blockchain network (default: 80002) |
| VITE_RPC_URL | No | RPC endpoint URL |
| VITE_CONTRACT_ADDRESS | No | Smart contract address |
| VITE_REVENUECAT_API_KEY | No | RevenueCat API key |

## Troubleshooting

**Demo mode persists?**
- Make sure `VITE_DEMO_MODE=false` in `.env`
- Restart dev server after changing `.env`

**Can't connect wallet?**
- Install MetaMask browser extension
- Get testnet MATIC from faucet
- Check network is set to Polygon Amoy

**Supabase errors?**
- Verify URL and key are correct
- Check RLS policies are set up
- Ensure tables exist in database
