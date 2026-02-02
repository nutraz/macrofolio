# Fix @dfinity/agent Import Error - Plan

## Information Gathered

1. **Current Dependencies in package.json:**
   - `@dfinity/auth-client: ^3.4.3` ✓
   - `@dfinity/principal: ^3.4.3` ✓
   - **Missing:** `@dfinity/agent` ✗ (peer dependency required by auth-client and principal)

2. **Files Affected:**
   - `macrofolio/src/macrofolio_assets/package.json` - Missing @dfinity/agent
   - `macrofolio/src/macrofolio_assets/vite.config.ts` - Needs DFINITY packages externalized
   - `macrofolio/src/macrofolio_assets/src/hooks/useInternetIdentity.ts` - Uses @dfinity packages
   - `macrofolio/src/macrofolio_assets/src/App.tsx` - Imports useInternetIdentity hook

3. **Root Cause:**
   - `@dfinity/auth-client` and `@dfinity/principal` require `@dfinity/agent` as a peer dependency
   - The code uses `AuthClient`, `Principal`, and `HttpAgent` from DFINITY packages
   - Vite needs to externalize these packages for proper bundling

## Plan

### Step 1: Install Missing DFINITY Packages
```bash
cd /home/nutrazz/Desktop/macrofolio/macrofolio/src/macrofolio_assets
npm install @dfinity/agent @dfinity/principal @dfinity/candid
```

### Step 2: Update vite.config.ts
Add DFINITY packages to rollupOptions.external:
```typescript
build: {
  rollupOptions: {
    external: [
      '@dfinity/agent',
      '@dfinity/auth-client',
      '@dfinity/principal',
      '@dfinity/candid',
      '@dfinity/identity'
    ],
    // ... rest of config
  }
}
```

### Step 3: Test the Build
```bash
npm run build
```

## Dependent Files to be Edited
1. `macrofolio/src/macrofolio_assets/package.json` - Add @dfinity/agent dependency
2. `macrofolio/src/macrofolio_assets/vite.config.ts` - Externalize DFINITY packages

## Followup Steps
1. Install the packages
2. Run build to verify fix
3. Test the application works correctly

---
**Note:** This plan assumes ICP functionality is needed. If not, consider removing the useInternetIdentity hook entirely for a cleaner deployment to Vercel.

