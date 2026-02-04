#!/bin/bash
echo "🚀 Setting up Macrofolio Development Environment..."

# Update system
echo "📦 Updating system packages..."
sudo dnf update -y

# Install Node.js 20.x (LTS)
echo "📥 Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Install Yarn (alternative package manager)
echo "📥 Installing Yarn..."
curl -sL https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo
sudo dnf install -y yarn

# Install Android Studio dependencies
echo "🤖 Installing Android build dependencies..."
sudo dnf install -y java-17-openjdk-devel
sudo dnf install -y git wget unzip zip

# Install Capacitor CLI globally
echo "📱 Installing Capacitor CLI..."
sudo npm install -g @capacitor/cli @capacitor/core

# Verify installations
echo "✅ Verifying installations..."
node --version
npm --version
yarn --version
java --version
npx cap --version

echo "🎉 Development environment setup complete!"
