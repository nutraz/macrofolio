#!/bin/bash
# ============================================
# Macrofolio Android Build - Production Script
# Fixed for Gradle 9.0 compatibility
# ============================================

set -e

echo "🔧 Starting Macrofolio Android Build..."

# Resolve repo root and key paths (script may be run from any CWD)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if command -v git >/dev/null 2>&1 && git -C "$SCRIPT_DIR" rev-parse --show-toplevel >/dev/null 2>&1; then
    REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
else
    REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
fi
ASSETS_DIR="$REPO_ROOT/macrofolio/src/macrofolio_assets"

# ============================================
# Step 1: Environment Setup
# ============================================
echo "📍 Setting up environment..."

# Find Java 17
if command -v java &> /dev/null; then
    JAVA_PATH=$(which java)
    JAVA_HOME_ACTUAL=$(dirname $(dirname $(readlink -f "$JAVA_PATH" 2>/dev/null || echo "$JAVA_PATH")))
    export JAVA_HOME="${JAVA_HOME_ACTUAL:-/usr/lib/jvm/java-17-openjdk-amd64}"
else
    echo "❌ Java not found. Please install OpenJDK 17 first."
    exit 1
fi

# Set Android SDK
if [ -z "$ANDROID_SDK_ROOT" ]; then
    export ANDROID_SDK_ROOT="$HOME/android-sdk"
fi

export PATH="$JAVA_HOME/bin:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"

echo "✅ JAVA_HOME=$JAVA_HOME"
echo "✅ ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"

# ============================================
# Step 2: Build Web Assets
# ============================================
echo "🌐 Building web assets..."
cd "$ASSETS_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Build web
npm run build

# ============================================
# Step 3: Sync Capacitor
# ============================================
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# ============================================
# Step 4: Configure Android
# ============================================
echo "📱 Configuring Android..."

# Create local.properties
echo "sdk.dir=$ANDROID_SDK_ROOT" > android/local.properties

# ============================================
# Step 5: Build APK
# ============================================
echo "🏗️ Building APK..."
cd android

# Clean and build
./gradlew clean assembleDebug

# ============================================
# Step 6: Verify Output
# ============================================
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
    echo ""
    echo "🎉 SUCCESS! APK built successfully!"
    echo ""
    echo "📱 APK Location: $APK_PATH"
    echo "📦 APK Size: $(du -h $APK_PATH | cut -f1)"
    echo ""
    echo "To install on connected device:"
    echo "  adb install $APK_PATH"
else
    echo ""
    echo "❌ Build failed. Check errors above."
    exit 1
fi
