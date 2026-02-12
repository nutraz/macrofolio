# 📋 Build & Deployment Guide - React Native Mobile App

**Project:** Macrofolio Mobile (React Native + Expo)  
**Issue:** There is no `build` script - this is a mobile app, not a web app  

---

## ⚠️ Important: This is NOT a Web Project

This is a **React Native/Expo project**, not a Next.js or Vite web application.

**There is no `npm run build` command.**

---

## 📱 Available Commands

Run these commands from `macrofinal/mobile/`:

### Development Commands
```bash
npm start          # Start Metro bundler (dev server)
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator/device
npm run lint       # Run ESLint
npm test           # Run Jest tests
```

### What These Do
- `npm start` - Starts the Metro Bundler (like webpack dev server)
- `npm run android` - Launches app in Android emulator
- `npm run ios` - Launches app in iOS simulator
- `npm run lint` - Checks code for style issues
- `npm test` - Runs unit tests

---

## 🚀 Production Builds

For production APK/IPA files, you need **Expo EAS Build**:

### First Time Setup
```bash
# Install Expo CLI globally
npm install -g eas-cli

# Log in to Expo
eas login

# Configure your project (creates eas.json)
eas build:configure
```

### Build Commands
```bash
# Build APK for Android
eas build --platform android

# Build IPA for iOS
eas build --platform ios

# Build both
eas build --platform all

# Submit to stores directly
eas submit --platform android
eas submit --platform ios
```

---

## 🔍 Project Structure

This is a **React Native project**, which means:

| What You See | What It Means |
|--------------|--------------|
| `App.tsx` | Main app component |
| `src/` | TypeScript/React source code |
| `android/` | Android native code |
| `ios/` | iOS native code |
| `app.json` | App configuration |
| `metro.config.js` | Metro bundler config |

**NOT like web apps:**
- ❌ No `vite.config.ts`
- ❌ No Next.js config
- ❌ No web build output
- ❌ Builds to APK/IPA, not HTML/CSS

---

## ✅ Security Fixes Are Ready

The authentication security improvements are already implemented:

- ✅ `src/lib/walletAuth.ts` - Wallet validation
- ✅ `src/context/AuthContext.tsx` - Auth security hardening
- ✅ `.env.example` - Configuration template
- ✅ All 13 issues fixed and documented

**No build step needed** - the source code is ready to test!

---

## 🎯 Next Steps

### 1. Set Up Development Environment
```bash
cd macrofinal/mobile

# Create environment file
cp .env.example .env.local

# Edit with your Supabase credentials
nano .env.local  # or your editor
```

### 2. Start Development

**Option A: Using Metro Bundler**
```bash
npm start
# Then press 'a' for Android or 'i' for iOS
```

**Option B: Direct Device Launch**
```bash
npm run android  # For Android
# OR
npm run ios      # For iOS
```

### 3. Test Authentication Flows
- Email OTP
- Google OAuth
- Discord OAuth
- Wallet address login

### 4. Build for Production (When Ready)
```bash
# Android APK
eas build --platform android

# iOS IPA
eas build --platform ios

# Or submit directly to stores
eas submit --platform android
eas submit --platform ios
```

---

## 🆘 Troubleshooting

### If `npm` is not found
```bash
# Install Node.js first
# Visit: https://nodejs.org/

# Or use your package manager
sudo apt install nodejs npm  # Linux
brew install node            # macOS
```

### If Metro doesn't start
```bash
npm start -- --reset-cache
```

### If you see "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Clear all caches (nuclear option)
```bash
rm -rf node_modules
rm -rf ~/Library/Developer/Xcode/DerivedData/* (iOS only)
rm -rf ~/.gradle/caches (Android only)
npm install
npm start -- --reset-cache
```

---

## 📦 Installation Requirements

### To Run/Develop Locally

**Minimum Required:**
- Node.js 20+ (from `.engines` in package.json)
- npm or yarn
- Android Studio + Android SDK (for Android) OR Xcode (for iOS)

**Recommended:**
- Android Emulator or physical Android device
- iOS Simulator or physical iPhone
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### To Build Production Apks/IPAs

**Option 1: Local Build (Complex Setup)**
- Requires full Android SDK + NDK + Gradle
- Requires Xcode + CocoaPods (iOS)
- Time-consuming to set up

**Option 2: Expo EAS Build (Recommended)**
- Expo handles the compilation
- Cloud-based builds
- Faster and more reliable
- Requires Expo account (free)

---

## 📚 Documentation

See the complete docs in this directory:

- **[INDEX.md](INDEX.md)** - Complete navigation guide
- **[QUICK_START_SECURITY.md](QUICK_START_SECURITY.md)** - Security setup (5 min)
- **[SECURITY_IMPLEMENTATION_SUMMARY.md](SECURITY_IMPLEMENTATION_SUMMARY.md)** - Technical details (20 min)
- **[TODO_AUTH_SECURITY.md](TODO_AUTH_SECURITY.md)** - Issue-by-issue breakdown (45 min)

---

## 🎓 Key Differences from Web Projects

| Aspect | Web (Vite/Next.js) | Mobile (React Native) |
|--------|------------------|----------------------|
| Build Tool | Vite / Next.js | Metro Bundler |
| Build Output | HTML + JS + CSS | APK (Android) / IPA (iOS) |
| Dev Command | `npm run dev` | `npm start` |
| Deploy Target | Web server | App store |
| Testing | Browser | Device/Emulator |
| TypeScript | ✅ Yes | ✅ Yes |

---

## ✨ Security Status

All authentication security improvements are **complete and ready to test**:

✅ Secrets moved to `.env.local`  
✅ Wallet validation implemented  
✅ Address validation added  
✅ Deep link security enhanced  
✅ Session management improved  
✅ Error handling comprehensive  
✅ Type safety enforced  

**You can immediately start testing the app with these security fixes!**

---

## 📞 Quick Reference

| Goal | Command |
|------|---------|
| Start development | `npm start` |
| Test on Android | `npm run android` |
| Test on iOS | `npm run ios` |
| Check code quality | `npm run lint` |
| Run tests | `npm test` |
| Production build | `eas build --platform android` |
| Submit to store | `eas submit --platform android` |

---

**Status:** ✅ Security implementation complete and ready to use  
**Next Step:** Set up `.env.local` and test the app!

---

*Last Updated: February 12, 2026*
