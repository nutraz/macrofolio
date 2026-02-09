#!/bin/bash
echo "☁️  Preparing for iOS cloud build..."

cd macrofolio/src/macrofolio_assets

# Create iOS build files that can be uploaded to cloud service
cat > ios-build-package.json << 'EOF'
{
  "name": "macrofolio-ios-build",
  "version": "1.0.0",
  "scripts": {
    "prepare-ios": "npm run build && npx cap sync ios",
    "package-ios": "tar -czf ios-build-package.tar.gz ios/ capacitor.config.ts"
  }
}
EOF

# Build web assets
npm run build

# Sync iOS (will create ios/ directory)
npx cap add ios
npx cap sync ios

# Package for cloud transfer
tar -czf ios-build-package.tar.gz ios/ capacitor.config.ts

echo "✅ iOS build package created: ios-build-package.tar.gz"
echo ""
echo "📦 Upload this to cloud Mac service:"
echo "1. Sign up for MacStadium or MacInCloud ($20-50/day)"
echo "2. Upload this package"
echo "3. Run: tar -xzf ios-build-package.tar.gz"
echo "4. Open Xcode: open ios/App/App.xcworkspace"
echo "5. Archive and submit to TestFlight"
