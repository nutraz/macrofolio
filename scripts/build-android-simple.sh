#!/bin/bash

# ============================================
# Macrofolio Android Build - Simple Setup Script
# Run this in a FRESH terminal
# ============================================

echo "🔧 Setting up environment..."

# Resolve repo root and key paths (script may be run from any CWD)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if command -v git >/dev/null 2>&1 && git -C "$SCRIPT_DIR" rev-parse --show-toplevel >/dev/null 2>&1; then
    REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
else
    REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
fi
ASSETS_DIR="$REPO_ROOT/macrofolio/src/macrofolio_assets"

# Find Java
if command -v java &> /dev/null; then
    export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
    echo "✅ Found Java: $JAVA_HOME"
else
    echo "❌ Java not found. Please install OpenJDK 17:"
    echo "   dnf install -y java-17-openjdk-devel"
    exit 1
fi

# Set Android SDK
export ANDROID_SDK_ROOT=$HOME/android-sdk
export PATH=$JAVA_HOME/bin:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH

echo "✅ JAVA_HOME=$JAVA_HOME"
echo "✅ ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"

# Accept licenses
echo "📜 Accepting Android licenses..."
yes | $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --licenses > /dev/null 2>&1 || true

# Install SDK packages
echo "📦 Installing Android SDK packages..."
$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager "platforms;android-33" "build-tools;34.0.0" "platform-tools" > /dev/null 2>&1

echo "✅ SDK packages installed"

# Build the project
echo "🔨 Building Macrofolio Android app..."
cd "$ASSETS_DIR"

# Create local.properties
echo "sdk.dir=$ANDROID_SDK_ROOT" > android/local.properties

# Build
cd android
./gradlew clean assembleDebug

# Check result
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo ""
    echo "🎉 SUCCESS! APK built at:"
    echo "   android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "To install on a connected Android device:"
    echo "   adb install app/build/outputs/apk/debug/app-debug.apk"
else
    echo ""
    echo "❌ Build failed. Check errors above."
fi
