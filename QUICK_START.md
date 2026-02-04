# Macrofolio - Quick Start Guide
## RevenueCat Shipyard Contest Submission

**Live App:** https://macrofolio.vercel.app  
**Demo Video:** https://youtu.be/5Fve86iO7BI  
**GitHub:** https://github.com/nutrazz/macrofolio

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Use Live Demo (No Setup)
Visit https://macrofolio.vercel.app - Click "Try Demo Mode"

### Option 2: Local Development

#### Step 1: Install Node.js
**Choose one method:**

**macOS:**
```bash
brew install node@20
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
1. Download from https://nodejs.org (Node.js 20 LTS)
2. Run the installer
3. Restart terminal

**Verify Installation:**
```bash
node --version   # Should be v20.x.x
npm --version    # Should be 10.x.x
```

#### Step 2: Install Project Dependencies
```bash
cd macrofolio/src/macrofolio_assets
npm install
```

#### Step 3: Configure Environment
```bash
cp .env.example .env
# Edit .env and add your RevenueCat API key
```

#### Step 4: Start Development Server
```bash
npm run dev
```
Open http://localhost:5173

---

## 📋 Complete Setup

### Prerequisites
- Node.js 18+ (20 LTS recommended)
- npm or yarn
- Git

### RevenueCat Setup (Required for Subscriptions)

1. **Create RevenueCat Account**
   - Visit: https://app.revenuecat.com
   - Sign up for free

2. **Get API Key**
   - Go to Project Settings → API Keys
   - Copy your Public SDK Key (starts with `public_`)

3. **Configure Products**
   - Monthly: `macrofolio_monthly_subscription` ($9.99)
   - Yearly: `macrofolio_yearly_subscription` ($99.99)
   - Lifetime: `macrofolio_lifetime_pass` ($299.99)

4. **Add to .env**
   ```env
   VITE_REVENUECAT_API_KEY=your_public_sdk_key_here
   VITE_DEMO_MODE=false
   ```

---

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run test suite |

---

## 📱 Available Scripts

```bash
# Install RevenueCat SDK (CRITICAL)
npm install @revenuecat/purchases-react-web

# Run tests
npm test

# Build for Vercel
npm run build

# Deploy to Vercel
vercel --prod
```

---

## 🔗 Useful Links

- **Live Demo:** https://macrofolio.vercel.app
- **GitHub:** https://github.com/nutrazz/macrofolio
- **Demo Video:** https://youtu.be/5Fve86iO7BI
- **RevenueCat:** https://app.revenuecat.com
- **Vercel:** https://vercel.com

---

## 📄 File Structure

```
macrofolio/
├── src/
│   ├── macrofolio_assets/     # Main React frontend
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── pages/         # Application pages
│   │   │   └── lib/           # Core utilities
│   │   ├── package.json       # Dependencies
│   │   └── INSTALL_GUIDE.md   # Detailed setup
│   └── ...
├── package.json
└── README.md
```

---

## ✅ Verification Checklist

After installation:
- [ ] Node.js installed (v18+)
- [ ] `npm install` completed
- [ ] `.env` file created
- [ ] `npm run dev` starts without errors
- [ ] Homepage loads at localhost:5173

---

**Questions?** See README.md or INSTALL_GUIDE.md for detailed documentation.

