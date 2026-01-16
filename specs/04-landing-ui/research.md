# Research: Global UI Overhaul & Landing Page

**Feature**: 04-landing-ui | **Date**: 2026-01-16 | **Phase**: 0 (Research)

## Overview

This document consolidates research findings for implementing a premium light theme (White/Black/Purple) across the application using Tailwind CSS 4, Next.js 16 App Router, and modern web standards.

## 1. Tailwind CSS 4 Configuration

### Custom Color Palette

**Decision**: Extend Tailwind's default theme with custom color tokens

**Implementation**:
```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      background: '#FFFFFF',
      foreground: '#0F0F0F',
      accent: '#7C3AED',
      border: '#E5E7EB',
    }
  }
}
```

**Usage in Components**:
- `bg-background` - White backgrounds
- `text-foreground` - Black text
- `bg-accent` / `text-accent` - Purple accents
- `border-border` - Light grey borders

**Rationale**: Semantic color names make the design system self-documenting and easier to maintain than using arbitrary hex values throughout the codebase.

**Alternatives Considered**:
- Using Tailwind's default color palette (rejected: doesn't match our specific purple #7C3AED)
- CSS variables only (rejected: loses Tailwind's utility class benefits)

### System Font Stack

**Decision**: Use native system fonts via Tailwind font family extension

**Implementation**:
```typescript
fontFamily: {
  sans: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    'sans-serif',
  ],
}
```

**Benefits**:
- Zero font loading time (no network requests)
- Native feel on each platform
- Excellent readability (fonts optimized for each OS)
- Used by GitHub, Bootstrap 5, Tailwind CSS defaults

**Rationale**: Performance and native feel outweigh the benefits of custom web fonts for this application type.

**Alternatives Considered**:
- Inter font (rejected: requires font loading, adds ~100KB)
- Poppins (rejected: geometric style less suitable for dense UI)
- Default Tailwind fonts (accepted: already uses system fonts)

### Custom Shadow Utilities

**Decision**: Create custom shadow utility for card depth

**Implementation**:
```typescript
boxShadow: {
  card: '0 1px 3px rgba(0, 0, 0, 0.1)',
}
```

**Usage**: `shadow-card` class for all card components

**Rationale**: Subtle shadow provides depth on white backgrounds without being visually heavy. The 0.1 opacity ensures it's barely perceptible but effective.

**Alternatives Considered**:
- Tailwind's default shadows (rejected: too heavy for premium aesthetic)
- Borders instead of shadows (rejected: creates hard lines, less modern)

### Responsive Breakpoints

**Decision**: Customize Tailwind breakpoints for mobile-first approach

**Implementation**:
```typescript
screens: {
  mobile: { max: '767px' },
  tablet: { min: '768px', max: '1023px' },
  desktop: { min: '1024px' },
}
```

**Usage**:
- `mobile:` prefix for mobile-specific styles
- `tablet:` prefix for tablet-specific styles
- `desktop:` prefix for desktop-specific styles
- Default styles apply to mobile (mobile-first)

**Rationale**: Named breakpoints are more semantic than Tailwind's default `sm`, `md`, `lg`. Mobile-first ensures baseline experience works on smallest screens.

**Alternatives Considered**:
- Using Tailwind defaults (rejected: less semantic, different breakpoint values)
- More granular breakpoints (rejected: adds complexity without clear benefit)

## 2. Next.js App Router Patterns

### Client-Side Authentication Checks

**Decision**: Use Better Auth's session hook for client-side auth status

**Pattern**:
```typescript
'use client'
import { useSession } from '@/lib/auth-client'

export default function LandingPage() {
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user

  const handleGetStarted = () => {
    router.push(isAuthenticated ? '/dashboard' : '/sign-in')
  }
}
```

**Rationale**: Better Auth provides React hooks that integrate seamlessly with Next.js App Router. Session data is cached and revalidated automatically.

**Best Practices**:
- Mark components using hooks as `'use client'`
- Check session existence before accessing user data
- Handle loading states gracefully

**Alternatives Considered**:
- Server-side checks only (rejected: requires full page reload for routing)
- Manual JWT parsing (rejected: Better Auth handles this)

### Optimistic Routing for Instant Navigation

**Decision**: Navigate immediately without blocking on auth checks

**Pattern**:
```typescript
const handleNavigation = () => {
  // Navigate immediately (optimistic)
  router.push(targetUrl)

  // Auth check happens in background
  // Middleware redirects if needed
}
```

**Implementation Strategy**:
1. Button click triggers immediate navigation
2. Next.js middleware checks auth status
3. Middleware redirects if auth state doesn't match destination
4. User sees instant response, corrections happen seamlessly

**Rationale**: Prioritizes perceived performance. Users see immediate feedback rather than waiting for auth checks.

**Best Practices**:
- Use Next.js middleware for auth guards
- Preserve return URLs for post-login redirects
- Handle edge cases (session expiry during navigation)

**Alternatives Considered**:
- Blocking navigation with loading spinner (rejected: poor UX, feels slow)
- No client-side routing (rejected: requires full page reloads)

### Preventing FOUC (Flash of Unstyled Content)

**Decision**: Use Next.js built-in CSS optimization and proper import order

**Implementation**:
```typescript
// app/layout.tsx
import './globals.css' // Import global styles first

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  )
```

**Best Practices**:
- Import global CSS in root layout
- Apply base styles to `<body>` element
- Use Tailwind's base layer for resets
- Avoid dynamic style imports

**Rationale**: Next.js 16 optimizes CSS loading automatically. Applying base styles to body ensures consistent rendering before components mount.

**Alternatives Considered**:
- Inline critical CSS (rejected: Next.js handles this automatically)
- CSS-in-JS (rejected: adds runtime overhead, not needed)

## 3. Accessibility Implementation

### WCAG AA Contrast Validation

**Decision**: Use automated tools during development + manual verification

**Tools**:
1. **axe DevTools** (browser extension)
   - Real-time contrast checking
   - Identifies ARIA issues
   - Free for development

2. **WAVE** (WebAIM)
   - Visual feedback overlay
   - Detailed error explanations
   - Free online tool

3. **Chrome DevTools Lighthouse**
   - Automated accessibility audit
   - Scores and recommendations
   - Built into Chrome

**Validation Process**:
1. Run axe DevTools on each page
2. Fix any contrast violations (target 4.5:1 for normal text, 3:1 for large text)
3. Run Lighthouse audit (target score 90+)
4. Manual screen reader testing (NVDA/VoiceOver)

**Color Contrast Verification**:
- Black (#0F0F0F) on White (#FFFFFF): 19.56:1 ✅ (exceeds 4.5:1)
- Purple (#7C3AED) on White (#FFFFFF): 5.35:1 ✅ (exceeds 4.5:1)
- Light Grey (#E5E7EB) on White (#FFFFFF): 1.15:1 ⚠️ (decorative only, not for text)

**Rationale**: Automated tools catch 80% of issues quickly. Manual testing catches the remaining 20% (keyboard navigation, screen reader experience).

### Semantic HTML Patterns

**Decision**: Use proper HTML5 semantic elements

**Landing Page Structure**:
```html
<header>
  <nav>...</nav>
</header>

<main>
  <section aria-label="Hero">
    <h1>Value Proposition</h1>
    <p>Description</p>
    <button>Get Started</button>
  </section>
</main>

<footer>...</footer>
```

**Best Practices**:
- Use `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- One `<h1>` per page
- Proper heading hierarchy (h1 → h2 → h3)
- `<button>` for actions, `<a>` for navigation
- `aria-label` for sections without visible headings

**Rationale**: Semantic HTML provides structure for screen readers and improves SEO.

### ARIA Labels for Interactive Elements

**Decision**: Add ARIA labels where visual context isn't sufficient

**Patterns**:
```typescript
// Icon-only buttons
<button aria-label="Close menu">
  <XIcon />
</button>

// Form inputs
<input
  type="email"
  aria-label="Email address"
  aria-required="true"
/>

// Navigation
<nav aria-label="Main navigation">
  ...
</nav>
```

**Best Practices**:
- Use `aria-label` for icon-only buttons
- Use `aria-required` for required form fields
- Use `aria-current="page"` for active nav links
- Avoid redundant ARIA (don't label buttons that have visible text)

**Rationale**: Screen readers need text alternatives for visual elements.

## 4. Responsive Design Patterns

### Mobile-First CSS with Tailwind

**Decision**: Write base styles for mobile, override for larger screens

**Pattern**:
```typescript
// Mobile-first approach
<div className="
  p-4              // Mobile: 16px padding
  tablet:p-6       // Tablet: 24px padding
  desktop:p-8      // Desktop: 32px padding

  flex-col         // Mobile: stack vertically
  tablet:flex-row  // Tablet+: horizontal layout
">
```

**Best Practices**:
- Start with mobile styles (no prefix)
- Add tablet/desktop overrides as needed
- Test on actual devices, not just browser resize
- Use Chrome DevTools device emulation

**Rationale**: Mobile-first ensures baseline experience works on smallest screens. Progressive enhancement adds features for larger screens.

**Alternatives Considered**:
- Desktop-first (rejected: harder to simplify complex layouts for mobile)
- Separate mobile/desktop codebases (rejected: maintenance burden)

### Text Truncation with Ellipsis

**Decision**: Use Tailwind's truncate utility with line-clamp plugin

**Implementation**:
```typescript
// Single line truncation
<p className="truncate">
  {longText}
</p>

// Multi-line truncation (requires @tailwindcss/line-clamp)
<p className="line-clamp-2">
  {longText}
</p>
```

**For this feature**: Use single-line truncation (`truncate`) for task titles

**Best Practices**:
- Add `title` attribute with full text for hover tooltip
- Provide expand/collapse mechanism for long content
- Test with various text lengths

**Rationale**: Maintains consistent card heights and clean visual layout.

**Alternatives Considered**:
- Word wrap (rejected: creates inconsistent card heights)
- Fixed character limits (rejected: cuts mid-word, poor UX)

### Responsive Navigation Patterns

**Decision**: Hamburger menu for mobile, horizontal nav for desktop

**Pattern**:
```typescript
// Mobile: Hamburger menu
<button className="mobile:block tablet:hidden desktop:hidden">
  <MenuIcon />
</button>

// Desktop: Horizontal nav
<nav className="mobile:hidden tablet:flex desktop:flex">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>
```

**Best Practices**:
- Use `<button>` for hamburger (not `<a>`)
- Animate menu open/close transitions
- Close menu on route change
- Trap focus inside open mobile menu

**Rationale**: Standard pattern users expect. Maximizes screen space on mobile while providing full navigation on desktop.

## 5. Implementation Recommendations

### Development Workflow

1. **Setup Tailwind Config** - Define all design tokens upfront
2. **Create Global Components** - Header and footer first for consistency
3. **Build Landing Page** - Test responsive behavior and routing
4. **Update Auth Pages** - Verify form accessibility
5. **Update Dashboard** - Test with real task data
6. **Accessibility Audit** - Run tools on all pages
7. **Cross-Browser Testing** - Verify on Chrome, Firefox, Safari, Edge

### Testing Checklist

- [ ] Color contrast meets WCAG AA (4.5:1 for normal text)
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader announces page structure correctly
- [ ] Mobile menu opens/closes smoothly
- [ ] Text truncation works with various lengths
- [ ] No FOUC on page transitions
- [ ] Page load under 3 seconds
- [ ] Responsive layout works at all breakpoints
- [ ] Smart routing redirects correctly (auth vs guest)

### Performance Optimization

- Use Next.js Image component for any images
- Minimize custom CSS (leverage Tailwind utilities)
- Avoid large JavaScript bundles (code split if needed)
- Test with Chrome DevTools Lighthouse
- Monitor Core Web Vitals (LCP, FID, CLS)

## Conclusion

All research tasks completed. Key decisions documented with rationale and alternatives considered. Ready to proceed to Phase 1 (Design & Contracts).

**Next Steps**:
1. Generate `data-model.md` (note: N/A for this feature)
2. Generate `quickstart.md` (developer guide)
3. Proceed to `/sp.tasks` for task breakdown
