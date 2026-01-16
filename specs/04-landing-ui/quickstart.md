# Developer Quickstart: Global UI Overhaul & Landing Page

**Feature**: 04-landing-ui | **Date**: 2026-01-16 | **Branch**: `04-landing-ui`

## Overview

This guide helps developers set up, implement, and test the premium light theme (White/Black/Purple) visual redesign across the application.

## Prerequisites

- Node.js 20+ installed
- Git repository cloned
- Branch `04-landing-ui` checked out
- Backend running (for authentication and task data)

## Quick Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

**Expected Output**: All dependencies installed without errors.

### 2. Environment Configuration

Ensure `.env.local` exists in `frontend/` directory:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://[your-neon-connection-string]
BETTER_AUTH_SECRET=[your-secret]
BETTER_AUTH_URL=http://localhost:3000
```

**Note**: These should already be configured from previous features. No new environment variables required.

### 3. Start Development Server

```bash
npm run dev
```

**Expected Output**:
```
▲ Next.js 16.1.1
- Local:        http://localhost:3000
- Ready in 2.1s
```

### 4. Verify Current State

Visit these URLs to see the current (pre-redesign) state:
- `http://localhost:3000/` - Landing page (to be created/updated)
- `http://localhost:3000/sign-in` - Sign-in page (to be updated)
- `http://localhost:3000/sign-up` - Sign-up page (to be updated)
- `http://localhost:3000/dashboard` - Dashboard (to be updated)

## Implementation Workflow

### Phase 1: Tailwind Configuration

**File**: `frontend/tailwind.config.ts`

**Action**: Update configuration with custom design tokens

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#0F0F0F',
        accent: '#7C3AED',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      screens: {
        mobile: { max: '767px' },
        tablet: { min: '768px', max: '1023px' },
        desktop: { min: '1024px' },
      },
    },
  },
  plugins: [],
}

export default config
```

**Verification**: Restart dev server, check that Tailwind compiles without errors.

---

### Phase 2: Global Styles

**File**: `frontend/app/globals.css`

**Action**: Update base styles

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background text-foreground;
  }
}
```

**Verification**: Visit any page, background should be white, text should be black.

---

### Phase 3: Global Components

#### Header Component

**File**: `frontend/components/header.tsx` (create if doesn't exist)

**Key Features**:
- Logo/branding on left
- Navigation links (conditional based on auth)
- User menu (authenticated) or CTA buttons (guest)
- Mobile hamburger menu
- Purple accent for active links

**Example Structure**:
```typescript
'use client'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user

  return (
    <header className="bg-background border-b border-border">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-bold text-foreground">
          TaskApp
        </div>

        {/* Desktop Navigation */}
        <div className="mobile:hidden tablet:flex desktop:flex gap-4">
          {isAuthenticated ? (
            <>
              <a href="/dashboard" className="text-foreground hover:text-accent">
                Dashboard
              </a>
              <button className="text-foreground hover:text-accent">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <a href="/sign-in" className="text-foreground hover:text-accent">
                Sign In
              </a>
              <a href="/sign-up" className="bg-accent text-white px-4 py-2 rounded">
                Get Started
              </a>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile:block tablet:hidden desktop:hidden">
          {/* Hamburger icon */}
        </button>
      </nav>
    </header>
  )
}
```

**Verification**: Header appears on all pages with correct styling.

#### Footer Component

**File**: `frontend/components/footer.tsx` (create if doesn't exist)

**Key Features**:
- Links (About, Privacy, Terms)
- Copyright notice
- Consistent styling with header

**Verification**: Footer appears on all pages with correct styling.

---

### Phase 4: Update Root Layout

**File**: `frontend/app/layout.tsx`

**Action**: Include header and footer

```typescript
import Header from '@/components/header'
import Footer from '@/components/footer'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
```

**Verification**: All pages now have header and footer.

---

### Phase 5: Landing Page

**File**: `frontend/app/page.tsx`

**Key Features**:
- Hero section with value proposition
- "Get Started" and "Sign In" buttons with smart routing
- Responsive layout (mobile/tablet/desktop)
- White background, black text, purple accents

**Smart Routing Logic**:
```typescript
'use client'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const isAuthenticated = !!session?.user

  const handleGetStarted = () => {
    router.push(isAuthenticated ? '/dashboard' : '/sign-in')
  }

  const handleSignIn = () => {
    router.push(isAuthenticated ? '/dashboard' : '/sign-in')
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Manage Your Tasks Effortlessly
        </h1>
        <p className="text-xl mb-8">
          Simple, powerful task management for busy professionals
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleGetStarted}
            className="bg-accent text-white px-6 py-3 rounded hover:opacity-90"
          >
            Get Started
          </button>
          <button
            onClick={handleSignIn}
            className="border border-accent text-accent px-6 py-3 rounded hover:bg-accent hover:text-white"
          >
            Sign In
          </button>
        </div>
      </section>
    </div>
  )
}
```

**Verification**:
- Guest users: Buttons redirect to `/sign-in`
- Authenticated users: Buttons redirect to `/dashboard`

---

### Phase 6: Authentication Pages

**Files**: `frontend/app/sign-in/page.tsx`, `frontend/app/sign-up/page.tsx`

**Key Updates**:
- White background
- Clearly visible input borders (light grey)
- Purple accent buttons
- Clear focus states

**Example Input Styling**:
```typescript
<input
  type="email"
  className="w-full px-4 py-2 border border-border rounded focus:border-accent focus:outline-none"
  placeholder="Email"
/>
```

**Example Button Styling**:
```typescript
<button className="w-full bg-accent text-white py-2 rounded hover:opacity-90">
  Sign In
</button>
```

**Verification**:
- All inputs clearly visible
- Focus states work correctly
- Buttons use purple accent color

---

### Phase 7: Dashboard

**File**: `frontend/app/dashboard/page.tsx`

**Key Updates**:
- White background
- Task cards with shadow depth
- Purple action buttons
- Text truncation for long titles

**Example Task Card**:
```typescript
<div className="bg-background shadow-card rounded p-4 mb-4">
  <h3 className="font-bold truncate">{task.title}</h3>
  <p className="text-sm text-gray-600 truncate">{task.description}</p>
  <div className="flex gap-2 mt-2">
    <button className="text-accent hover:underline">Edit</button>
    <button className="text-accent hover:underline">Delete</button>
  </div>
</div>
```

**Verification**:
- Cards have subtle shadows
- Long text truncates with ellipsis
- Action buttons use purple color

---

## Testing Guide

### Responsive Testing

**Breakpoints to Test**:
- Mobile: 375px (iPhone), 414px (iPhone Plus)
- Tablet: 768px (iPad), 1024px (iPad Pro)
- Desktop: 1280px, 1920px

**Chrome DevTools**:
1. Open DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select device or enter custom dimensions
4. Test all pages at each breakpoint

**Checklist**:
- [ ] Mobile menu works on small screens
- [ ] Layout adapts appropriately at each breakpoint
- [ ] Text remains readable at all sizes
- [ ] Buttons remain clickable (not too small)

---

### Accessibility Testing

#### Contrast Validation

**Tool**: Chrome DevTools Lighthouse

**Steps**:
1. Open DevTools → Lighthouse tab
2. Select "Accessibility" category
3. Click "Generate report"
4. Target score: 90+

**Manual Contrast Check**:
- Black on White: 19.56:1 ✅
- Purple on White: 5.35:1 ✅
- Light Grey on White: 1.15:1 (decorative only)

#### Screen Reader Testing

**Tools**:
- Windows: NVDA (free)
- Mac: VoiceOver (built-in)

**Test Scenarios**:
1. Navigate landing page with keyboard only
2. Verify all buttons are announced correctly
3. Check form labels are associated with inputs
4. Verify heading hierarchy makes sense

**Checklist**:
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader announces page structure
- [ ] Form inputs have proper labels
- [ ] Buttons have descriptive text/aria-labels

---

### Cross-Browser Testing

**Browsers to Test**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Test Scenarios**:
1. Visual consistency (colors, fonts, spacing)
2. Interactive elements (buttons, forms, navigation)
3. Responsive behavior
4. Authentication flow

**Checklist**:
- [ ] Colors render consistently
- [ ] Fonts display correctly (system fonts)
- [ ] Shadows appear as expected
- [ ] No layout shifts or broken elements

---

### Performance Testing

**Tool**: Chrome DevTools Lighthouse

**Metrics to Monitor**:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

**Steps**:
1. Open DevTools → Lighthouse tab
2. Select "Performance" category
3. Click "Generate report"
4. Review recommendations

**Target Scores**:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+

---

## Common Issues & Solutions

### Issue: Tailwind classes not applying

**Solution**: Restart dev server after config changes
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue: FOUC (Flash of Unstyled Content)

**Solution**: Ensure global CSS imported in root layout
```typescript
// app/layout.tsx
import './globals.css' // Must be first import
```

### Issue: Mobile menu not working

**Solution**: Ensure component is marked as client component
```typescript
'use client' // Add at top of file
```

### Issue: Authentication state not updating

**Solution**: Check Better Auth session hook usage
```typescript
const { data: session } = useSession()
// Not: const session = useSession()
```

---

## Verification Checklist

Before marking implementation complete:

**Visual Design**:
- [ ] All pages use white background (#FFFFFF)
- [ ] All text uses black color (#0F0F0F)
- [ ] All primary buttons use purple accent (#7C3AED)
- [ ] Cards have subtle shadows (0 1px 3px rgba(0,0,0,0.1))
- [ ] System fonts render correctly

**Functionality**:
- [ ] Smart routing works (auth vs guest)
- [ ] Authentication flow unchanged
- [ ] Task CRUD operations work
- [ ] Mobile menu opens/closes
- [ ] Text truncation works

**Responsive**:
- [ ] Mobile layout (320-767px) works
- [ ] Tablet layout (768-1023px) works
- [ ] Desktop layout (1024px+) works

**Accessibility**:
- [ ] Lighthouse accessibility score 90+
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Contrast ratios meet WCAG AA

**Performance**:
- [ ] Page load under 3 seconds
- [ ] No FOUC on transitions
- [ ] Lighthouse performance score 90+

---

## Next Steps

After implementation:
1. Run full test suite
2. Create pull request
3. Request design review
4. Deploy to staging
5. User acceptance testing

## Support

**Documentation**:
- Spec: `specs/04-landing-ui/spec.md`
- Plan: `specs/04-landing-ui/plan.md`
- Research: `specs/04-landing-ui/research.md`

**Resources**:
- Tailwind CSS Docs: https://tailwindcss.com/docs
- Next.js App Router: https://nextjs.org/docs/app
- Better Auth: https://better-auth.com/docs
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
