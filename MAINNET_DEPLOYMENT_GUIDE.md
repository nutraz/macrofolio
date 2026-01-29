# Polygon Mainnet Deployment Guide

**Last Updated:** January 29, 2026

## Pre-Deployment Checklist

### Code Readiness
- [x] All tests pass locally (>90% coverage)
- [x] Contract audited by external security firm (or ready for audit)
- [x] No console.log() statements in contract code
- [x] All hardcoded values removed
- [x] Gas optimization complete (contract uses <100k gas per anchor)

### Environment Setup
- [ ] `.env` file exists with:
  - `PRIVATE_KEY` (deployment wallet, NEVER commit!)
  - `POLYGON_RPC_URL` (from Alchemy/Infura)
  - `POLYGONSCAN_API_KEY` (for verification)
  - `VERIFY_CONTRACT=true` (to verify after deployment)

- [ ] Deployment wallet funded with >1 POL
  - Minimum required: 0.5 POL (for contract + verification)
  - Recommended: 2+ POL (for safety margin)

- [ ] Hardhat configured for Polygon Mainnet
  - Network: `https://polygon-rpc.com/` or Alchemy endpoint
  - Chain ID: 137
  - Deployer address has balance

### Team Coordination
- [ ] Team notified of deployment window
- [ ] Rollback plan documented
- [ ] Monitoring setup complete (Sentry, Alchemy webhooks)
- [ ] On-call engineer assigned
- [ ] Communication channel ready (#deployment)

---

## Deployment Steps

### Step 1: Prepare Environment

```bash
# Navigate to contract directory
cd macrofolio

# Install dependencies (if not already done)
npm install

# Create .env file with required variables
cat > .env << EOF
PRIVATE_KEY=0x... (your deployment wallet private key)
POLYGON_RPC_URL=https://polygon-rpc.com/
POLYGONSCAN_API_KEY=your_api_key_here
VERIFY_CONTRACT=true
EOF

# Make sure .env is in .gitignore
echo ".env" >> .gitignore

# Verify environment setup
npx hardhat accounts --network polygon
```

### Step 2: Run Pre-Flight Checks

```bash
# Check deployer balance
npx hardhat accounts --network polygon

# Run contract tests
npm test

# Compile contract
npx hardhat compile
```

### Step 3: Deploy Contract

**Option A: Interactive Safe Deployment (RECOMMENDED)**

```bash
npx hardhat run scripts/safe-deploy.ts --network polygon
```

This script will:
1. Verify you're on Polygon Mainnet
2. Check sufficient balance
3. Ask for confirmation before deploying
4. Save deployment info to `deployments/`
5. Generate `.env.mainnet` with contract address

**Option B: Standard Deployment**

```bash
npx hardhat run scripts/deploy.ts --network polygon
```

### Step 4: Verify Deployment

```bash
# Verify contract on Polygonscan
npx hardhat verify --network polygon \
  0x... (contract address) \
  0x... (deployer address)

# Or run verification script
npx hardhat run scripts/verify-deployment.ts --network polygon
```

### Step 5: Update Environment Variables

```bash
# Update .env with contract address
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=137

# Update Netlify environment variables:
# 1. Go to Netlify → Site Settings → Build & Deploy → Environment
# 2. Add:
#    VITE_CONTRACT_ADDRESS=0x...
#    VITE_CHAIN_ID=137
# 3. Trigger redeploy
```

### Step 6: Post-Deployment Verification

```bash
# Check contract exists
curl -s "https://polygon-rpc.com/" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x...","latest"],"id":1}' \
  | jq '.result'

# Check Polygonscan
# https://polygonscan.com/address/0x...

# Run E2E tests against mainnet
npm run test:e2e -- --env mainnet
```

### Step 7: Monitor

```bash
# Watch Sentry for errors
# Watch Alchemy for contract calls
# Monitor gas prices on Polygonscan
# Check for unusual transaction patterns
```

---

## Troubleshooting

### Insufficient Balance

**Error:** `Insufficient balance for deployment`

**Solution:**
1. Send more POL to deployer wallet
2. Check gas price (might be higher during congestion)
3. Wait for network congestion to decrease

```bash
# Check current gas prices
curl https://gasstation.polygon.technology/legacy
```

### Network Mismatch

**Error:** `Wrong network! Connected to chainId XXX`

**Solution:**
```bash
# Verify network in hardhat.config.ts
# Make sure you're using --network polygon flag
npx hardhat run scripts/deploy.ts --network polygon  # ← Important!
```

### Private Key Issues

**Error:** `Cannot find private key`

**Solution:**
```bash
# Check .env file exists
ls -la .env

# Verify format (starts with 0x)
echo $PRIVATE_KEY

# Make sure it's 66 characters (0x + 64 hex chars)
```

### Verification Fails

**Error:** `Contract already verified` or verification timeout

**Solution:**
```bash
# Wait a few minutes for Polygonscan to index
# Then try verification again
npx hardhat verify --network polygon 0x... 0x...

# If it says "already verified", that's OK
```

---

## Rollback Plan

If critical issue discovered post-deployment:

### Option 1: Pause Contract (Immediate)

```bash
# Owner calls pause() function
npx hardhat run scripts/pause-contract.ts --network polygon
```

This:
- Stops all new anchors
- Prevents further damage
- Allows investigation time

### Option 2: Deploy New Contract (Medium-term)

1. Fix vulnerability
2. Deploy new contract
3. Update frontend to use new address
4. Notify users of migration

### Option 3: Proxy Pattern (Long-term)

If upgradeable pattern is needed:
- Deploy UUPS or Transparent proxy
- Keep implementation contract upgradeable
- Allows fixes without redeployment

---

## Gas Estimation

### Typical Gas Usage (Polygon)

| Operation | Gas | Cost (at $0.01/gwei) |
|-----------|-----|---------------------|
| Deploy | ~600,000 | $0.006 |
| Anchor | ~78,000 | $0.00078 |
| Batch (3 anchors) | ~180,000 | $0.0018 |
| Pause/Unpause | ~25,000 | $0.00025 |

### Gas Optimization Tips

```bash
# Profile gas usage
npx hardhat test --reporter hardhat-gas-reporter

# Check contract size (max 24KB)
npx hardhat size-contracts
```

---

## Post-Deployment Monitoring

### Sentry Configuration

```typescript
// Set environment
Sentry.init({
  environment: 'production',
  dsn: process.env.VITE_SENTRY_DSN,
});

// Log important events
Sentry.captureMessage('PortfolioAnchor deployed to mainnet', 'info');
```

### Alchemy Webhooks

```javascript
// Monitor contract events
POST https://dashboard.alchemy.com/
{
  "webhook_type": "mined_transaction",
  "addresses": ["0x...CONTRACT_ADDRESS..."],
}
```

### Health Check Script

```bash
# Run daily
npx hardhat run scripts/verify-deployment.ts --network polygon

# Check contract state
curl https://api.polygonscan.com/api \
  ?module=account \
  &action=txlist \
  &address=0x... \
  &startblock=0 \
  &endblock=99999999 \
  &page=1 \
  &offset=10 \
  &sort=desc \
  &apikey=YOUR_KEY
```

---

## Audit Trail

Document all deployment details:

```markdown
# Deployment Record

- **Date:** [date]
- **Network:** Polygon Mainnet (137)
- **Contract Address:** 0x...
- **Deployer:** 0x...
- **Transaction Hash:** 0x...
- **Block Number:** 123456789
- **Gas Used:** 600,000
- **Verified:** ✓ Yes / ○ No
- **Monitoring:** ✓ Active
- **Team Notified:** ✓ Yes
```

---

## Safety Checklist

Before clicking "deploy":

- [ ] .env file is secure (in .gitignore)
- [ ] Private key is not committed to git
- [ ] Deployer wallet has >1 POL
- [ ] Network is Polygon Mainnet (137)
- [ ] Contract compiles without warnings
- [ ] All tests pass
- [ ] Team is notified
- [ ] Monitoring is active
- [ ] Rollback plan documented
- [ ] You have confirmed this is MAINNET deployment

---

**Questions?** Contact the security team.  
**Emergency?** Page the on-call engineer.
