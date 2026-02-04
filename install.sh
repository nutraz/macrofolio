#!/bin/bash

# Macrofolio Setup Script - RevenueCat Shipyard Contest
# This script installs Node.js and sets up the Macrofolio project

set -e

echo "================================================"
echo "  Macrofolio - Installation Script"
echo "  RevenueCat Shipyard Contest Submission"
echo "================================================ Color"
echo ""

# codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect OS
detect_os() {
    echo "Detecting operating system..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🍎 macOS detected"
        OS="macos"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            echo "🐧 Ubuntu/Debian detected"
            OS="ubuntu"
        elif command -v dnf &> /dev/null; then
            echo "🐧 Fedora/RHEL detected"
            OS="fedora"
        elif command -v pacman &> /dev/null; then
            echo "🐧 Arch Linux detected"
            OS="arch"
        else
            echo "🐧 Linux detected (unknown distribution)"
            OS="linux"
        fi
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "🪟 Windows detected"
        OS="windows"
    else
        echo "❓ Unknown operating system"
        OS="unknown"
    fi
    echo ""
}

# Install Node.js
install_node() {
    echo "================================================"
    echo "  Step 1: Installing Node.js"
    echo "================================================"
    echo ""
    
    # Check if Node.js is already installed
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo "✅ Node.js is already installed: $NODE_VERSION"
        
        # Check version
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ "$NODE_MAJOR" -lt 18 ]]; then
            echo -e "${YELLOW}⚠️  Node.js version is below 18. Recommended to upgrade.${NC}"
        fi
        echo ""
        return 0
    fi
    
    echo "Installing Node.js 20 LTS..."
    echo ""
    
    case $OS in
        macos)
            echo "Installing via Homebrew..."
            if ! command -v brew &> /dev/null; then
                echo -e "${YELLOW}Homebrew not found. Installing Homebrew...${NC}"
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew install node@20
            export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
            ;;
            
        ubuntu)
            echo "Installing via NodeSource..."
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
            
        fedora)
            echo "Installing via NodeSource..."
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo dnf install -y nodejs
            ;;
            
        arch)
            echo "Installing via pacman..."
            sudo pacman -S nodejs npm
            ;;
            
        windows)
            echo "Please download Node.js from: https://nodejs.org"
            echo "Choose: Node.js 20 LTS (Recommended)"
            echo ""
            echo "Or use Winget:"
            echo "  winget install OpenJS.Nodejs.LTS"
            echo ""
            echo "After installation, restart your terminal and run this script again."
            exit 0
            ;;
            
        linux)
            echo "Installing via NodeSource..."
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
            
        unknown)
            echo -e "${RED}Cannot detect OS. Please install Node.js manually:${NC}"
            echo "1. Download from: https://nodejs.org"
            echo "2. Choose Node.js 20 LTS"
            echo "3. Restart terminal after installation"
            exit 1
            ;;
    esac
    
    echo ""
    echo "✅ Node.js installed successfully!"
    echo ""
    
    # Verify installation
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    echo "📦 Node.js version: $NODE_VERSION"
    echo "📦 npm version: $NPM_VERSION"
    echo ""
}

# Install Project Dependencies
install_dependencies() {
    echo "================================================"
    echo "  Step 2: Installing Project Dependencies"
    echo "================================================"
    echo ""
    
    cd /home/nutrazz/Desktop/macrofolio/macrofolio/src/macrofolio_assets
    
    echo "Installing npm dependencies..."
    echo "📦 This may take a few minutes..."
    echo ""
    
    npm install
    
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
}

# Verify Installation
verify_installation() {
    echo "================================================"
    echo "  Step 3: Verifying Installation"
    echo "================================================"
    echo ""
    
    # Check Node.js
    if command -v node &> /dev/null; then
        echo "✅ Node.js: $(node --version)"
    else
        echo "❌ Node.js not found"
        return 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        echo "✅ npm: $(npm --version)"
    else
        echo "❌ npm not found"
        return 1
    fi
    
    # Check project dependencies
    if [ -d "node_modules" ]; then
        echo "✅ Project dependencies: Installed"
    else
        echo "❌ Project dependencies: Not installed"
        return 1
    fi
    
    echo ""
}

# Start Development Server
start_dev_server() {
    echo "================================================"
    echo "  Step 4: Starting Development Server"
    echo "================================================"
    echo ""
    
    echo "🚀 Starting Vite development server..."
    echo ""
    echo "📝 Expected URL: http://localhost:5173"
    echo "📝 Press Ctrl+C to stop the server"
    echo ""
    
    npm run dev
}

# Main execution
main() {
    echo ""
    detect_os
    install_node
    install_dependencies
    verify_installation
    
    echo "================================================"
    echo "  🎉 Installation Complete!"
    echo "================================================"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Configure RevenueCat API key in .env file"
    echo "   2. Run 'npm run dev' to start development server"
    echo "   3. Open http://localhost:5173 in your browser"
    echo ""
    echo "📚 Documentation:"
    echo "   - See INSTALL_GUIDE.md for detailed setup"
    echo "   - See README.md for project overview"
    echo ""
    echo "🔗 Useful Links:"
    echo "   - RevenueCat Dashboard: https://app.revenuecat.com"
    echo "   - Live Demo: https://macrofolio.vercel.app"
    echo "   - Demo Video: https://youtu.be/5Fve86iO7BI"
    echo ""
    
    # Ask to start dev server
    read -p "Start development server now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_dev_server
    else
        echo "To start later, run: cd macrofolio/src/macrofolio_assets && npm run dev"
    fi
}

# Run main function
main

