# Macrofolio vs. Shipyard: A Hackathon Win Analysis

> **Analysis Date**: January 2026  
> **Purpose**: Map Macrofolio's development against RevenueCat's "How to Win Shipyard" guide

---

## 📊 Executive Summary

This document analyzes how Macrofolio aligns with RevenueCat's **"How to Win Shipyard"** hackathon guide. Overall, Macrofolio demonstrates **strong adherence** to the guide's principles, particularly in idea validation, fast building, and storytelling. The primary area for improvement is **user growth**.

---

## 🏆 Step 1: Come Up With a Great App Idea

### Shipyard Principle
> "Don't come with an existing idea that you try to make fit one of the briefs. Pick the brief that resonates the most. Talk to people. Build empathy."

### Macrofolio's Approach ✅

| Shipyard Guideline | Macrofolio Implementation |
|-------------------|--------------------------|
| **Started with Creator Brief** | Responded to Josh @VisualFaktory's Shipyard Brief |
| **Problem-First Approach** | "Traditional portfolio trackers treat blockchain as either a gimmick or an afterthought" |
| **Customer Empathy** | Identified real pain: investors juggling 6+ platforms |
| **Simple Idea, Deep Understanding** | "Unified multi-asset tracking" - simple concept, powerful execution |

### Evidence From Documentation

From [docs/SHIPYARD_BRIEF.md](docs/SHIPYARD_BRIEF.md):

```
The real issue: Most investors juggle multiple asset classes
across multiple platforms (Robinhood, Coinbase, GoldVault, 
Vanguard, Real Estate, Bank, MetaMask).
                    ↓
"Where the hell is my money?"
```

### Score: 9/10 ✅

**Strengths:**
- Clear problem definition from brief
- Real-world customer understanding
- Simple, focused solution

**Areas for Improvement:**
- Could have done more direct user interviews before building

---

## 🏗️ Step 2: Build Your App Fast

### Shipyard Principle
> "Set a timeline and stick to it. Winners just get to work and build."
> - **4 hours**: Prove concept works
> - **8 hours**: MVP that feels like it works
> - **24 hours**: Launch-ready app

### Macrofolio's Approach ✅

| Phase | Shipyard Timeline | Macrofolio Implementation |
|-------|------------------|--------------------------|
| **Concept (4h)** | Prove it works | Core React + Supabase setup |
| **MVP (8h)** | Feels like it works | Full PWA with dashboard, wallet connection |
| **Launch (24h)** | Deployable | Deployed to Vercel, smart contract on Polygon |

### Macrofolio's Development Speed

```
Hackathon Timeline: 2-4 weeks
├── Week 1: Core infrastructure (React, Supabase)
├── Week 2: Blockchain integration (Polygon)
├── Week 3: Analytics & UI polish
└── Week 4: Deployment & documentation
```

### Technical Stack Choices (Speed-First)

| Decision | Speed Impact |
|----------|-------------|
| **Supabase** over custom backend | Saved ~1 week of dev time |
| **PWA** over native app | Cross-platform in one codebase |
| **Tailwind** for styling | Rapid UI development |
| **Vite** build tool | Instant hot reload |

### Evidence From Codebase

From [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md):

```
Macrofolio/src/macrofolio_assets/
├── src/
│   ├── components/     # Reusable UI
│   ├── pages/          # Route-level
│   ├── sections/       # Dashboard sections
│   ├── hooks/          # Custom logic
│   └── lib/            # Utilities
├── public/             # Static assets
└── package.json
```

### Score: 8/10 ✅

**Strengths:**
- Modular architecture enabled parallel development
- Modern stack maximized development speed
- Clear separation of concerns

**Areas for Improvement:**
- Could have used more AI/vibecoding tools for faster iteration
- RevenueCat integration could have been earlier

---

## 📈 Step 3: Grow Your User Count

### Shipyard Principle
> "The actual hard part: getting users. More users = more feedback. Use Discord to recruit testers. Talk to users who churned."

### Macrofolio's Current Status ⚠️

| Metric | Target (Shipyard) | Current Status |
|--------|-------------------|----------------|
| **Live Demo** | ✅ | [macrofolio.vercel.app](https://macrofolio.vercel.app) |
| **Discord Recruitment** | ❌ | Not actively recruiting |
| **User Testing** | ❌ | Limited feedback loop |
| **Iteration Speed** | "Every day" | Slower post-hackathon |

### User Growth Roadmap

From [docs/BUSINESS.md](docs/BUSINESS.md):

| Phase | Timeline | Users Target |
|-------|----------|--------------|
| Launch | Month 1 | 1,000 |
| Growth | Months 2-6 | 10,000 |
| Scale | Year 1 | 50,000 |

### Current Growth Channels

```
Planned Growth Strategies:
├── Content Marketing (Educational blog posts)
├── Product Hunt Launch (Target: Month 1)
├── Influencer Partnerships (Crypto/Fintech)
├── SEO for "portfolio tracker" keywords
└── Community Building (Discord, Twitter)
```

### Score: 5/10 ⚠️

**Current Status:**
- ✅ Demo is live and accessible
- ✅ Clear value proposition
- ❌ No active user acquisition
- ❌ Limited feedback loop

**Recommended Actions:**
1. Launch on Product Hunt
2. Post in r/CryptoCurrency, r/investing
3. Create Discord server for early adopters
4. Reach out to fintech influencers

---

## 🎬 Step 4: Tell Your Story

### Shipyard Principle
> "Two requirements: short video + written proposal. Frame the problem to elicit feelings. Make you and your app the heroes."

### Macrofolio's Storytelling Strengths ✅

| Shipyard Requirement | Macrofolio Implementation |
|---------------------|---------------------------|
| **Problem Framing** | "Traditional portfolio trackers treat blockchain as a gimmick" |
| **Emotional Hook** | "Where the hell is my money?" |
| **Hero Narrative** | "Reimagining investment intelligence for an AI-native world" |
| **Clear Solution** | Unified multi-asset dashboard + optional blockchain |
| **Value Differentiation** | AI-native, security-first, transparent monetization |

### Documentation Storytelling Elements

| Document | Storytelling Purpose |
|----------|---------------------|
| **README.md** | Executive summary, compelling intro |
| **SHIPYARD_BRIEF.md** | Origin story, challenge accepted |
| **AI_VISIBILITY.md** | Why we stand out, competitive advantage |
| **BUSINESS.md** | Sustainable vision, revenue model |
| **AI_STRATEGY.md** | Future vision, AI roadmap |

### Key Story Elements

From [README.md](README.md):

```
> "Traditional portfolio trackers treat blockchain as either 
> a gimmick or an afterthought. Macrofolio reimagines investment 
> intelligence for an AI-native, multi-asset world."

Core Differentiators:
├── Verification matters — optional on-chain proof
├── Analytics drive decisions — not just balances
└── Architecture survives cycles — built for next decade
```

### Score: 10/10 ✅

**Strengths:**
- Professional documentation sets
- Clear problem-solution narrative
- Compelling differentiators
- Institutional-grade storytelling

**Evidence:**
- 8 documentation files created
- Clear hierarchy with navigation
- Links between documents
- Visual hierarchy with badges, tables, diagrams

---

## 📊 Overall Shipyard Scorecard

| Step | Weight | Score | Weighted Score |
|------|--------|-------|----------------|
| **1. Great Idea** | 25% | 9/10 | 2.25 |
| **2. Build Fast** | 25% | 8/10 | 2.00 |
| **3. Grow Users** | 25% | 5/10 | 1.25 |
| **4. Tell Story** | 25% | 10/10 | 2.50 |
| **TOTAL** | 100% | **8.0/10** | **8.0/10** |

---

## 🎯 Action Plan to Improve Score

### Immediate Actions (This Week)

| Priority | Action | Impact |
|----------|--------|--------|
| 🔴 High | Launch on Product Hunt | +2 users |
| 🔴 High | Post on r/CryptoCurrency | +1 users |
| 🟡 Medium | Create Discord server | +1 users |
| 🟡 Medium | Reach out to 10 influencers | +1 users |

### Short-Term Actions (Next 30 Days)

| Priority | Action | Impact |
|----------|--------|--------|
| 🟡 Medium | Publish 3 blog posts | +1 users |
| 🟡 Medium | YouTube demo video | +1 users |
| 🟢 Low | Improve conversion rate | +0.5 users |

### Long-Term Actions (Next 90 Days)

| Priority | Action | Impact |
|----------|--------|--------|
| 🟢 Low | SEO optimization | +1 users |
| 🟢 Low | Partnership deals | +1 users |
| 🟢 Low | Community building | +1 users |

---

## 🏆 Shipyard Judging Criteria Alignment

Based on the Shipyard guide, judges look for:

| Judge Criteria | Macrofolio Strength |
|---------------|---------------------|
| **Real Problem** | ✅ Clear pain point (fragmented portfolios) |
| **Compelling Solution** | ✅ Unified dashboard + AI insights |
| **Technical Execution** | ✅ Clean architecture, security-first |
| **Monetization** | ✅ RevenueCat integration, clear tiers |
| **User Experience** | ✅ PWA, responsive, intuitive |
| **Growth Potential** | ⚠️ Needs more traction |
| **Storytelling** | ✅ Professional documentation |

---

## 📚 Resources Used

This analysis references:

1. **RevenueCat Shipyard Guide**: How to win Shipyard hackathon
2. **Original Shipyard Brief**: Josh @VisualFaktory's challenge
3. **Macrofolio Documentation**: All 8 files created

---

## 🎬 Final Recommendation

### For Shipyard Submission

Macrofolio is **well-positioned** for Shipyard judging if:

1. **User Growth** improves by 10x before submission
2. **Demo URL** is actively promoted
3. **Video submission** clearly tells the story
4. **Written proposal** highlights differentiation

### For Future Development

The documentation foundation supports:
- ✅ Investor conversations
- ✅ Contributor recruitment
- ✅ Partnership discussions
- ⚠️ User acquisition (needs focus)

---

**Analysis Complete**  
**Next Review**: After implementing growth actions
**Status**: Ready for Shipyard submission with improved user growth

