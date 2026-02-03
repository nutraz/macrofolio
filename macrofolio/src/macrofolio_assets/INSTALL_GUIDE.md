# Macrofolio Installation Guide
## RevenueCat Shipyard Contest - Quick Start

**Priority:** CRITICAL  
**Current Score:** 7.8/10 | **Target Score:** 8.5-9.0/10

---

## 🚨 Critical: Complete These First

### Step 1: Install RevenueCat SDK (REQUIRED)

```bash
cd macrofolio/src/macrofolio_assets
npm install @revenuecat/purchases-react-web
```

**This is the #1 fix needed per the audit.**

---

### Step 2: Get RevenueCat API Key

1. Go to https://app.revenuecat.com
2. Create a free account
3. Create a new project (or select existing)
4. Go to **Project Settings** → **API Keys**
5. Copy your **Public SDK Key** (starts with `public_`)

---

### Step 3: Configure Environment

```bash
# Create .env from example
cp .env.example .env

# Edit .env and add your API key
nano .env
```

Your `.env` should look like:
```env
VITE_REVENUECAT_API_KEY=your_public_sdk_key_here
VITE_DEMO_MODE=false
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

### Step 4: Run the Application

```bash
# Install all dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

---

## 📋 Complete Setup Steps

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

### Installation

```bash
# 1. Navigate to project
cd macrofolio/src/macrofolio_assets

# 2. Install dependencies
npm install

# 3. Install RevenueCat SDK (CRITICAL)
npm install @revenuecat/purchases-react-web

# 4. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 5. Start development server
npm run dev
```

---

## 🔧 RevenueCat Setup

### 1. Create RevenueCat Account
- Visit: https://app.revenuecat.com
- Sign up for free tier

### 2. Configure Products
In RevenueCat Dashboard:

**Monthly Subscription:**
- Product ID: `macrofolio_monthly_subscription`
- Price: $9.99/month
- Platform: Apple/Google/Web

**Annual Subscription:**
- Product ID: `macrofolio_yearly_subscription`
- Price: $99.99/year
- Platform: Apple/Google/Web

**Lifetime Pass:**
- Product ID: `macrofolio_lifetime_pass`
- Price: $299.99 (one-time)
- Platform: Apple/Google/Web

### 3. Test in Sandbox
- Enable sandbox mode in RevenueCat
- Use test Apple/Google accounts
- Verify purchase flow works

---

## 🎬 Demo Video Recording

Follow `DEMO_VIDEO_SCRIPT.md` for the complete outline.

**Quick Recording Steps:**

1. **Prepare:**
   - Set `VITE_DEMO_MODE=true` for clean demo
   - Clear any test data
   - Open browser to localhost

2. **Record (Loom/OBS):**
   - Intro: 15 seconds
   - Dashboard: 30 seconds
   - Premium: 20 seconds
   - Total: ~2-3 minutes

3. **Upload:**
   - YouTube (unlisted)
   - Vimeo (password protected)

4. **Add to README:**
   ```markdown
   ## Demo Video
   [Watch on YouTube](https://youtube.com/watch?v=your-video-id)
   ```

---

## 📱 Mobile App (Optional)

### Option A: Capacitor (Recommended - 1 week)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize
npx cap init

# Add platforms
npx cap add ios
npx cap add android

# Build web app
npm run build

# Sync to native projects
npx cap sync
```

### Option B: React Native (2-3 weeks)

Requires rebuilding UI components. See `DFINITY_FIX_PLAN.md` for details.

---

## 🏗️ Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables (Vercel Dashboard):**
- `VITE_REVENUECAT_API_KEY` = your production API key
- `VITE_DEMO_MODE` = false

### Netlify

```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

---

## ✅ Verification Checklist

### After Installation
- [ ] `npm install` completed without errors
- [ ] RevenueCat SDK in `package.json`
- [ ] `.env` file created with API key
- [ ] `npm run dev` starts without errors

### After Configuration
- [ ] Homepage loads correctly
- [ ] Dashboard shows portfolio data
- [ ] Premium page shows subscription options
- [ ] No console errors in browser

### Before Submission
- [ ] Demo video recorded and uploaded
- [ ] Production deployment verified
- [ ] All features working in production
- [ ] README updated with links

---

## 🐛 Troubleshooting

### "RevenueCat SDK not found"
```bash
# Reinstall
npm uninstall @revenuecat/purchases-react-web
npm install @revenuecat/purchases-react-web
```

### "API key not working"
- Verify key in RevenueCat dashboard
- Check for `public_` prefix
- Ensure correct environment variable name

### "Demo mode stuck on"
- Check `.env` file exists
- Verify `VITE_DEMO_MODE=false`
- Restart development server

### "Build fails"
```bash
# Clear cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `AUDIT_RESPONSE.md` | Response to audit findings |
| `AUDIT_FIX_PLAN.md` | Comprehensive implementation plan |
| `FIX_SUMMARY.md` | Actionable summary of fixes |
| `CHECKLIST.md` | Quick reference checklist |
| `DEMO_VIDEO_SCRIPT.md` | Demo video script |
| `.env.example` | Environment template |

---

## 🎯 Expected Results

After completing all steps:

| Metric | Before | After |
|--------|--------|-------|
| RevenueCat Integration | 6/10 | 9/10 |
| Completeness | 6/10 | 9/10 |
| Demo Video | ❌ | ✅ |
| Production Deployment | ❌ | ✅ |
| **Overall Score** | **7.8/10** | **8.5-9.0/10** |

---

**Last Updated:** February 2026  
**Priority:** CRITICAL - Complete RevenueCat SDK install first

