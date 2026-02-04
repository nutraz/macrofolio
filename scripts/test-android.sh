#!/bin/bash
echo "📱 Testing Android APK..."

cd macrofolio/src/macrofolio_assets

# Build debug APK for testing
echo "🔨 Building debug APK..."
npm run build
npx cap sync android
cd android
./gradlew assembleDebug

# Check if ADB is available
if command -v adb &> /dev/null; then
    echo "📲 Installing on connected device..."
    adb install ./app/build/outputs/apk/debug/app-debug.apk
    
    echo "🎬 Launching app..."
    adb shell am start -n com.macrofolio.app/.MainActivity
    
    echo "📊 Checking logs..."
    adb logcat | grep -E "(Macrofolio|RevenueCat|ERROR)"
else
    echo "⚠️ ADB not found. Install Android Platform Tools:"
    echo "  sudo dnf install android-tools"
    echo ""
    echo "📁 APK location: ./app/build/outputs/apk/debug/app-debug.apk"
    echo "📱 Manual installation:"
    echo "  1. Copy APK to Android device"
    echo "  2. Enable 'Install from unknown sources'"
    echo "  3. Install and test"
fi
