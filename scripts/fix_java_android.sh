#!/bin/bash
echo "🔧 Fixing Java for Android build..."
export ANDROID_HOME="/home/nutrazz/Android/sdk"

# --- BEGIN Java installation and configuration (COMMENTED OUT) ---
# # Install Java 17
# sudo dnf config-manager --set-enabled crb
# sudo dnf install -y java-17-openjdk java-17-openjdk-devel

# # Set Java 17 as default
# # Note: The path might differ slightly based on the exact package version.
# # This script assumes a standard path. A more robust script might find the path dynamically.
# if [ -f /usr/lib/jvm/java-17-openjdk/bin/java ]; then
#     sudo alternatives --set java /usr/lib/jvm/java-17-openjdk/bin/java
#     sudo alternatives --set javac /usr/lib/jvm/java-17-openjdk/bin/javac
# #    export JAVA_HOME="/usr/lib/jvm/java-17-openjdk" # Handled by parent shell
# else
#     JAVA17_PATH=$(ls -d /usr/lib/jvm/jdk-17.0.11+9 2>/dev/null | head -1) # Use the hardcoded path from manual install
#     if [ -d "$JAVA17_PATH" ]; then
#         sudo alternatives --set java "$JAVA17_PATH/bin/java"
#         sudo alternatives --set javac "$JAVA17_PATH/bin/javac"
# #        export JAVA_HOME="$JAVA17_PATH" # Handled by parent shell
#     else
#         echo "❌ Could not find Java 17 installation path."
#         exit 1
#     fi
# fi

# # Set environment (Handled by parent shell)
# # export PATH="$JAVA_HOME/bin:$PATH"

# echo "✅ Java 17 installed and configured"
# echo "JAVA_HOME: $JAVA_HOME"
# java -version
# --- END Java installation and configuration (COMMENTED OUT) ---


# Ensure JAVA_HOME is set for this execution, in case the previous export didn't persist
export JAVA_HOME="/usr/lib/jvm/jdk-17.0.11+9"
export PATH="$JAVA_HOME/bin:$PATH"

echo "✅ Java 17 configuration confirmed for current script execution."
echo "JAVA_HOME: $JAVA_HOME"
java -version

# Navigate to project
# The script is in /scripts, so we go up one level first
cd "$(dirname "$0")/../macrofolio/src/macrofolio_assets"

# Clean and rebuild
echo "🧹 Cleaning project..."
rm -rf android/ node_modules/ package-lock.json dist/

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🏗️ Building web app..."
npm run build

echo "🤖 Setting up Android..."
npx cap add android
npx cap sync android

# Configure gradle
# Use the dynamic JAVA_HOME path
cat > android/gradle.properties << GRADLE
org.gradle.java.home=$JAVA_HOME
android.useAndroidX=true
android.enableJetifier=true
GRADLE

echo "📱 Building APK..."
cd android
chmod +x gradlew
./gradlew clean
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "🎉 SUCCESS! APK built at:"
    echo "   $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ Build failed. Try with more details:"
    echo "   ./gradlew assembleDebug --stacktrace --info"
fi