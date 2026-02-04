#!/bin/bash
echo "🤖 Building Android App..."

cd macrofolio/src/macrofolio_assets

# Clean previous builds
rm -rf android/build
rm -rf dist

# Build web assets
echo "🌐 Building web assets..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync

# Build Android debug APK
echo "📱 Building Android APK..."
cd android
./gradlew assembleDebug

echo "✅ Android APK built at: android/app/build/outputs/apk/debug/"
echo "📱 To install on device: adb install app-debug.apk"
