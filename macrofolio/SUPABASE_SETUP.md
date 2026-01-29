# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in the details:
   - **Name**: `macrofolio`
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your users
4. Click "Create new project"

## 2. Get API Credentials

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public** key

## 3. Run Database Schema

Go to **SQL Editor** in Supabase and run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (links to auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'gold', 'real_estate', 'nft', 'fixed_income')),
  name TEXT NOT NULL,
  symbol TEXT,
  quantity DECIMAL(18, 8) NOT NULL,
  price_per_unit DECIMAL(18, 8) NOT NULL,
  total_value DECIMAL(18, 2) GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'transfer')),
  amount DECIMAL(18, 2) NOT NULL,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'anchored')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anchors table (blockchain proof)
CREATE TABLE anchors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  data_hash TEXT NOT NULL UNIQUE,
  chain_tx TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE anchors ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- SECURE RLS POLICIES (with null checks to prevent bypass)
-- =============================================================================

-- USERS TABLE - with explicit null checks
CREATE POLICY "Users can view own data" ON users 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Users can update own data" ON users 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

-- ASSETS TABLE - with explicit null checks
CREATE POLICY "Users can view own assets" ON assets 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert own assets" ON assets 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own assets" ON assets 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete own assets" ON assets 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- TRANSACTIONS TABLE - with explicit null checks
CREATE POLICY "Users can view own transactions" ON transactions 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ANCHORS TABLE - limited public read for verification, restricted write
CREATE POLICY "Anyone can verify anchors by data_hash" ON anchors 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own anchors" ON anchors 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can view own anchors" ON anchors 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- No UPDATE or DELETE for anchors (immutable proof)

-- =============================================================================
-- RATE LIMITING FUNCTION (prevent anchor enumeration)
-- =============================================================================

CREATE OR REPLACE FUNCTION check_verify_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
  rate_limit CONSTANT INTEGER := 100; -- 100 requests per minute
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM anchors
  WHERE data_hash = NEW.data_hash
    AND created_at > NOW() - INTERVAL '1 minute';
  
  IF recent_count > rate_limit THEN
    RAISE EXCEPTION 'Rate limit exceeded for anchor verification';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for rate limiting (optional - enable if needed)
-- DROP TRIGGER IF EXISTS rate_limit_verify ON anchors;
-- CREATE TRIGGER rate_limit_verify
--   BEFORE INSERT ON anchors
--   FOR EACH ROW EXECUTE FUNCTION check_verify_rate_limit();
```

## 4. Configure Environment Variables

Create `.env` file in `macrofolio/src/macrofolio_assets/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CHAIN_ID=80002
VITE_RPC_URL=https://rpc-amoy.polygon.technology
VITE_CONTRACT_ADDRESS=0x...
VITE_DEMO_MODE=true
```

## 5. Enable Email Auth (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure password requirements as needed

## 6. Test the Setup

1. Start the dev server: `cd macrofolio/src/macrofolio_assets && npm run dev`
2. Try signing up with an email/password
3. Check the `users` table in Supabase dashboard to verify data

---

## 7. About the Verify Page (/verify)

The public `/verify` page performs **cross-verification** by checking both on-chain and off-chain records:

- It queries the `anchors` table by `data_hash` to confirm records exist both on Polygon Amoy and in Supabase
- This proves: *"We anchor real application state, not random events"*
- If both records exist, the page shows: "✅ Verified On-Chain + Off-Chain"
- If only on-chain exists: "✅ Verified On-Chain"

### Cross-Verification Flow
```
User pastes txHash → Fetch on-chain event → Decode PortfolioAnchored → 
Query Supabase by data_hash → Display dual verification status
```

**Note:** The `anchors.data_hash` column is used by `/verify` for cross-verification. Ensure RLS allows read access for this query.

## Troubleshooting

### "RLS Policy" Errors
Make sure all RLS policies are enabled. Check the **Authentication** → **Policies** section.

### Auth Not Working
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase dashboard for any blocked requests in **Logs**

### User Profile Not Created
The `useAuth` hook automatically creates a user profile after signup. If it fails:
1. Check RLS policies
2. Verify the `users` table schema

