# 🚀 Build & Deployment Guide for React Native Mobile App

**Project Type:** React Native + Expo  
**Available Platforms:** iOS, Android

---

## 📱 Available Build Commands

### Development & Testing

```bash
# Start Metro bundler (development server)
npm start

# Run on Android emulator/device
npm run android

# Run on iOS simulator/device
npm run ios

# Run linter
npm lint

# Run tests
npm test
```

### Production Builds

For production builds, use Expo CLI directly:

```bash
# Build for Android (APK)
eas build --platform android

# Build for iOS (IPA)
eas build --platform ios

# Build for both
eas build --platform all

# Local build without EAS (requires native tools)
npx react-native build-android
npx react-native build-ios
```

---

## ✅ Quick Start for Development

### Step 1: Install Dependencies
```bash
cd macrofinal/mobile
npm install
```

### Step 2: Set Up Environment
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Step 3: Start Development

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

**Manual Metro Bundler:**
```bash
npm start
```

---

## 🏗️ Build Process

### Android Build

```bash
# Using Expo EAS (Recommended)
eas build --platform android

# Or local build (requires Android SDK)
cd android
./gradlew assembleRelease
cd ..
```

**Output Location:**
- `android/app/build/outputs/apk/release/app-release.apk`

### iOS Build

```bash
# Using Expo EAS (Recommended)
eas build --platform ios

# Or local build (requires Xcode)
cd ios
xcodebuild -workspace Macrofolio.xcworkspace -scheme Macrofolio -configuration Release
cd ..
```

**Output Location:**
- `ios/build/Release-iphoneos/Macrofolio.app`

---

## 📋 Pre-Build Checklist

Before building for production:

- [ ] Verify `.env.local` has correct Supabase credentials
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run lint` - no linting errors
- [ ] Verify iOS and Android native code (if modified)
- [ ] Update version in `app.json`
- [ ] Review all auth security fixes
- [ ] Test all authentication flows (email, OAuth, wallet)

---

## 🔧 Configuration Files

### App Configuration
- `app.json` - Expo app configuration
- `app.config.ts` - Advanced Expo config (if exists)
- `eas.json` - EAS build configuration

### TypeScript
- `tsconfig.json` - TypeScript configuration

### Build Tools
- `babel.config.js` - Babel configuration
- `metro.config.js` - Metro bundler configuration

---

## 📦 Distribution

### Google Play Store (Android)
```bash
# Build and upload to Play Store
eas build --platform android --auto-submit

# Or submit manually
eas submit --platform android
```

### Apple App Store (iOS)
```bash
# Build and upload to App Store
eas build --platform ios --auto-submit

# Or submit manually
eas submit --platform ios
```

---

## 🆘 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache and restart
npm start -- --reset-cache
```

### Pod Issues (iOS)
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run ios
```

### Gradle Issues (Android)
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Clear All Caches
```bash
rm -rf node_modules
rm -rf ~/Library/Developer/Xcode/DerivedData/* (iOS)
rm -rf ~/.gradle/caches (Android)
npm install
```

---

## 📚 Environment Variables

Create `.env.local`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_pb_your_key
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_REDIRECT_URL=macrofolio://auth/callback
```

---

## ✨ After Security Fixes

The authentication security hardening is complete! Key changes:

- ✅ Secrets moved to `.env.local`
- ✅ Wallet validation implemented
- ✅ Deep link security enhanced
- ✅ Session management improved
- ✅ Error handling comprehensive
- ✅ Type safety enforced

**Next Step:** Test all auth flows with the new security improvements.

---

## 📖 Related Documentation

- [INDEX.md](INDEX.md) - Full documentation index
- [QUICK_START_SECURITY.md](QUICK_START_SECURITY.md) - Security setup
- [SECURITY_IMPLEMENTATION_SUMMARY.md](SECURITY_IMPLEMENTATION_SUMMARY.md) - Technical details

---

**Project:** Macrofolio Mobile  
**Last Updated:** February 12, 2026  
**Status:** ✅ Ready for development & deployment
