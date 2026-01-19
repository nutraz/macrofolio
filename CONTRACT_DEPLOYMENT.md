# Smart Contract Deployment Guide

## Overview

The `PortfolioAnchor.sol` contract is a simple proof-of-anchor contract that stores hash proofs of portfolio actions on the blockchain. It does NOT hold funds.

## Prerequisites

1. **MetaMask** with some testnet MATIC
2. **Polygon Amoy Faucet**: https://faucet.polygon.technology/
3. **Node.js** installed

## Option 1: Deploy via Remix IDE (Easiest)

1. Go to https://remix.ethereum.org
2. Create a new file `PortfolioAnchor.sol` and paste the contract code
3. Compile the contract (Solidity 0.8.19)
4. Go to **Deploy** tab
5. Select **Injected Provider - MetaMask**
6. Make sure MetaMask is connected to Polygon Amoy (Chain ID: 80002)
7. Click **Deploy**
8. Confirm the transaction in MetaMask
9. Save the deployed contract address

## Option 2: Deploy via Hardhat

### 1. Install Hardhat

```bash
cd macrofolio
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

### 2. Create Hardhat Config

Create `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

const POLYGON_AMOY_PRIVATE_KEY = process.env.POLYGON_AMOY_PRIVATE_KEY || "";
const POLYGON_AMOY_RPC = "https://rpc-amoy.polygon.technology";

module.exports = {
  solidity: "0.8.19",
  networks: {
    polygonAmoy: {
      url: POLYGON_AMOY_RPC,
      accounts: [POLYGON_AMOY_PRIVATE_KEY]
    }
  }
};
```

### 3. Create Deploy Script

Create `scripts/deploy.js`:

```javascript
async function main() {
  const PortfolioAnchor = await ethers.getContractFactory("PortfolioAnchor");
  const contract = await PortfolioAnchor.deploy();
  
  console.log("Contract deployed to:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 4. Deploy

```bash
# Set private key (use a test account, never real funds!)
export POLYGON_AMOY_PRIVATE_KEY="0x..."

# Deploy
npx hardhat run scripts/deploy.js --network polygonAmoy
```

### 5. Save Contract Address

Copy the deployed address and add it to your `.env`:

```env
VITE_CONTRACT_ADDRESS=0x1234...
```

## Verify Contract on Polygonscan (Optional)

1. Go to https://amoy.polygonscan.com/
2. Search for your contract address
3. Click "Verify and Publish"
4. Fill in the details:
   - Compiler: `v0.8.19`
   - Optimization: Yes
   - Paste the contract source code

## Add Contract to MetaMask (Optional)

To view the contract in MetaMask:

1. Open MetaMask
2. Click "Import tokens"
3. Switch to "Custom Token"
4. Paste the contract address
5. Token symbol: `ANCHOR` (or leave blank)
6. Token decimal: `0`

## Test the Contract

You can test the contract using the web3 service in the app:

1. Connect MetaMask in Web3 mode
2. Try anchoring a portfolio action
3. Check the transaction in Polygonscan

## Gas Estimation

- **Deploy**: ~0.01 MATIC (~$0.01)
- **Anchor**: ~0.0005 MATIC (~$0.0005)

## Troubleshooting

### MetaMask Not Connecting
- Make sure you're on Polygon Amoy (Chain ID: 80002)
- Refresh the page and try again

### Insufficient Funds
- Get testnet MATIC from https://faucet.polygon.technology/
- You need at least 0.01 MATIC for deployment

### Contract Not Verified
- Make sure you compiled with the exact same version
- Check optimization settings

