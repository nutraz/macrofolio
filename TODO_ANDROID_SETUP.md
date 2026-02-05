# RevenueCat Shipyard Contest - Android Mobile App Setup

## 📋 **Complete Action Plan**

### **PHASE 1: Fix RevenueCat SDK (CRITICAL)**
- [ ] Step 1.1: Navigate to project directory
- [ ] Step 1.2: Uninstall incorrect RevenueCat web SDK
- [ ] Step 1.3: Install correct Capacitor SDK (`@revenuecat/purchases-capacitor@12.0.0`)
- [ ] Step 1.4: Update package.json dependencies
- [ ] Step 1.5: Run npm install --legacy-peer-deps

### **PHASE 2: Configure Capacitor for Android**
- [ ] Step 2.1: Install/verify Capacitor CLI is installed
- [ ] Step 2.2: Create capacitor.config.ts if missing
- [ ] Step 2.3: Add Android platform
- [ ] Step 2.4: Run npx cap sync
- [ ] Step 2.5: Verify Android folder structure

### **PHASE 3: Update RevenueCat Integration**
- [ ] Step 3.1: Update revenuecat.ts to use native SDK
- [ ] Step 3.2: Update RevenueCatProvider.tsx
- [ ] Step 3.3: Configure API key in .env
- [ ] Step 3.4: Test RevenueCat initialization

### **PHASE 4: Build & Test on Android**
- [ ] Step 4.1: Build web assets (npm run build)
- [ ] Step 4.2: Sync to native (npx cap sync)
- [ ] Step 4.3: Build debug APK
- [ ] Step 4.4: Test on connected device/emulator
- [ ] Step 4.5: Fix any build errors

### **PHASE 5: Prepare for Google Play Submission**
- [ ] Step 5.1: Configure signing keys
- [ ] Step 5.2: Create release build (AAB format)
- [ ] Step 5.3: Set up Google Play Console account
- [ ] Step 5.4: Upload to Internal Testing track
- [ ] Step 5.5: Get testing link for Devpost

---

## 🚀 **EXECUTION COMMANDS**

### **Step 1: Fix RevenueCat SDK**
```bash
cd macrofolio/src/macrofolio_assets

# Uninstall wrong SDK
npm uninstall @revenuecat/purchases-js

# Install correct Capacitor SDK
npm install @revenuecat/purchases-capacitor@12.0.0 --legacy-peer-deps

# Install/update Capacitor CLI
npm install @capacitor/cli@latest @capacitor/core@latest --legacy-peer-deps

# Install all dependencies
npm install --legacy-peer-deps

# Build the project
npm run build
```

### **Step 2: Configure Capacitor**
```bash
# Create capacitor config if needed
npx cap init macrofolio "Macrofolio" --web-dir dist

# Add Android platform
npx cap add android

# Sync web assets to native
npx cap sync

# Verify Android setup
npx cap doctor
```

### **Step 3: Build & Run on Android**
```bash
# Build web assets
npm run build

# Sync to native
npx cap sync

# Open Android Studio
npx cap open android
```

### **Alternative: Build APK directly**
```bash
# Build debug APK
cd android && ./gradlew assembleDebug

# Install on connected device
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 **Expected File Structure After Changes**

```
macrofolio/src/macrofolio_assets/
├── android/
│   ├── app/
│   │   └── src/
│   │       └── main/
│   │           ├── java/
│   │           │   └── com.macrofolio.app/
│   │           └── res/
│   └── build.gradle
├── capacitor.config.ts       # NEW/CONFIGURED
├── package.json             # UPDATED
├── src/
│   ├── lib/
│   │   └── revenuecat.ts    # UPDATED - Native SDK
│   ├── components/
│   │   └── RevenueCatProvider.tsx  # UPDATED
│   └── hooks/
│       └── useRevenueCat.ts       # UPDATED
└── .env.local               # NEW - API keys
```

---

## 🔑 **Environment Variables Required**

Create `.env.local`:
```
VITE_REVENUECAT_API_KEY=your_public_sdk_key_here
VITE_DEMO_MODE=false
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📊 **Progress Tracking**

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: RevenueCat SDK Fix | ⏳ Pending | Fix wrong SDK |
| Phase 2: Capacitor Config | ⏳ Pending | Configure Android |
| Phase 3: RevenueCat Integration | ⏳ Pending | Native SDK setup |
| Phase 4: Build & Test | ⏳ Pending | Debug APK |
| Phase 5: Play Store | ⏳ Pending | Internal Testing |

---

## 🎯 **Contest Deadline**

- **Deadline**: February 13, 2026
- **Days Remaining**: ~9 days
- **Priority**: HIGH - Focus on getting Android build working

---

## 📞 **Troubleshooting Commands**

```bash
# Check installed packages
npm list @revenuecat
npm list @capacitor

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Check Capacitor configuration
npx cap doctor

# Check Android setup
cd android && ./gradlew --version

# View logs
adb logcat | grep -i "macrofolio"
```

---

## ✅ **Success Criteria**

1. [ ] RevenueCat SDK properly installed
2. [ ] Capacitor configured for Android
3. [ ] App builds successfully
4. [ ] App runs on Android device/emulator
5. [ ] RevenueCat purchase flow works
6. [ ] Signed APK/AAB generated
7. [ ] Google Play Internal Testing link ready

---

**Created**: February 2026  
**Status**: Ready for Execution

