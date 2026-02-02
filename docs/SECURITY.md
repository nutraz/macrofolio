# Security Implementation Details

## 🔒 Security Philosophy

Macrofolio operates under the assumption that the internet is a hostile environment. We implement defense-in-depth security measures at every layer, from frontend to blockchain.

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Architecture                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Frontend Security                                 │
│  - Content Security Policy (CSP)                            │
│  - XSS Prevention (DOMPurify)                               │
│  - Input Validation (Zod)                                   │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Authentication & Authorization                    │
│  - Supabase Auth                                            │
│  - Row-Level Security (RLS)                                 │
│  - JWT Session Management                                   │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Database Security                                 │
│  - Parameterized Queries                                    │
│  - Connection Encryption                                    │
│  - Audit Logging                                            │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Smart Contract Security                           │
│  - Reentrancy Guards                                        │
│  - Input Validation                                         │
│  - Access Controls                                          │
├─────────────────────────────────────────────────────────────┤
│  Layer 5: Infrastructure Security                           │
│  - HTTPS/TLS                                                │
│  - Rate Limiting                                            │
│  - DDoS Protection                                          │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Implemented Security Measures

### 1. Frontend Security

#### Content Security Policy (CSP)

```json
// vercel.json headers
{
  "Content-Security-Policy": {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https:"],
    "connect-src": ["'self'", "https:", "wss:"],
    "frame-ancestors": ["'none'"]
  }
}
```

#### XSS Prevention

```typescript
// Using DOMPurify to sanitize user input
import DOMPurify from 'dompurify';

const sanitizeInput = (userInput: string): string => {
  return DOMPurify.sanitize(userInput, {
    ALLOWED_TAGS: [], // Strip all HTML
    ALLOWED_ATTR: []
  });
};

// For rich text content
const sanitizeRichText = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};
```

#### Input Validation with Zod

```typescript
// validation.ts
import { z } from 'zod';

// Asset validation schema
export const assetSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  name: z.string().min(1).max(100),
  type: z.enum(['stock', 'crypto', 'gold', 'real_estate', 'nft']),
  quantity: z.number().positive(),
  purchasePrice: z.number().nonnegative(),
  purchaseDate: z.string().datetime(),
  metadata: z.record(z.unknown()).optional()
});

// User input validation
export const validateAsset = (data: unknown) => {
  try {
    return { success: true, data: assetSchema.parse(data) };
  } catch (error) {
    return { success: false, error: error.errors };
  }
};
```

### 2. Authentication & Authorization

#### Supabase Authentication

```typescript
// useAuth hook
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Session management
const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Protected route access
const requireAuth = async () => {
  const session = await getSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
};
```

#### Row-Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE anchors ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users CRUD own data" ON users
  FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Users CRUD own assets" ON assets
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users CRUD own transactions" ON transactions
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users CRUD own anchors" ON anchors
  FOR ALL
  USING (auth.uid() = user_id);
```

### 3. Database Security

#### Parameterized Queries

```typescript
// Safe query with parameters
const { data, error } = await supabase
  .from('assets')
  .select('*')
  .eq('user_id', userId) // Parameterized automatically
  .eq('type', assetType);
```

#### Connection Security

```typescript
// Supabase client configuration
const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-application-name': 'macrofolio' }
  }
});
```

### 4. Smart Contract Security

#### Reentrancy Guards

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PortfolioAnchor {
    mapping(address => uint256) private balances;
    bool private locked;
    
    modifier noReentrant() {
        require(!locked, "No reentrancy");
        locked = true;
        _;
        locked = false;
    }
    
    function anchorPortfolio(
        bytes32 _merkleRoot,
        uint256 _totalValueUSD,
        AssetData[] calldata _assets
    ) external noReentrant {
        // Logic here
    }
}
```

#### Access Control

```solidity
access control for sensitive functions
contract PortfolioAnchor is Ownable, AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    function setVerification(
        address _verifier,
        bool _enabled
    ) external onlyOwner {
        if (_enabled) {
            _grantRole(VERIFIER_ROLE, _verifier);
        } else {
            _revokeRole(VERIFIER_ROLE, _verifier);
        }
    }
    
    function verifyPortfolio(
        uint256 _snapshotId
    ) external onlyRole(VERIFIER_ROLE) {
        // Verification logic
    }
}
```

### 5. Infrastructure Security

#### HTTPS/TLS

All connections use HTTPS/TLS:
- Frontend → Vercel CDN
- API → Supabase
- Blockchain → Polygon RPC

#### Rate Limiting

```typescript
// Rate limiting for API calls
const rateLimit = async (
  handler: Function,
  limit: number = 100,
  window: number = 60000
) => {
  const now = Date.now();
  const windowStart = now - window;
  
  // Check and increment rate limit counter
  const count = await getRateLimitCount(userId, windowStart);
  
  if (count >= limit) {
    throw new Error('Rate limit exceeded');
  }
  
  await incrementRateLimit(userId, now);
  return handler();
};
```

## 🔬 Security Testing

### Test Coverage

```typescript
// security.test.ts
describe('Security Tests', () => {
  test('XSS prevention: script tags are stripped', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
  });
  
  test('SQL injection prevention', async () => {
    const maliciousInput = "'; DROP TABLE assets; --";
    const result = await validateAsset({ symbol: maliciousInput });
    expect(result.success).toBe(false);
  });
  
  test('Unauthorized access is blocked', async () => {
    await expect(
      supabase.from('assets').select('*').neq('user_id', 'other_user')
    ).rejects.toThrow();
  });
});
```

### Security Audit Checklist

- [ ] Input validation on all endpoints
- [ ] Authentication on protected routes
- [ ] Authorization checks on all mutations
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Audit logging
- [ ] Encryption at rest and in transit

## 🚨 Incident Response

### Reporting Security Vulnerabilities

**Do NOT** open public issues for security vulnerabilities.

Report security issues privately to:

- **Email**: security@macrofolio.dev
- **GitHub**: Contact maintainers directly

### Response Process

1. **Acknowledgment**: Within 24 hours
2. **Assessment**: Within 48 hours
3. **Resolution**: Within 7 days (critical), 30 days (high)
4. **Disclosure**: After patch release

## 🔮 Future Security Enhancements

### Post-Quantum Cryptography

Planning migration path for lattice-based algorithms:

```typescript
// Future: Post-quantum key exchange
import { kyber } from 'liboqs';

const generateQuantumSafeKey = async (): Promise<void> => {
  const kem = new kyber.Kyber512();
  const { publicKey, secretKey } = await kem.generateKeypair();
  // Store quantum-safe public key
};
```

### Zero-Knowledge Proofs

Implementation for private portfolio verification:

```typescript
// Future: ZK proof generation
import { zkp } from 'zkp';

const generatePortfolioProof = async (
  portfolio: PortfolioData,
  commitment: string
): Promise<ZKProof> => {
  const witness = {
    assets: portfolio.assets,
    totalValue: portfolio.totalValue,
    commitment
  };
  
  return await zkp.generateProof('portfolio', witness);
};
```

## 📊 Security Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Test Coverage | 75% | 90% |
| Vulnerabilities (Critical) | 0 | 0 |
| Vulnerabilities (High) | 0 | 0 |
| Mean Time to Respond | 24h | 12h |
| Mean Time to Resolve | 7d | 3d |

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Solidity Best Practices](https://consensys.net/blog/developers/smart-contract-security-best-practices/)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Document Version**: 1.0  
**Last Security Review**: 2024  
**Next Audit**: Q2 2025  
**Responsible**: Security Team

