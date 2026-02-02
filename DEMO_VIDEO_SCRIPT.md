# Macrofolio Demo Video Script
## RevenueCat Shipyard Contest Submission

**Duration:** 2-3 minutes
**Format:** Screen recording with voiceover

---

## Scene 1: Introduction (15 seconds)

**[VISUAL]:** Macrofolio landing page with logo
**[AUDIO]:**
"Hi, I'm the developer behind Macrofolio - a multi-asset portfolio tracker with blockchain integration. Today I'll show you how our app helps investors track everything from stocks to crypto in one unified dashboard."

---

## Scene 2: Dashboard Overview (30 seconds)

**[VISUAL]:** Navigate to Dashboard, show portfolio summary with real demo data
**[AUDIO]:**
"Here's our main dashboard. As you can see, we're running in Demo Mode with sample portfolio data. The total portfolio value is dynamically calculated from 6 assets including Apple, Bitcoin, Ethereum, Gold, and more. Notice the real-time price simulation - we can refresh prices to see live updates."

**[ACTION]:** Click "Refresh Prices" button, show values changing

---

## Scene 3: Multi-Asset Tracking (30 seconds)

**[VISUAL]:** Scroll down to show asset table with all tracked assets
**[AUDIO]:**
"Macrofolio tracks six different asset types: stocks, crypto, gold, real estate, fixed income, and ETFs. Each asset shows current value, gain/loss, and performance metrics. The allocation chart visualizes your portfolio diversity."

**[ACTION]:** Hover over allocation chart sections

---

## Scene 4: RevenueCat Integration (45 seconds)

**[VISUAL]:** Navigate to Premium page
**[AUDIO]:**
"Now let's look at our RevenueCat integration. This is the critical piece for monetization. Our Premium page connects to RevenueCat's SDK to manage subscriptions."

**[ACTION]:** Show loading state
**[AUDIO]:**
"When users visit the Premium page, we fetch available offerings from RevenueCat. Currently we're in demo mode, which simulates the purchase flow."

**[ACTION]:** Click "Subscribe" on monthly plan
**[AUDIO]:**
"Clicking subscribe initiates the RevenueCat purchase flow. In production, this would open the platform's payment sheet (Apple, Google, or web). After purchase, RevenueCat grants entitlements and the user gets instant access to premium features."

**[ACTION]:** Show success message and premium badge

---

## Scene 5: Premium Features (30 seconds)

**[VISUAL]:** Show premium features now unlocked
**[AUDIO]:**
"Premium subscribers get access to advanced analytics, real-time alerts, and export features. RevenueCat handles all the subscription management, including renewals, cancellations, and cross-platform restoration."

---

## Scene 6: Technical Architecture (20 seconds)

**[VISUAL]:** Show architecture diagram or brief code snippet
**[AUDIO]:**
"Behind the scenes, we use RevenueCat's React SDK with our custom provider that handles entitlement checking. The integration supports both mobile and web platforms, with automatic purchase restoration."

---

## Scene 7: Closing (10 seconds)

**[VISUAL]:** Final dashboard view with "Thank you" message
**[AUDIO]:**
"Thanks for watching! Macrofolio combines powerful portfolio tracking with seamless monetization through RevenueCat. Try the demo at macrofolio.vercel.app."

---

## Technical Notes for Demo

### What to Show:
1. ✅ Working dashboard with portfolio data
2. ✅ Asset allocation chart
3. ✅ Premium page with RevenueCat integration
4. ✅ Demo purchase flow
5. ✅ Premium feature unlocking

### What to Mention:
- RevenueCat API key configuration
- Entitlement-based feature gating
- Cross-platform subscription support
- Demo mode vs production mode

### Requirements Met:
- RevenueCat SDK integration (even in demo mode)
- Working MVP with functional demo
- Clear subscription flow
- Premium features properly gated

---

## Recording Tips
1. Use Loom or similar for screen recording
2. Keep video under 3 minutes
3. Include timestamps in description
4. Highlight the RevenueCat integration specifically
5. Show both the user flow AND the technical implementation

