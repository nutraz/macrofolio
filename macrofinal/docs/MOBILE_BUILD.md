# Mobile builds (Macrofolio)

This repo includes a React Native app in `macrofinal/mobile/`.

## RevenueCat key (optional for running)

The app runs without RevenueCat configured, but premium will remain locked.

Set your RevenueCat Public SDK key in:

- `macrofinal/mobile/src/config/revenuecat.ts`

## Android (APK for sharing)

Prereqs:
- Node.js (per `macrofinal/mobile/package.json` engines: Node 20+)
- Android Studio + Android SDK
- Java (JDK 17 is a common baseline for RN Android builds)

Build steps:

```bash
cd macrofinal/mobile
npm install

# Start Metro (keep running)
npm run start
```

In a second terminal:

```bash
cd macrofinal/mobile
npm run android
```

APK output (debug):
- `macrofinal/mobile/android/app/build/outputs/apk/debug/app-debug.apk`

## iOS (TestFlight)

Prereqs:
- macOS + Xcode
- Apple Developer account (for TestFlight)

Build steps:

```bash
cd macrofinal/mobile
npm install
bundle install
bundle exec pod install --project-directory=ios
npm run ios
```

TestFlight (high level):
- Open `macrofinal/mobile/ios/*.xcworkspace` in Xcode
- Archive → Distribute App → App Store Connect → upload
- Create a TestFlight build in App Store Connect and invite testers

