# Macrofolio Migration Plan: ICP → Web3/Supabase Stack

## 📋 Project Overview

**Current Stack:**
- Frontend: React + Vite + TypeScript (`macrofolio/src/macrofolio_assets/`)
- Backend: Internet Computer Protocol canisters (`macrofolio/src/`)
- Auth: Internet Identity
- UI: Tailwind CSS with dark theme + glassmorphism

**Target Stack:**
- Frontend: React + Vite + TypeScript (same, but with Netlify)
- Backend: Supabase (PostgreSQL + Auth + Edge Functions)
- Auth: Supabase Auth (Email + MetaMask)
- Web3: Polygon Amoy / Base Sepolia testnet (for anchoring proofs)
- Hosting: GitHub → Netlify (free tier)

---

## 📁 Phase 1: Project Restructuring & Cleanup

### 1.1 Remove ICP Dependencies
**Files to modify:**
- `macrofolio/src/macrofolio_assets/package.json`

**Changes:**
```diff
dependencies: {
-  "@dfinity/agent": "^0.15.7",
-  "@dfinity/auth-client": "^0.15.7",
-  "@dfinity/candid": "^0.15.7",
-  "@dfinity/principal": "^0.15.7",
+  "@supabase/supabase-js": "^2.39.0",
+  "ethers": "^6.10.0",
   "react-router-dom": "^6.22.0",
   "recharts": "^2.12.0"
}
```

### 1.2 Clean Up ICP Canister Code (Archive)
- Move `macrofolio/src/macrofolio_backend/`, `macrofolio/src/macrofolio_user/`, `macrofolio/src/internet_identity/` to `archive/icp-canisters/`
- Keep for reference but exclude from build

### 1.3 Update Directory Structure
```
macrofolio/
├── archive/
│   └── icp-canisters/
├── src/
│   ├── macrofolio_assets/          # Main frontend
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── supabase.ts     # NEW: Supabase client
│   │   │   │   ├── web3.ts         # NEW: Web3/ethers utilities
│   │   │   │   ├── hooks/          # NEW: Custom hooks
│   │   │   │   └── types.ts        # UPDATED: Type definitions
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── sections/
│   │   ├── .env.example            # UPDATED: New env vars
│   │   └── ...
├── contracts/                       # NEW: Solidity contracts
│   └── PortfolioAnchor.sol
├── netlify/                         # NEW: Netlify config
│   └── netlify.toml
└── ...
```

---

## 📁 Phase 2: Supabase Integration

### 2.1 Environment Setup
**Create `macrofolio/src/macrofolio_assets/.env`:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CHAIN_ID=80002  # Polygon Amoy
VITE_RPC_URL=https://rpc-amoy.polygon.technology
VITE_CONTRACT_ADDRESS=0x...
```

### 2.2 Supabase Client (`src/lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: uuid;
  email: string;
  created_at: timestamp;
}

export interface Asset {
  id: uuid;
  user_id: uuid;
  asset_type: 'stock' | 'crypto' | 'gold' | 'real_estate' | 'nft' | 'fixed_income';
  name: string;
  symbol?: string;
  quantity: number;
  price_per_unit: number;
  total_value: number;
  created_at: timestamp;
}

export interface Transaction {
  id: uuid;
  user_id: uuid;
  asset_id: uuid;
  type: 'buy' | 'sell' | 'transfer';
  amount: number;
  tx_hash?: string;
  status: 'pending' | 'anchored';
  created_at: timestamp;
}

export interface Anchor {
  id: uuid;
  user_id: uuid;
  action_type: string;
  data_hash: string;
  chain_tx: string;
  created_at: timestamp;
}
```

### 2.3 Database Schema (Supabase SQL)
Run this in Supabase SQL Editor:

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
  data_hash TEXT NOT NULL,
  chain_tx TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE anchors ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access own data)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can CRUD own assets" ON assets FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own anchors" ON anchors FOR ALL USING (auth.uid() = user_id);
```

### 2.4 Auth Hook (`src/hooks/useAuth.ts`)
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signUp, signIn, signOut };
}
```

---

## 📁 Phase 3: Web3 Integration

### 3.1 Smart Contract (`contracts/PortfolioAnchor.sol`)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PortfolioAnchor {
    // Event emitted when portfolio data is anchored
    event PortfolioAnchored(
        address indexed user,
        string actionType,
        bytes32 dataHash,
        uint256 timestamp
    );

    // Anchor portfolio action to blockchain
    function anchor(
        string memory actionType,
        bytes32 dataHash
    ) external returns (bytes32) {
        emit PortfolioAnchored(
            msg.sender,
            actionType,
            dataHash,
            block.timestamp
        );
        return dataHash;
    }

    // Batch anchor for efficiency
    function batchAnchor(
        string[] memory actionTypes,
        bytes32[] memory dataHashes
    ) external {
        require(actionTypes.length == dataHashes.length, "Length mismatch");
        for (uint i = 0; i < actionTypes.length; i++) {
            emit PortfolioAnchored(
                msg.sender,
                actionTypes[i],
                dataHashes[i],
                block.timestamp
            );
        }
    }
}
```

### 3.2 Web3 Utilities (`src/lib/web3.ts`)
```typescript
import { ethers } from 'ethers';

// Contract ABI (simplified)
const CONTRACT_ABI = [
  "function anchor(string actionType, bytes32 dataHash) returns (bytes32)",
  "event PortfolioAnchored(address indexed user, string actionType, bytes32 dataHash, uint256 timestamp)"
];

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  async connect() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.signer);
    
    return await this.signer.getAddress();
  }

  async disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  async getChainId(): Promise<number> {
    if (!this.provider) throw new Error('Not connected');
    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }

  async addNetwork(chainId: number, rpcUrl: string, name: string) {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // Chain not added, try to add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${chainId.toString(16)}`,
            chainName: name,
            rpcUrls: [rpcUrl],
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          }],
        });
      }
    }
  }

  async anchorData(actionType: string, data: object): Promise<{ hash: string; txHash: string }> {
    if (!this.contract || !this.signer) {
      throw new Error('Web3 not initialized');
    }

    // Serialize and hash data
    const dataString = JSON.stringify(data);
    const dataHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));

    // Send transaction
    const tx = await this.contract.anchor(actionType, dataHash);
    const receipt = await tx.wait();

    return {
      hash: dataHash,
      txHash: receipt.hash
    };
  }

  isConnected(): boolean {
    return this.signer !== null;
  }
}

export const web3Service = new Web3Service();
```

### 3.3 Network Config
```typescript
export const NETWORKS = {
  polygonAmoy: {
    chainId: 80002,
    name: 'Polygon Amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    explorer: 'https://amoy.polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
  },
  baseSepolia: {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    explorer: 'https://sepolia.basescan.org',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
  }
};
```

---

## 📁 Phase 4: UI Updates

### 4.1 Updated App State (`App.tsx`)
```typescript
import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { web3Service, NETWORKS } from './lib/web3';

function App() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<string>('Demo');

  const handleConnect = async () => {
    if (isDemoMode) {
      // Demo mode - no wallet needed
      setWalletAddress('demo-user');
      return;
    }

    try {
      const address = await web3Service.connect();
      setWalletAddress(address);
      const chainId = await web3Service.getChainId();
      const network = Object.values(NETWORKS).find(n => n.chainId === chainId);
      setCurrentNetwork(network?.name || 'Unknown');
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  // ... rest of component
}
```

### 4.2 Updated Header with Network Status
```typescript
// In Header.tsx - Add wallet/network status
const [walletStatus, setWalletStatus] = useState<{
  connected: boolean;
  network?: string;
  address?: string;
}>({ connected: false });

// Update on connection
useEffect(() => {
  if (walletAddress) {
    setWalletStatus({
      connected: true,
      network: currentNetwork,
      address: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    });
  }
}, [walletAddress, currentNetwork]);
```

### 4.3 Transaction History with Explorer Links
```typescript
// In AssetsTable or new Transactions component
const ExplorerLink: React.FC<{ txHash: string }> = ({ txHash }) => {
  const explorerUrl = `${NETWORKS.polygonAmoy.explorer}/tx/${txHash}`;
  
  return (
    <a 
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-info hover:text-info-light flex items-center gap-1"
    >
      <ExternalLink className="w-3 h-3" />
      View
    </a>
  );
};
```

### 4.4 Demo Mode Toggle
Add a toggle in settings or near the connect button:
```typescript
<div className="flex items-center gap-2">
  <span className={`text-xs ${isDemoMode ? 'text-warning' : 'text-success'}`}>
    {isDemoMode ? 'Demo Mode' : 'Live Web3'}
  </span>
  <button
    onClick={() => setIsDemoMode(!isDemoMode)}
    className={`w-10 h-6 rounded-full transition-colors ${
      isDemoMode ? 'bg-warning/30' : 'bg-success/30'
    }`}
  >
    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
      isDemoMode ? 'translate-x-1' : 'translate-x-5'
    }`} />
  </button>
</div>
```

---

## 📁 Phase 5: Deployment Configuration

### 5.1 Netlify Config (`netlify.toml`)
```toml
[build]
  command = "cd macrofolio/src/macrofolio_assets && npm install && npm run build"
  publish = "macrofolio/src/macrofolio_assets/dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 5.2 GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install -g netlify-cli
      - run: netlify deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 📁 Phase 6: Updated Package.json

```json
{
  "name": "macrofolio-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "ethers": "^6.10.0",
    "lucide-react": "^0.378.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.23",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.19",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}
```

---

## 📋 Task Checklist Summary

### Phase 1: Cleanup
- [ ] Remove @dfinity dependencies from package.json
- [ ] Add @supabase/supabase-js and ethers
- [ ] Archive ICP canister code
- [ ] Create new directory structure

### Phase 2: Supabase Setup
- [ ] Create Supabase project
- [ ] Run SQL schema migrations
- [ ] Create supabase.ts client
- [ ] Implement useAuth hook
- [ ] Create API helpers for assets/transactions

### Phase 3: Web3 Integration
- [ ] Write PortfolioAnchor.sol contract
- [ ] Deploy to testnet (Polygon Amoy or Base Sepolia)
- [ ] Implement web3.ts service
- [ ] Add network switching utilities

### Phase 4: UI Updates
- [ ] Update App.tsx with new auth/web3 state
- [ ] Add demo mode toggle
- [ ] Update Header with network status
- [ ] Add explorer links to transactions
- [ ] Update connection flow UI

### Phase 5: Deployment
- [ ] Create netlify.toml
- [ ] Connect GitHub repo to Netlify
- [ ] Add environment variables
- [ ] Test deployment

### Phase 6: Testing
- [ ] Test user signup/login
- [ ] Test asset CRUD operations
- [ ] Test Web3 connection
- [ ] Test anchoring flow
- [ ] Verify RLS policies

---

## ⚠️ Notes

1. **MetaMask Installation**: Users will need MetaMask browser extension
2. **Testnet Faucets**: Will need to provide links to Polygon Amoy / Base Sepolia faucets
3. **Contract Deployment**: Deploy contract once and save address to .env
4. **Security**: Never expose private keys; use MetaMask for signing
5. **RLS**: Supabase RLS policies are critical for security
6. **Demo Mode**: Allows testing without wallet for non-Web3 users

