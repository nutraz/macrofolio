#!/bin/bash
echo "🔧 Fixing package version issues..."

cd macrofolio/src/macrofolio_assets

# Backup package.json
cp package.json package.json.backup

# Fix RevenueCat capacitor package version (6.5.0 doesn't exist)
# Latest version is 6.4.0 as of Feb 2026
sed -i 's/" @revenuecat\/purchases-capacitor": "\^6.5.0"/" @revenuecat\/purchases-capacitor": "\^6.4.0"/g' package.json

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Alternative using yarn if npm fails
# yarn install

echo "✅ Package issues fixed!"
