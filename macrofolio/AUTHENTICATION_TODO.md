# Authentication Implementation Plan

## Phase 1: Internet Identity (ICP) Implementation
- [ ] 1.1 Add ICP dependencies (@dfinity/auth-client, @dfinity/principal)
- [ ] 1.2 Create `useInternetIdentity.ts` hook
- [ ] 1.3 Update types.ts with ICP wallet state interfaces
- [ ] 1.4 Update Splash.tsx with "Connect with Internet Identity" button
- [ ] 1.5 Update Header.tsx to show ICP connection status

## Phase 2: MetaMask Connection Enhancement  
- [ ] 2.1 Verify MetaMask connection flow works properly
- [ ] 2.2 Add wallet selection modal for multiple wallet types
- [ ] 2.3 Enhance connection state handling

## Phase 3: Unified Authentication State
- [ ] 3.1 Update App.tsx to combine Web3 + ICP + Supabase auth
- [ ] 3.2 Create unified connection status UI
- [ ] 3.3 Handle both wallet types in connection flow

## Phase 4: Testing & Validation
- [ ] 4.1 Test ICP authentication flow
- [ ] 4.2 Test MetaMask connection flow
- [ ] 4.3 Verify demo mode still works
- [ ] 4.4 Test network switching

