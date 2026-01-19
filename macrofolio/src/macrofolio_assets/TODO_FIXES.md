# TypeScript Fixes TODO

## Issues to Fix

### 1. Create `vite-env.d.ts` for `import.meta.env` support
- [x] Create `src/vite-env.d.ts` with `ImportMetaEnv` interface
- [x] Add Vite client types reference
- [x] Include all VITE_ environment variables

### 2. Fix `web3.ts` - `window.ethereum` and `Signer` issues
- [x] Add runtime check for `window.ethereum` before creating `BrowserProvider`
- [x] Fix `getBalance()` method to use `getAddress()` instead of `signer.address`

### 3. Fix `Verify.tsx` - Supabase response typing
- [x] Update interface to properly type `created_at` field from Supabase
- [x] Add type assertion for anchorData

### 4. Test the fixes
- [ ] Run `npm install` to ensure dependencies are fresh
- [ ] Run `npm run build` to verify TypeScript compilation succeeds

