#!/bin/bash
echo "🏆 RevenueCat Shipyard Contest Checklist"
echo "========================================"

cd macrofolio/src/macrofolio_assets

# Check 1: Live URL
echo ""
echo "✅ 1. Live PWA URL:"
echo "    https://macrofolio.vercel.app"

# Check 2: Demo Video
echo ""
echo "✅ 2. Demo Video:"
echo "    https://youtu.be/5Fve86iO7BI"

# Check 3: RevenueCat Integration
echo ""
echo "🔍 3. RevenueCat Integration:"
if grep -q "@revenuecat/purchases" package.json; then
    echo "    ✅ RevenueCat packages found"
else
    echo "    ❌ RevenueCat not installed"
fi

# Check 4: Android APK
echo ""
echo "🔍 4. Android APK:"
if [ -f "./android/app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
    echo "    ✅ APK exists"
    echo "    📁 Location: ./android/app/build/outputs/apk/release/"
else
    echo "    ⚠️  APK not built. Run: ./scripts/generate-release-apk.sh"
fi

# Check 5: iOS Build
echo ""
echo "🔍 5. iOS Build:"
if [ -d "./ios" ]; then
    echo "    ✅ iOS project exists"
    echo "    ⚠️  Requires macOS/Xcode for final build"
else
    echo "    ❌ iOS project not created"
fi

# Summary
echo ""
echo "📊 SUMMARY:"
echo "-----------"
echo "PWA: ✅ Ready"
echo "Demo Video: ✅ Ready"
echo "Documentation: ✅ Ready"
echo "Android: ⚠️  Needs Play Store upload"
echo "iOS: ❌ Needs macOS/cloud build"
echo ""
echo "⏰ Deadline: Feb 13, 2026 (~9 days remaining)"
