# MACROFOLIO SECURITY AUDIT REPORT

**Smart Contract & Application Security Audit**  
**Version 1.0**  
**Audit Date:** January 28, 2025

---

## EXECUTIVE SUMMARY

This comprehensive security audit of the Macrofolio portfolio tracking DApp identified multiple critical and high-severity vulnerabilities across the smart contract, frontend application, and infrastructure layers. The audit covered the PortfolioAnchor.sol smart contract, React/TypeScript frontend, and backend integration components.

### Findings Summary

| Severity | Count | Impact |
|----------|-------|--------|
| **CRITICAL** | 4 | Fund loss, data breach, DoS |
| **HIGH** | 6 | Security bypass, data manipulation |
| **MEDIUM** | 8 | Best practice violations, gas optimization |

---

## CRITICAL SEVERITY ISSUES

### 1. Unbounded Array Growth - Denial of Service Vulnerability

**Location:** PortfolioAnchor.sol, lines 27, 68, 89

**Description:** The userAnchors mapping stores an unbounded array that grows indefinitely. The getUserAnchors() and verifyAnchor() functions iterate over this entire array without pagination, making them vulnerable to gas limit exhaustion as the array grows.

**Impact:** After a user accumulates sufficient anchors (estimated ~2000-5000 depending on gas limit), the getUserAnchors() function will revert due to out-of-gas errors. This permanently locks users out of accessing their historical anchor data. The verifyAnchor() function becomes unusable for verification, defeating the contract's core purpose.

**Proof of Concept:**
```
1. User calls batchAnchor() repeatedly with 50 items each time
2. After ~100 batches (5000 anchors), getUserAnchors() exceeds block gas limit
3. Function reverts, making historical data permanently inaccessible
4. verifyAnchor() also becomes unusable due to loop overhead
```

**Recommendation:** Implement pagination for array access or use a mapping-based approach with indexed events for off-chain querying.

**Remediation Code:**
```solidity
// Replace array with mapping for O(1) verification
mapping(address => mapping(bytes32 => bool)) private userAnchorExists;
mapping(address => uint256) private userAnchorCount;

function anchor(string memory actionType, bytes32 dataHash) external returns (bytes32) {
    require(bytes(actionType).length > 0, "Action type required");
    require(dataHash != bytes32(0), "Invalid data hash");
    
    userAnchorExists[msg.sender][dataHash] = true;
    userAnchorCount[msg.sender]++;
    
    emit PortfolioAnchored(msg.sender, actionType, dataHash, block.timestamp);
    return dataHash;
}

function verifyAnchor(address user, bytes32 dataHash) external view returns (bool) {
    return userAnchorExists[user][dataHash];
}
```

---

### 2. Missing Access Control on Critical Functions

**Location:** Multiple files - No authentication/authorization layer

**Description:** The smart contract has no owner or access control mechanism. While this may be intentional for a public anchor system, combined with no verification of data authenticity, malicious actors can anchor fraudulent portfolio data claiming to be legitimate users.

**Impact:** 
- Attackers can spam the contract with fake anchors, polluting the blockchain with misinformation
- No way to distinguish legitimate portfolio proofs from fraudulent ones
- Storage bloat from malicious anchoring campaigns
- Contract could be used for data storage attacks
- Reputation damage if users discover fake anchors

**Recommendation:** Implement signature-based verification where dataHash must be signed by the user's wallet. Add metadata fields like nonce and timestamp to prevent replay attacks.

**Remediation Code:**
```solidity
mapping(address => uint256) public nonces;

function anchorWithSignature(
    string memory actionType,
    bytes32 dataHash,
    uint256 deadline,
    bytes memory signature
) external returns (bytes32) {
    require(block.timestamp <= deadline, "Signature expired");
    
    bytes32 structHash = keccak256(abi.encode(
        keccak256("Anchor(string actionType,bytes32 dataHash,uint256 nonce,uint256 deadline)"),
        keccak256(bytes(actionType)),
        dataHash,
        nonces[msg.sender]++,
        deadline
    ));
    
    bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
    address signer = ECDSA.recover(digest, signature);
    require(signer == msg.sender, "Invalid signature");
    
    // Continue with anchor logic
}
```

---

### 3. Supabase Row Level Security (RLS) Bypass Risk

**Location:** SUPABASE_SETUP.md, SQL schema definition

**Description:** The RLS policies rely on auth.uid() which can be null if JWT validation is bypassed or misconfigured. The anchors table policy allows read access for cross-verification on the /verify page, but this could expose all anchor data if not properly scoped.

**Impact:**
- If auth.uid() returns null due to session expiry or JWT bypass, users could potentially access other users' data
- The public verify endpoint could be abused to enumerate all anchored hashes
- Sensitive portfolio data (asset holdings, transaction history) exposed to unauthorized parties
- Compliance violations (GDPR, financial data protection)

**Current vulnerable RLS policy:**
```sql
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
```

**Recommendation:** Add explicit null checks in RLS policies: auth.uid() IS NOT NULL. Implement rate limiting on the /verify endpoint. Add additional scoping to anchors table to prevent enumeration.

**Remediation Code:**
```sql
-- Secure RLS policies with null checks
CREATE POLICY "Users can view own data" ON users 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = id);

CREATE POLICY "Users can CRUD own assets" ON assets 
FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can CRUD own transactions" ON transactions 
FOR ALL 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Limited read access for anchors verification
CREATE POLICY "Public can verify specific anchors" ON anchors
FOR SELECT
USING (true)  -- Allow read but implement rate limiting at app level
WITH CHECK (false);  -- No public writes

-- Add user-specific write policy
CREATE POLICY "Users can create own anchors" ON anchors
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);
```

---

### 4. Environment Variables Exposed in Client-Side Code

**Location:** vite.config.js, environment plugin configuration

**Description:** Vite configuration exposes ALL environment variables with CANISTER_ and DFX_ prefixes to the client-side bundle. The VITE_SUPABASE_ANON_KEY is also client-accessible (though this is expected for Supabase). However, any accidentally prefixed sensitive keys would be exposed.

**Current vulnerable configuration:**
```javascript
plugins: [
  sveltekit(),
  environment("all", { prefix: "CANISTER_" }),  // Exposes ALL CANISTER_* vars
  environment("all", { prefix: "DFX_" }),       // Exposes ALL DFX_* vars
]
```

**Impact:**
- If developers accidentally prefix sensitive credentials (e.g., CANISTER_ADMIN_KEY, DFX_IDENTITY), they become publicly visible in the compiled JavaScript bundle
- Attackers can extract these from the production build and gain unauthorized access
- Private keys, admin credentials, or API secrets could be leaked
- Source code inspection or bundle analysis reveals all environment variables

**Recommendation:** Use explicit allow-list for environment variables rather than prefix-based wildcards. Move sensitive operations to backend API routes. Implement environment variable validation in CI/CD.

**Remediation Code:**
```javascript
// vite.config.js - Use explicit whitelist
export default defineConfig({
  plugins: [
    sveltekit(),
    // Explicitly whitelist only public variables
    environment({
      CANISTER_ID_FRONTEND: process.env.CANISTER_ID_FRONTEND,
      CANISTER_ID_BACKEND: process.env.CANISTER_ID_BACKEND,
      DFX_NETWORK: process.env.DFX_NETWORK,
      // DO NOT use wildcard prefixes for sensitive data
    }),
  ],
  define: {
    // Only expose necessary public variables
    'import.meta.env.VITE_NETWORK': JSON.stringify(process.env.VITE_NETWORK || 'local'),
  }
});

// Add CI/CD validation script
// scripts/validate-env.js
const dangerousPatterns = [
  /PRIVATE_KEY/i,
  /SECRET/i,
  /PASSWORD/i,
  /ADMIN/i,
  /_KEY$/i
];

const envVars = Object.keys(process.env).filter(key => 
  key.startsWith('CANISTER_') || key.startsWith('DFX_')
);

envVars.forEach(key => {
  if (dangerousPatterns.some(pattern => pattern.test(key))) {
    console.error(`❌ SECURITY: Potentially sensitive variable exposed: ${key}`);
    process.exit(1);
  }
});
```

---

## HIGH SEVERITY ISSUES

### 1. Lack of Data Hash Validation

**Location:** PortfolioAnchor.sol, anchor() and batchAnchor() functions

**Description:** The contract only checks if dataHash != bytes32(0), but doesn't validate the hash format or relationship to actionType. No mechanism exists to verify that the hash corresponds to actual portfolio data vs. random bytes.

**Impact:**
- Users can anchor meaningless or malicious hashes
- No way to prove the integrity of anchored data
- The verification system becomes unreliable since fake hashes pass validation
- Could be used for data pollution attacks

**Recommendation:** Implement schema validation for actionType enum. Require off-chain proof of data structure (e.g., Merkle proofs). Add metadata fields for version/schema tracking.

**Remediation Code:**
```solidity
enum ActionType { ADD_ASSET, UPDATE_PORTFOLIO, DELETE_ASSET, REBALANCE }

struct AnchorMetadata {
    ActionType actionType;
    bytes32 dataHash;
    uint256 timestamp;
    uint8 schemaVersion;
}

mapping(address => AnchorMetadata[]) private userAnchors;

function anchor(
    ActionType actionType,
    bytes32 dataHash,
    uint8 schemaVersion
) external returns (bytes32) {
    require(dataHash != bytes32(0), "Invalid data hash");
    require(schemaVersion > 0 && schemaVersion <= CURRENT_SCHEMA_VERSION, "Invalid schema version");
    
    AnchorMetadata memory metadata = AnchorMetadata({
        actionType: actionType,
        dataHash: dataHash,
        timestamp: block.timestamp,
        schemaVersion: schemaVersion
    });
    
    userAnchors[msg.sender].push(metadata);
    emit PortfolioAnchored(msg.sender, actionType, dataHash, block.timestamp, schemaVersion);
    
    return dataHash;
}
```

---

### 2. No Event Indexing for Historical Queries

**Location:** PortfolioAnchor.sol, event emissions

**Description:** While events are emitted, there's no indexed actionType parameter. The getUserAnchors() function returns raw hashes without timestamps or action context, making historical analysis difficult.

**Current event:**
```solidity
event PortfolioAnchored(
    address indexed user,
    string actionType,  // NOT indexed - inefficient filtering
    bytes32 dataHash,
    uint256 timestamp
);
```

**Impact:**
- Inefficient filtering of historical anchors by action type
- Off-chain indexers cannot efficiently query specific portfolio actions
- Poor user experience when trying to reconstruct portfolio history
- Increased costs for dApp frontends querying historical data

**Recommendation:** Add indexed actionType to PortfolioAnchored event. Store struct with {hash, timestamp, actionType} instead of raw bytes32. Implement pagination for historical queries.

**Remediation Code:**
```solidity
event PortfolioAnchored(
    address indexed user,
    ActionType indexed actionType,  // Now indexed for efficient filtering
    bytes32 indexed dataHash,       // Indexed for verification queries
    uint256 timestamp,
    uint8 schemaVersion
);

// Query helper for off-chain indexers
struct AnchorInfo {
    bytes32 dataHash;
    ActionType actionType;
    uint256 timestamp;
    uint8 schemaVersion;
}

function getAnchorsPaginated(
    address user,
    uint256 offset,
    uint256 limit
) external view returns (AnchorInfo[] memory) {
    require(limit <= 100, "Max 100 per query");
    
    uint256 totalAnchors = userAnchors[user].length;
    if (offset >= totalAnchors) return new AnchorInfo[](0);
    
    uint256 end = offset + limit;
    if (end > totalAnchors) end = totalAnchors;
    
    AnchorInfo[] memory results = new AnchorInfo[](end - offset);
    for (uint256 i = offset; i < end; i++) {
        AnchorMetadata memory metadata = userAnchors[user][i];
        results[i - offset] = AnchorInfo({
            dataHash: metadata.dataHash,
            actionType: metadata.actionType,
            timestamp: metadata.timestamp,
            schemaVersion: metadata.schemaVersion
        });
    }
    return results;
}
```

---

### 3. Insecure Demo Mode Implementation

**Location:** App.tsx, Dashboard.tsx, multiple components

**Description:** Demo mode uses hardcoded data but shares the same UI/UX flow as production mode. No clear visual separation beyond small badges. Users might mistake demo actions for real blockchain transactions.

**Impact:**
- Users may believe they're anchoring real data when in demo mode
- Potential confusion leading to support burden and reputation damage
- Risk of users entering real credentials/data in demo environment
- No audit trail to track user confusion incidents

**Recommendation:** Add prominent watermarks/banners in demo mode. Disable all blockchain interaction buttons in demo. Implement clear mode switching confirmation dialogs.

**Remediation Code:**
```typescript
// Add DemoModeGuard component
const DemoModeGuard: React.FC<{ isDemoMode: boolean; children: React.ReactNode }> = ({ 
  isDemoMode, 
  children 
}) => {
  if (!isDemoMode) return <>{children}</>;
  
  return (
    <div className="relative">
      {/* Watermark overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center opacity-10">
        <div className="text-9xl font-bold text-warning rotate-[-45deg]">
          DEMO MODE
        </div>
      </div>
      
      {/* Persistent banner */}
      <div className="sticky top-0 z-40 bg-warning/90 text-warning-foreground px-4 py-2 text-center">
        <strong>⚠️ DEMO MODE ACTIVE</strong> - No real blockchain transactions will occur. 
        Data is simulated for demonstration purposes only.
      </div>
      
      {children}
    </div>
  );
};

// Disable blockchain buttons in demo
const TransactionButton: React.FC<{ isDemoMode: boolean; onClick: () => void }> = ({ 
  isDemoMode, 
  onClick 
}) => {
  const handleClick = () => {
    if (isDemoMode) {
      alert("⚠️ This action is disabled in demo mode. Connect your wallet to anchor real portfolio data.");
      return;
    }
    onClick();
  };
  
  return (
    <button 
      onClick={handleClick}
      className={isDemoMode ? "opacity-50 cursor-not-allowed" : ""}
      disabled={isDemoMode}
    >
      {isDemoMode ? "🔒 Demo Mode - Action Disabled" : "Anchor Portfolio"}
    </button>
  );
};

// Mode switching confirmation
const ModeSwitcher: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleToggle = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    onToggle();
    setShowConfirm(false);
  };
  
  return (
    <div>
      <button onClick={handleToggle}>Toggle Mode</button>
      {showConfirm && (
        <div className="modal">
          <h3>⚠️ Switch to Live Mode?</h3>
          <p>This will connect to the blockchain and all transactions will be real.</p>
          <button onClick={handleToggle}>Yes, Switch to Live Mode</button>
          <button onClick={() => setShowConfirm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};
```

---

### 4. Missing Input Validation on Frontend

**Location:** Portfolio.tsx, AssetsTable.tsx, form inputs

**Description:** Form inputs for asset quantities, prices, and transaction amounts lack validation. No checks for negative values, maximum limits, or decimal precision. String inputs could be injected with malicious content.

**Impact:**
- Users can enter invalid data leading to incorrect portfolio calculations
- XSS vulnerabilities if user input is rendered without sanitization
- Potential for integer overflow in calculation logic
- Data integrity issues in Supabase database

**Recommendation:** Implement Zod or Yup schema validation for all forms. Add input sanitization using DOMPurify. Enforce min/max constraints on numeric fields.

**Remediation Code:**
```typescript
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Define validation schemas
const AssetSchema = z.object({
  name: z.string()
    .min(1, "Asset name is required")
    .max(100, "Asset name too long")
    .refine(val => DOMPurify.sanitize(val) === val, "Invalid characters in name"),
  
  symbol: z.string()
    .min(1, "Symbol is required")
    .max(10, "Symbol too long")
    .regex(/^[A-Z0-9]+$/, "Symbol must be uppercase letters/numbers only"),
  
  quantity: z.number()
    .positive("Quantity must be positive")
    .max(1e15, "Quantity exceeds maximum")
    .refine(val => Number.isFinite(val), "Invalid quantity"),
  
  price: z.number()
    .nonnegative("Price cannot be negative")
    .max(1e12, "Price exceeds maximum")
    .refine(val => {
      const decimals = (val.toString().split('.')[1] || '').length;
      return decimals <= 8;
    }, "Maximum 8 decimal places"),
  
  type: z.enum(['stock', 'crypto', 'gold', 'real_estate', 'nft', 'fixed_income'])
});

type Asset = z.infer<typeof AssetSchema>;

// Form component with validation
const AddAssetForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<Asset>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate with Zod
      const validatedData = AssetSchema.parse(formData);
      
      // Sanitize all string fields
      const sanitizedData = {
        ...validatedData,
        name: DOMPurify.sanitize(validatedData.name),
        symbol: DOMPurify.sanitize(validatedData.symbol)
      };
      
      // Submit to backend
      await addAsset(sanitizedData);
      
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text"
        value={formData.name || ''}
        onChange={e => setFormData({...formData, name: e.target.value})}
        placeholder="Asset Name"
        maxLength={100}
      />
      {errors.name && <span className="error">{errors.name}</span>}
      
      <input 
        type="text"
        value={formData.symbol || ''}
        onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
        placeholder="Symbol"
        maxLength={10}
        pattern="[A-Z0-9]+"
      />
      {errors.symbol && <span className="error">{errors.symbol}</span>}
      
      <input 
        type="number"
        value={formData.quantity || ''}
        onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value)})}
        placeholder="Quantity"
        min="0"
        max="1000000000000000"
        step="0.00000001"
      />
      {errors.quantity && <span className="error">{errors.quantity}</span>}
      
      <button type="submit">Add Asset</button>
    </form>
  );
};
```

---

### 5. No Rate Limiting on Smart Contract

**Location:** PortfolioAnchor.sol, anchor() and batchAnchor() functions

**Description:** Users can call anchor() unlimited times in rapid succession. No cooldown period or maximum anchors per block/day. Malicious actors can spam the contract.

**Impact:**
- Contract spam leading to blockchain bloat
- Increased gas costs for legitimate users due to storage overhead
- Potential for griefing attacks to make the contract unusable
- Could exhaust block gas limit if many users spam simultaneously

**Recommendation:** Implement time-based rate limiting (e.g., max 10 anchors per hour). Add minimum time delay between anchors. Consider requiring small gas fee for spam prevention.

**Remediation Code:**
```solidity
// Add rate limiting
mapping(address => uint256) private lastAnchorTime;
mapping(address => uint256) private anchorCountInWindow;
uint256 constant RATE_LIMIT_WINDOW = 1 hours;
uint256 constant MAX_ANCHORS_PER_WINDOW = 10;
uint256 constant MIN_ANCHOR_DELAY = 1 minutes;

function anchor(
    string memory actionType,
    bytes32 dataHash
) external returns (bytes32) {
    require(bytes(actionType).length > 0, "Action type required");
    require(dataHash != bytes32(0), "Invalid data hash");
    
    // Check minimum delay between anchors
    require(
        block.timestamp >= lastAnchorTime[msg.sender] + MIN_ANCHOR_DELAY,
        "Must wait before next anchor"
    );
    
    // Reset counter if window has passed
    if (block.timestamp >= lastAnchorTime[msg.sender] + RATE_LIMIT_WINDOW) {
        anchorCountInWindow[msg.sender] = 0;
    }
    
    // Check rate limit
    require(
        anchorCountInWindow[msg.sender] < MAX_ANCHORS_PER_WINDOW,
        "Rate limit exceeded"
    );
    
    // Update tracking
    lastAnchorTime[msg.sender] = block.timestamp;
    anchorCountInWindow[msg.sender]++;
    
    // Continue with anchor logic
    userAnchorExists[msg.sender][dataHash] = true;
    emit PortfolioAnchored(msg.sender, actionType, dataHash, block.timestamp);
    
    return dataHash;
}

// View function to check remaining quota
function getRemainingQuota(address user) external view returns (uint256) {
    if (block.timestamp >= lastAnchorTime[user] + RATE_LIMIT_WINDOW) {
        return MAX_ANCHORS_PER_WINDOW;
    }
    return MAX_ANCHORS_PER_WINDOW - anchorCountInWindow[user];
}

function getNextAnchorTime(address user) external view returns (uint256) {
    uint256 nextTime = lastAnchorTime[user] + MIN_ANCHOR_DELAY;
    return nextTime > block.timestamp ? nextTime : block.timestamp;
}
```

---

### 6. Weak Wallet Connection Security

**Location:** useWallet.ts hook implementation

**Description:** Based on the code structure, wallet connection likely doesn't verify chain ID or implement proper signature verification for sensitive operations. No session timeout or automatic disconnection on network change.

**Impact:**
- Users might interact with wrong network without clear warning
- Phishing attacks where malicious dApp mimics Macrofolio
- No protection against MITM attacks on wallet communication
- Users could lose funds if connected to wrong network

**Recommendation:** Implement strict chain ID verification before any transaction. Add EIP-712 typed signatures for critical operations. Auto-disconnect on network/account change.

**Remediation Code:**
```typescript
// useWallet.ts - Secure implementation
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const SUPPORTED_CHAINS = {
  polygonAmoy: { chainId: 80002, name: 'Polygon Amoy' },
  baseSepolia: { chainId: 84532, name: 'Base Sepolia' }
};

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  
  const checkNetwork = async (provider: ethers.BrowserProvider) => {
    const network = await provider.getNetwork();
    const currentChainId = Number(network.chainId);
    setChainId(currentChainId);
    
    const supportedChainIds = Object.values(SUPPORTED_CHAINS).map(c => c.chainId);
    setIsCorrectNetwork(supportedChainIds.includes(currentChainId));
    
    if (!supportedChainIds.includes(currentChainId)) {
      console.warn(`⚠️ Connected to unsupported network: ${currentChainId}`);
      alert(`Please switch to a supported network: ${Object.values(SUPPORTED_CHAINS).map(c => c.name).join(', ')}`);
    }
  };
  
  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        await checkNetwork(provider);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet');
    }
  };
  
  const disconnect = () => {
    setAddress(null);
    setChainId(null);
    setIsCorrectNetwork(false);
  };
  
  // Listen for account and network changes
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== address) {
        console.warn('Account changed - disconnecting for security');
        disconnect();
        alert('Account changed. Please reconnect your wallet.');
      }
    };
    
    const handleChainChanged = () => {
      console.warn('Network changed - disconnecting for security');
      disconnect();
      alert('Network changed. Please reconnect your wallet.');
    };
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [address]);
  
  // EIP-712 typed signature for critical operations
  const signTypedData = async (message: any) => {
    if (!address || !isCorrectNetwork) {
      throw new Error('Wallet not connected or wrong network');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const domain = {
      name: 'Macrofolio',
      version: '1',
      chainId: chainId,
      verifyingContract: process.env.VITE_CONTRACT_ADDRESS
    };
    
    const types = {
      PortfolioAction: [
        { name: 'action', type: 'string' },
        { name: 'dataHash', type: 'bytes32' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    };
    
    try {
      const signature = await signer.signTypedData(domain, types, message);
      return signature;
    } catch (error) {
      console.error('Signature rejected:', error);
      throw error;
    }
  };
  
  return {
    address,
    chainId,
    isCorrectNetwork,
    connect,
    disconnect,
    signTypedData
  };
};
```

---

## MEDIUM SEVERITY ISSUES

### 1. Inefficient Storage Pattern in Smart Contract

**Location:** PortfolioAnchor.sol, userAnchors mapping

**Description:** Storing all anchors in an array is gas-inefficient. Each new anchor costs increasingly more gas as the array grows. Better to use mapping or emit events only.

**Recommendation:** Use mapping(bytes32 => bool) for O(1) verification. Rely on events for historical queries via off-chain indexing. Remove array storage entirely or limit to recent N anchors.

---

### 2. Missing Error Handling in Frontend

**Location:** Multiple React components, async operations

**Description:** Many async operations lack try-catch blocks. Network failures, wallet rejections, and Supabase errors may cause uncaught promise rejections.

**Recommendation:** Wrap all async calls in try-catch. Implement global error boundary component. Add user-friendly error messages with retry options.

**Remediation Code:**
```typescript
// Global Error Boundary
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Log to error tracking service
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>⚠️ Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Async error handling wrapper
const useAsyncError = () => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  
  const execute = async <T,>(
    asyncFn: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // Show user-friendly error
      alert(errorMessage || `Error: ${error.message}`);
      
      console.error('Async operation failed:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return { execute, error, loading };
};
```

---

### 3. Hardcoded Network Configuration

**Location:** README.md mentions Polygon Amoy and Base Sepolia testnets

**Description:** Network configuration appears hardcoded rather than dynamically loaded. No easy way to switch networks or deploy to mainnet.

**Recommendation:** Create network configuration files per environment. Support multiple networks via environment variables. Add network detection and auto-switching.

---

### 4. No Smart Contract Upgradeability

**Location:** PortfolioAnchor.sol - no proxy pattern

**Description:** Contract is not upgradeable. Any bugs or improvements require deploying a new contract and migrating data.

**Recommendation:** Consider implementing UUPS or Transparent Proxy pattern. Document migration strategy for non-upgradeable approach. Add version tracking in contract.

---

### 5. Missing Transaction Confirmation UI

**Location:** Frontend components handling blockchain interactions

**Description:** No clear UI feedback for transaction states (pending, confirmed, failed). Users may not know if their anchor was successfully recorded.

**Recommendation:** Add transaction status tracking component. Show toast notifications for tx states. Implement block confirmation counter.

---

### 6. Inadequate Gas Estimation

**Location:** Smart contract interactions in frontend

**Description:** No gas estimation before transaction submission. Users might face failed transactions due to insufficient gas.

**Recommendation:** Implement gas estimation with 20% buffer. Show estimated gas cost to users before confirmation. Handle gas price spikes gracefully.

---

### 7. Motoko Backend Not Production-Ready

**Location:** macrofolio_backend/main.mo

**Description:** The Motoko backend uses placeholder values and dummy principals for MVP. The getOrCreateUserCanister() function returns hardcoded canister IDs.

**Recommendation:** Implement actual canister creation logic. Add proper caller authentication. Remove placeholder principals before production.

---

### 8. No Content Security Policy (CSP)

**Location:** netlify.toml, security headers configuration

**Description:** While basic security headers exist in test frontend config, the main app may lack comprehensive CSP preventing XSS attacks.

**Recommendation:** Add strict CSP headers to Netlify config. Restrict script sources to self and trusted CDNs. Implement nonce-based inline script allowlisting.

---

## GENERAL RECOMMENDATIONS

### Smart Contract Best Practices

- Add comprehensive NatSpec documentation to all functions
- Implement OpenZeppelin's ReentrancyGuard for additional safety
- Add circuit breaker/pause functionality for emergency situations
- Deploy with verified source code on block explorers
- Implement unit tests with >90% coverage before mainnet deployment

### Frontend Security

- Implement React Error Boundaries for graceful error handling
- Add Helmet or similar library for security headers
- Use SRI (Subresource Integrity) for all external scripts/styles
- Implement proper CORS policies for API endpoints
- Add rate limiting on frontend to prevent abuse

### Infrastructure & DevOps

- Set up automated security scanning in CI/CD pipeline
- Implement dependency vulnerability scanning (npm audit, Snyk)
- Add environment-specific configuration validation
- Set up monitoring and alerting for contract events
- Implement backup strategy for Supabase database

### User Experience & Safety

- Add transaction preview before wallet confirmation
- Implement comprehensive user onboarding/tutorial
- Add clear warnings about testnet vs mainnet
- Implement session timeout for inactive users
- Add export functionality for user data (GDPR compliance)

---

## CONCLUSION

The Macrofolio project demonstrates strong foundational architecture with a clear vision for self-custodial portfolio tracking. However, multiple critical vulnerabilities must be addressed before production deployment, particularly the unbounded array growth issue that can permanently lock users out of their data.

**Priority remediation order:**

1. **CRITICAL:** Fix unbounded array and implement pagination
2. **CRITICAL:** Add access control and signature verification
3. **CRITICAL:** Secure Supabase RLS policies with null checks
4. **HIGH:** Implement rate limiting and spam prevention
5. **HIGH:** Add comprehensive input validation across all layers

Once these issues are resolved and a comprehensive test suite is implemented, Macrofolio will provide a robust, secure platform for decentralized portfolio tracking. We recommend conducting a follow-up audit after remediation and before mainnet deployment.

---

**Audit completed by:** Claude (Anthropic AI)  
**Report generated:** January 28, 2025

---

**END OF REPORT**
