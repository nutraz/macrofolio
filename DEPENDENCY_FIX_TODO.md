# Dependency Conflict Fix - TODO

## Summary
The root cause of the dependency conflict is that `macrofolio/src/macrofolio_assets/package.json` contains BOTH frontend dependencies (React, Vite) AND backend dependencies (Hardhat, ethers, typechain), causing npm to fail when trying to resolve peer dependencies.

## Tasks

### Phase 1: Fix Build Script
- [x] 1.1 Fix build-frontend.sh - remove stray `EOF` at end of file

### Phase 2: Clean Frontend Dependencies  
- [x] 2.1 Remove backend Hardhat dependencies from macrofolio/src/macrofolio_assets/package.json
- [x] 2.2 Keep only frontend-specific dependencies in macrofolio_assets

### Phase 3: Update Vercel Configuration
- [x] 3.1 vercel.json already configured correctly (uses build-frontend.sh)

### Phase 4: Test & Deploy
- [x] 4.1 Files prepared - verify manually by running build
- [ ] 4.2 Push changes to GitHub
- [ ] 4.3 Verify Vercel deployment

## Changes Made

### 1. Fixed build-frontend.sh
- Removed stray `EOF` that was breaking the script

### 2. Cleaned macrofolio_assets/package.json
REMOVED backend dependencies causing conflicts:
- @nomicfoundation/hardhat-verify
- @openzeppelin/contracts
- @typechain/ethers-v6
- @typechain/hardhat
- chai
- dotenv
- hardhat
- typechain

KEPT frontend dependencies:
- React, Vite, TypeScript, Jest
- Capacitor, Supabase, Recharts
- DFinity, RevenueCat integrations
- ethers (for blockchain interactions in frontend)

### 3. Updated index.html
- Copied the landing page content from root index.html to Vite app
- Landing page will now be served at root URL on Vercel

### 4. Simplified vite.config.ts
- Removed React plugin (not needed for static landing page)
- Removed manual chunk splitting
- Optimized for static HTML output

## Dependencies to Remove from macrofolio_assets/package.json

Backend dependencies causing conflicts:
- @nomicfoundation/hardhat-verify
- @openzeppelin/contracts
- @typechain/ethers-v6
- @typechain/hardhat
- chai
- dotenv
- ethers (keep if needed for frontend)
- hardhat
- typechain

Frontend-only dependencies to KEEP:
- @capacitor/android
- @capacitor/cli
- @capacitor/core
- @dfinity/auth-client
- @dfinity/principal
- @revenuecat/purchases-capacitor
- @supabase/supabase-js
- dompurify
- glob-parent
- idb
- lucide-react
- react
- react-dom
- react-router-dom
- readdirp
- recharts
- zod
- @testing-library/jest-dom
- @testing-library/react
- @types/dompurify
- @types/jest
- @types/react
- @types/react-dom
- @vitejs/plugin-react
- autoprefixer
- jest
- jest-environment-jsdom
- postcss
- tailwindcss
- ts-jest
- typescript
- vite

## Manual Commands to Run

```bash
cd ~/Projects/Macrofolio-clean

# 1. Build locally to verify the fix works
cd macrofolio/src/macrofolio_assets
npm install --legacy-peer-deps
npm run build

# 2. If build succeeds, commit and push
cd ~/Projects/Macrofolio-clean
git add -A
git commit -m "Fix: Remove backend dependencies from frontend package.json to resolve npm conflict"
git push origin main

# 3. Vercel will auto-deploy from the build-frontend.sh script
```

