#!/bin/bash

# ============================================
# Macrofolio Android Build - FIXED VERSION
# ============================================

echo "🔧 Finding correct Java installation..."

# Resolve repo root and key paths (script may be run from any CWD)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if command -v git >/dev/null 2>&1 && git -C "$SCRIPT_DIR" rev-parse --show-toplevel >/dev/null 2>&1; then
    REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
else
    REPO_ROOT="$(cd -- "$SCRIPT_DIR/../../.." && pwd)"
fi
ASSETS_DIR="$REPO_ROOT/macrofolio/src/macrofolio_assets"

# Find Java executable and get real path
JAVA_PATH=$(which java 2>/dev/null)
if [ -z "$JAVA_PATH" ]; then
    echo "❌ Java not found. Please run: dnf install -y java-17-openjdk-devel"
    exit 1
fi

# Get actual Java installation directory
JAVA_REAL_PATH=$(readlink -f "$JAVA_PATH")
JAVA_DIR=$(dirname "$JAVA_PATH")
JAVA_HOME_ACTUAL=$(dirname "$JAVA_DIR")

echo "✅ Java found at: $JAVA_PATH"
echo "✅ Real path: $JAVA_REAL_PATH"
echo "✅ JAVA_HOME should be: $JAVA_HOME_ACTUAL"

# Export correct JAVA_HOME
export JAVA_HOME="$JAVA_HOME_ACTUAL"
echo "export JAVA_HOME=$JAVA_HOME" >> ~/.bashrc

# Set Android SDK
export ANDROID_SDK_ROOT="$HOME/android-sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"
echo "✅ ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"

# Verify Java
echo ""
echo "🔍 Verifying Java..."
"$JAVA_HOME/bin/java" -version

echo ""
echo "📜 Accepting Android licenses..."
yes | "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" --licenses > /dev/null 2>&1 || true

echo "📦 Installing Android SDK packages..."
"$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager" "platforms;android-33" "build-tools;34.0.0" "platform-tools" 2>&1 | tail -5

echo "✅ SDK packages installed"

echo ""
echo "🔨 Building Macrofolio Android app..."
cd "$ASSETS_DIR"

# Create local.properties
echo "sdk.dir=$ANDROID_SDK_ROOT" > android/local.properties
echo "✅ Created local.properties"

# Build
cd android
echo "📦 Running gradlew assembleDebug..."
./gradlew clean assembleDebug 2>&1 | tail -20

# Check result
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo ""
    echo "🎉 SUCCESS! APK built successfully!"
    echo "📱 Location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "To install on connected Android device:"
    echo "   adb install app/build/outputs/apk/debug/app-debug.apk"
else
    echo ""
    echo "❌ Build failed. Check errors above."
fi
