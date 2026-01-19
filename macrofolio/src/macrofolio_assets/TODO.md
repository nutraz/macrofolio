# Visual UI Improvements - Implementation Plan

## Status: In Progress

### 1. Typography & Spacing Improvements
- [ ] Add consistent font sizing in tailwind config
- [ ] Improve line heights and letter spacing
- [ ] Standardize card border radii

### 2. Color & Contrast Enhancements
- [ ] Add missing color utility classes
- [ ] Improve disabled state visibility
- [ ] Enhance status indicator colors

### 3. Interactive Elements Polish
- [ ] Improve button hover/active states
- [ ] Add better focus indicators for keyboard navigation
- [ ] Enhance loading state animations

### 4. Animation & Micro-interactions
- [ ] Add skeleton loading states
- [ ] Implement smoother page transitions
- [ ] Add subtle micro-interactions for buttons and cards

### 5. Accessibility Improvements
- [ ] Add aria-labels where missing
- [ ] Improve keyboard navigation visual cues
- [ ] Add reduced motion alternatives

### 6. Mobile Responsiveness
- [ ] Fix mobile padding on smaller screens
- [ ] Improve touch target sizes (ensure 44x44px minimum)

## Files to Modify
- `tailwind.config.js` - Add new typography and color utilities
- `src/index.css` - Add animation utilities and skeleton styles
- `src/components/Header.tsx` - Improve navigation and button states
- `src/pages/Dashboard.tsx` - Add skeleton loading
- `src/sections/PortfolioSummary.tsx` - Add animations
- `src/sections/AssetsTable.tsx` - Improve table interactions
- `src/sections/PerformanceChart.tsx` - Add transitions
- `src/sections/Allocation.tsx` - Add hover effects
- `src/pages/Splash.tsx` - Match theme with rest of app

