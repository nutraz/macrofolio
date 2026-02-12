#!/bin/bash

# ============================================
# Macrofolio Android Build Setup Script
# RevenueCat Shipyard Contest
# ============================================

set -e

echo "🚀 Setting up Android build environment for Macrofolio..."

# Resolve repo root and key paths (script may be run from any CWD)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if command -v git >/dev/null 2>&1 && git -C "$SCRIPT_DIR" rev-parse --show-toplevel >/dev/null 2>&1; then
    REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
else
    REPO_ROOT="$(cd -- "$SCRIPT_DIR/../../.." && pwd)"
fi
ASSETS_DIR="$REPO_ROOT/macrofolio/src/macrofolio_assets"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# Step 1: Check Prerequisites
# ============================================
echo ""
echo "📋 Checking prerequisites..."

# Check Java
if command -v java &> /dev/null; then
    echo "✅ Java found: $(java -version 2>&1 | head -n 1)"
else
    echo -e "${YELLOW}⚠️  Java not found. Installing OpenJDK 17...${NC}"
    sudo apt-get update -qq
    sudo apt-get install -y openjdk-17-jdk
fi

# Check JAVA_HOME
if [ -z "$JAVA_HOME" ]; then
    export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
    echo "export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64" >> ~/.bashrc
    echo "✅ Set JAVA_HOME"
fi

# ============================================
# Step 2: Configure RevenueCat
# ============================================
echo ""
echo "🔑 Configuring RevenueCat..."
	read -p "Enter your RevenueCat Public SDK Key (starts with pub_): " RC_KEY

	# Create .env.local
	cat > "$ASSETS_DIR/.env.local" << EOF
VITE_REVENUECAT_API_KEY=$RC_KEY
VITE_DEMO_MODE=false
EOF

echo "✅ Created .env.local with RevenueCat key"

# ============================================
# Step 3: Install Android SDK
# ============================================
echo ""
echo "📦 Setting up Android SDK..."

# Create SDK directory
mkdir -p $HOME/android-sdk/cmdline-tools
cd $HOME/android-sdk/cmdline-tools

# Download Android command line tools
if [ ! -f "commandlinetools-linux-11076708_latest.zip" ]; then
    echo "Downloading Android command line tools..."
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
fi

# Extract if needed
if [ ! -d "latest" ]; then
    unzip -q commandlinetools-linux-11076708_latest.zip
    mv cmdline-tools latest 2>/dev/null || true
fi

# Set environment variables
export ANDROID_SDK_ROOT=$HOME/android-sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools

# Save to bashrc
cat >> ~/.bashrc << EOF

# Android SDK
export ANDROID_SDK_ROOT=\$HOME/android-sdk
export PATH=\$PATH:\$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:\$ANDROID_SDK_ROOT/platform-tools
EOF

echo "✅ Android SDK downloaded"

# ============================================
# Step 4: Accept Licenses and Install SDK
# ============================================
echo ""
echo "📜 Accepting Android licenses..."
yes | $ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --licenses > /dev/null 2>&1 || true

echo "Installing Android platform and build tools..."
$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager "platforms;android-33" "build-tools;34.0.0" "platform-tools" > /dev/null 2>&1

echo "✅ Android SDK packages installed"

# ============================================
# Step 5: Build the Project
# ============================================
echo ""
echo "🔨 Building Macrofolio Android app..."

cd "$ASSETS_DIR"

# Install npm dependencies
echo "Installing npm dependencies..."
npm install --legacy-peer-deps -qq

# Build web assets
echo "Building web assets..."
npm run build -qq

# Sync Capacitor
echo "Syncing Capacitor..."
npx cap sync -qq

# Configure local.properties
echo "sdk.dir=$ANDROID_SDK_ROOT" > android/local.properties

# Build APK
cd android
echo "Building APK..."
./gradlew clean assembleDebug --quiet

# ============================================
# Step 6: Success!
# ============================================
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
    echo ""
    echo -e "${GREEN}✅ BUILD SUCCESSFUL!${NC}"
    echo ""
    echo "📱 APK Location: $APK_PATH"
    echo "📦 APK Size: $(du -h $APK_PATH | cut -f1)"
    echo ""
    echo "To install on connected device:"
    echo "  adb install $APK_PATH"
    echo ""
    echo "Next steps for contest submission:"
    echo "1. Create Google Play Developer Account (https://play.google.com/console)"
    echo "2. Create products in RevenueCat dashboard"
    echo "3. Upload AAB to Google Play Internal Testing:"
    echo "   ./gradlew bundleRelease"
    echo ""
else
    echo -e "${RED}❌ Build failed. Check errors above.${NC}"
    exit 1
fi
