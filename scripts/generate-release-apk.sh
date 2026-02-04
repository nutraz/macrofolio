#!/bin/bash
echo "📱 Generating Release APK for Play Store..."

cd macrofolio/src/macrofolio_assets

# Clean and build
echo "🧹 Cleaning previous builds..."
rm -rf android/build
rm -rf dist
rm -rf android/app/build

# Build web assets
echo "🌐 Building web assets..."
npm run build

# Add and Sync with Capacitor
echo "🔄 Adding and Syncing with Capacitor..."
npx cap add android
npx cap sync android

# Generate keystore (if doesn't exist)
if [ ! -f "./android/app/macrofolio.keystore" ]; then
    echo "🔐 Generating keystore..."
    keytool -genkey -v -keystore ./android/app/macrofolio.keystore \
        -alias macrofolio -keyalg RSA -keysize 2048 -validity 10000 \
        -dname "CN=Macrofolio, OU=Development, O=Macrofolio, L=SanFrancisco, S=California, C=US" \
        -storepass "macrofolio123" -keypass "macrofolio123"
fi

# Build release APK
echo "🏗️ Building release APK..."
cd android
./gradlew assembleRelease

# Check if build succeeded
if [ -f "./app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
    echo "✅ APK generated at: app/build/outputs/apk/release/app-release-unsigned.apk"
    echo ""
    echo "📋 Next steps for Play Store:"
    echo "1. Go to https://play.google.com/console"
    echo "2. Create new app 'Macrofolio'"
    echo "3. Go to Release → Testing → Internal testing"
    echo "4. Create new release and upload APK"
    echo "5. Add testers (judges@revenuecat.com for contest)"
else
    echo "❌ APK generation failed. Check errors above."
fi
