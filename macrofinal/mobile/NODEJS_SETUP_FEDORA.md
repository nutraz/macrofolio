# 🔧 Node.js Setup Guide for Fedora

**System:** Fedora Linux  
**Issue:** Node.js/npm is not installed  
**Solution:** Install Node.js using dnf (Fedora package manager)

---

## ✅ Quick Fix (3 Steps)

### Step 1: Install Node.js
```bash
sudo dnf install nodejs npm
```

### Step 2: Verify Installation
```bash
node --version    # Should show v20.x.x or higher
npm --version     # Should show v10.x.x or higher
```

### Step 3: Install Project Dependencies
```bash
cd ~/Projects/macrofolio/macrofinal/mobile
npm install
```

**Done!** You can now run `npm run android` or `npm start`

---

## 📋 Detailed Installation Guide

### Option 1: Using Fedora Package Manager (Easiest)

```bash
# Update package manager
sudo dnf update

# Install Node.js and npm
sudo dnf install nodejs npm

# Verify
node --version
npm --version
```

**Pros:** Easy, managed by system package manager  
**Cons:** May not be latest version

---

### Option 2: Using NVM (Node Version Manager) - Recommended

**Step 1: Install NVM**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
exec bash
```

**Step 2: Install Node.js**
```bash
# List available versions
nvm list-remote

# Install LTS version (recommended)
nvm install --lts

# Or install specific version
nvm install 20
```

**Step 3: Verify**
```bash
node --version
npm --version
```

**Pros:** Easy version switching, latest versions  
**Cons:** Slightly more setup

---

### Option 3: Using Snap

```bash
sudo snap install node --classic
```

---

## 🚀 Next Steps After Installation

### 1. Install Project Dependencies
```bash
cd ~/Projects/macrofolio/macrofinal/mobile
npm install
```

This will take 2-5 minutes.

### 2. Create Environment File
```bash
cp .env.example .env.local

# Edit with your Supabase credentials
nano .env.local
```

### 3. Start Development

**Option A: Metro Bundler**
```bash
npm start
# Then press 'a' for Android or 'i' for iOS
```

**Option B: Android Emulator**
```bash
npm run android
# Requires Android Studio + emulator setup
```

---

## ✅ Verification Checklist

After installation, verify everything works:

```bash
# Check Node.js
node --version        # Should show v20.x.x+
npm --version         # Should show v10.x.x+

# Check npm can find packages
npm search react-native --long | head -5

# Check project setup
cd ~/Projects/macrofolio/macrofinal/mobile
npm list react react-native

# Check TypeScript
npx tsc --version     # Should show v5.x.x+

# Check Expo CLI
npx expo --version    # Should show 52.x.x+
```

---

## 🆘 Troubleshooting

### "command not found: node"
```bash
# Check PATH
echo $PATH

# Or reinstall using NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### "npm ERR! code EACCES"
```bash
# Fix npm permissions (don't use sudo)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### "npm install" is slow
```bash
# Use npm cache clean
npm cache clean --force

# Or use yarn instead
sudo dnf install yarn
cd ~/Projects/macrofolio/macrofinal/mobile
yarn install
```

### "npm install" fails with network error
```bash
# Try again with retries
npm install --legacy-peer-deps --verbose

# Or set npm registry
npm config set registry https://registry.npmjs.org/
```

---

## 📦 Minimum Requirements Met?

Check your `package.json` requires:

```json
"engines": {
  "node": ">=20"
}
```

**You need:** Node.js 20.0.0 or higher

**Verify:**
```bash
node --version
# Example output: v20.11.0 ✅
```

---

## 🎯 After Installation Complete

Once `npm install` finishes:

```bash
# Verify dependencies installed
npm list | head -20

# Check for any issues
npm audit
npm outdated

# Ready to run!
npm start
```

---

## 📚 Resources

- **Node.js Official:** https://nodejs.org
- **NVM GitHub:** https://github.com/nvm-sh/nvm
- **npm Docs:** https://docs.npmjs.com
- **Fedora Docs:** https://docs.fedoraproject.org

---

## 🎓 What Gets Installed?

When you run `npm install`, these get downloaded:

```
node_modules/                    (1000+ dependencies)
├── react/                       # React library
├── react-native/                # React Native framework
├── expo/                         # Expo SDK
├── @supabase/supabase-js/       # Supabase client
├── typescript/                   # TypeScript compiler
├── jest/                         # Test framework
├── eslint/                       # Code linter
└── ... (100+ more)
```

**Total Size:** ~500MB-1GB (depends on your internet)

---

## ⏱️ Expected Timeline

| Step | Time |
|------|------|
| Node.js install | 2-3 min |
| `npm install` | 3-5 min |
| First app start | 1-2 min |
| **Total** | **6-10 min** |

---

## ✨ Quick Command Reference

```bash
# Install Node
sudo dnf install nodejs npm

# Install project deps
npm install

# Start app
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Check code
npm run lint

# Run tests
npm test
```

---

**Status:** Ready to install  
**Next:** Run `sudo dnf install nodejs npm`

---

*Last Updated: February 12, 2026*
