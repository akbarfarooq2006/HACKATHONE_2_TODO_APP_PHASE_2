# Implementation Plan: Global UI Overhaul & Landing Page

**Branch**: `04-landing-ui` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/04-landing-ui/spec.md`

## Summary

Implement a premium light theme (White/Black/Purple) across the entire application with a new landing page featuring smart authentication-based routing. This is a frontend-focused visual redesign that updates existing pages (landing, sign-in, sign-up, dashboard) and global components (header, footer) to use a consistent design system with system fonts, shadow-based depth, and mobile-first responsive breakpoints.

**Technical Approach**: Update Tailwind CSS configuration with custom color palette, create/refactor Next.js App Router pages with new styling, implement optimistic routing for authentication checks, and ensure WCAG AA accessibility compliance across all breakpoints (mobile 320-767px, tablet 768-1023px, desktop 1024px+).

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.1.1 (App Router)
**Primary Dependencies**:
- Next.js 16.1.1 (React 19.2.3)
- Tailwind CSS 4.x
- Better Auth 1.4.10 (authentication)
- TypeScript 5.x

**Storage**: N/A (no new data models; uses existing Neon PostgreSQL via backend APIs)
**Testing**: Manual visual testing, accessibility audit tools (WAVE, axe DevTools), responsive design testing across breakpoints
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
**Project Type**: Web application (frontend-focused UI update)
**Performance Goals**:
- Page load under 3 seconds on standard broadband
- Zero flash of unstyled content (FOUC)
- Lighthouse accessibility score 90+

**Constraints**:
- Must maintain existing authentication flow (Better Auth + JWT)
- Cannot modify backend APIs or data models
- Must preserve all existing functionality (only visual changes)
- WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text)

**Scale/Scope**:
- 5 pages to update (landing, sign-in, sign-up, dashboard, layout)
- 2 global components (header, footer)
- 3 responsive breakpoints (mobile, tablet, desktop)
- 1 design system (color palette, typography, spacing, shadows)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-First Development ✅
- **Status**: PASS
- **Evidence**: Feature fully specified in `/specs/04-landing-ui/spec.md` with 4 prioritized user stories, 17 functional requirements, 6 design system requirements, and 10 measurable success criteria
- **Action**: None required

### Principle II: Security & Authentication ✅
- **Status**: PASS
- **Evidence**: No changes to authentication logic; maintains existing Better Auth + JWT flow. Smart routing checks authentication status client-side using existing session management.
- **Action**: None required

### Principle III: Monorepo Architecture ✅
- **Status**: PASS
- **Evidence**: All changes confined to `frontend/` directory. No backend modifications. No direct database access.
- **Action**: None required

### Principle IV: Agent-Driven Development ✅
- **Status**: PASS
- **Evidence**: Plan generated via `/sp.plan` command following Spec-Kit Plus methodology
- **Action**: None required

### Principle V: Tech Stack Compliance ✅
- **Status**: PASS
- **Evidence**: Uses mandated Next.js 16+ (App Router), TypeScript, Tailwind CSS. No new technologies introduced.
- **Action**: None required

### Principle VI: API-First Backend Design ✅
- **Status**: PASS
- **Evidence**: No backend changes required. Uses existing REST APIs for authentication status checks.
- **Action**: None required

**Overall Gate Status**: ✅ **PASS** - All constitutional principles satisfied. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/04-landing-ui/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (design system research)
├── data-model.md        # Phase 1 output (N/A - no new models)
├── quickstart.md        # Phase 1 output (developer guide)
└── tasks.md             # Phase 2 output (NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── app/
│   ├── page.tsx                    # Landing page (NEW/UPDATE)
│   ├── layout.tsx                  # Root layout with header/footer (UPDATE)
│   ├── globals.css                 # Global styles (UPDATE)
│   ├── sign-in/
│   │   └── page.tsx                # Sign-in page (UPDATE)
│   ├── sign-up/
│   │   └── page.tsx                # Sign-up page (UPDATE)
│   └── dashboard/
│       └── page.tsx                # Dashboard page (UPDATE)
├── components/
│   ├── header.tsx                  # Global header/navbar (NEW/UPDATE)
│   ├── footer.tsx                  # Global footer (NEW/UPDATE)
│   ├── task-list.tsx               # Task list component (UPDATE)
│   ├── task-item.tsx               # Task item component (UPDATE)
│   └── task-form.tsx               # Task form component (UPDATE)
├── lib/
│   └── auth-client.ts              # Auth utilities (existing)
├── tailwind.config.ts              # Tailwind configuration (UPDATE)
└── package.json                    # Dependencies (no changes)

backend/
└── [no changes required]
```

**Structure Decision**: Web application (Option 2) with frontend-only changes. The existing monorepo structure (`frontend/` + `backend/`) is maintained. All implementation work occurs in the `frontend/` directory, specifically updating Next.js App Router pages, creating/updating React components, and configuring Tailwind CSS with the new design system.

## Complexity Tracking

> **No violations detected** - This section is empty because all constitutional checks passed.

## Phase 0: Research & Design System Definition

**Objective**: Define the complete design system specifications and research best practices for implementing the premium light theme with Tailwind CSS 4.

### Research Tasks

1. **Tailwind CSS 4 Configuration**
   - Research: How to configure custom color palette in Tailwind CSS 4
   - Research: System font stack implementation in Tailwind
   - Research: Custom shadow utilities for card depth
   - Research: Responsive breakpoint customization

2. **Next.js App Router Patterns**
   - Research: Client-side authentication checks with Better Auth
   - Research: Optimistic routing patterns for instant navigation
   - Research: Preventing FOUC in Next.js 16 App Router

3. **Accessibility Implementation**
   - Research: WCAG AA contrast validation tools and techniques
   - Research: Semantic HTML patterns for landing pages
   - Research: ARIA labels for interactive elements

4. **Responsive Design Patterns**
   - Research: Mobile-first CSS patterns with Tailwind
   - Research: Text truncation with ellipsis in Tailwind
   - Research: Responsive navigation patterns (mobile menu, desktop nav)

### Design System Specifications

**Color Palette** (from spec clarifications):
- Background: `#FFFFFF` (white)
- Text: `#0F0F0F` (black)
- Accent: `#7C3AED` (purple)
- Supporting: `#E5E7EB` (light grey for borders)

**Typography** (from spec clarifications):
- Font Stack: System fonts (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)
- Hierarchy: Headings (bold, larger), Body (normal), Captions (smaller)

**Spacing**:
- Card padding: minimum 16px
- Section padding: minimum 24px
- Generous whitespace for premium feel

**Depth Treatment** (from spec clarifications):
- Cards: `box-shadow: 0 1px 3px rgba(0,0,0,0.1)`
- No borders for card elevation

**Responsive Breakpoints** (from spec clarifications):
- Mobile: 320-767px (baseline)
- Tablet: 768-1023px
- Desktop: 1024px+

**Output**: `research.md` with consolidated findings and implementation recommendations

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete

### Data Model

**Status**: N/A - No new data models required

This feature is a visual redesign that uses existing data models:
- User (existing - managed by Better Auth)
- Task (existing - managed by backend API)
- Session (existing - managed by Better Auth)

**Output**: `data-model.md` documenting existing models used (reference only)

### API Contracts

**Status**: N/A - No new API endpoints required

This feature uses existing REST APIs:
- `GET /api/auth/session` - Check authentication status (Better Auth)
- `GET /api/v1/tasks` - Fetch user tasks (existing backend)
- `POST /api/v1/tasks` - Create task (existing backend)
- `PUT /api/v1/tasks/:id` - Update task (existing backend)
- `DELETE /api/v1/tasks/:id` - Delete task (existing backend)

**Output**: No new contracts; reference existing API documentation

### Component Architecture

**New/Updated Components**:

1. **Landing Page** (`app/page.tsx`)
   - Hero section with value proposition
   - "Get Started" and "Sign In" buttons with smart routing
   - Responsive layout (mobile/tablet/desktop)

2. **Global Header** (`components/header.tsx`)
   - Logo/branding
   - Navigation links (conditional based on auth status)
   - User menu (authenticated) or CTA buttons (guest)
   - Mobile hamburger menu

3. **Global Footer** (`components/footer.tsx`)
   - Links (About, Privacy, Terms)
   - Copyright notice
   - Consistent styling with header

4. **Auth Pages** (`app/sign-in/page.tsx`, `app/sign-up/page.tsx`)
   - Form layouts with visible input borders
   - Purple accent buttons
   - Clear focus states

5. **Dashboard** (`app/dashboard/page.tsx`)
   - White background with black text
   - Task cards with shadows
   - Purple action buttons

6. **Task Components** (`components/task-*.tsx`)
   - Updated styling for light theme
   - Text truncation with ellipsis
   - Responsive card layouts

### Tailwind Configuration

**File**: `frontend/tailwind.config.ts`

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

### Developer Quickstart

**Output**: `quickstart.md` with:
- Setup instructions for local development
- How to run the frontend with new styling
- How to test responsive breakpoints
- How to validate accessibility compliance
- How to verify color contrast ratios

## Phase 2: Task Breakdown

**Status**: NOT INCLUDED IN THIS PLAN

Task breakdown will be generated by the `/sp.tasks` command, which creates `tasks.md` with:
- Testable implementation tasks
- Acceptance criteria for each task
- Dependencies between tasks
- Estimated complexity

**Next Command**: `/sp.tasks` (after this plan is approved)

## Implementation Strategy

### Approach

1. **Design System First**: Update Tailwind configuration with custom theme
2. **Global Components**: Implement header and footer for consistency
3. **Page-by-Page**: Update pages in priority order (P1 → P4)
4. **Responsive Testing**: Validate at each breakpoint after each page
5. **Accessibility Audit**: Run contrast and semantic HTML checks

### Rollout Order

**Phase 1: Foundation** (P1)
1. Update Tailwind config with color palette and design tokens
2. Create global header and footer components
3. Update root layout to include header/footer
4. Create new landing page with smart routing

**Phase 2: Authentication** (P2)
5. Update sign-in page styling
6. Update sign-up page styling
7. Test authentication flow with new design

**Phase 3: Dashboard** (P3)
8. Update dashboard page styling
9. Update task list component styling
10. Update task item component with text truncation
11. Update task form component styling

**Phase 4: Polish** (P4)
12. Responsive testing across all breakpoints
13. Accessibility audit and fixes
14. Cross-browser testing
15. Performance validation (FOUC prevention, load times)

### Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Breaking existing functionality | Preserve all existing logic; only update styling and layout |
| Accessibility violations | Use contrast checker tools; validate with screen readers |
| Responsive layout issues | Test at each breakpoint during development; use browser DevTools |
| FOUC during page transitions | Implement proper CSS loading strategy; use Next.js font optimization |
| Browser inconsistencies | Test on all major browsers; use standard CSS properties |

## Architectural Decisions

### ADR Candidates

The following decisions may warrant ADRs if they prove architecturally significant:

1. **System Font Stack vs Custom Fonts**
   - Decision: Use system font stack
   - Rationale: Zero load time, native feel, modern standard
   - Status: Resolved in clarification (no ADR needed - standard practice)

2. **Shadow-Based Depth vs Borders**
   - Decision: Consistent shadows for all cards
   - Rationale: Better depth perception on white backgrounds
   - Status: Resolved in clarification (no ADR needed - design choice)

3. **Optimistic Routing Pattern**
   - Decision: Navigate immediately, check auth in background
   - Rationale: Prioritizes perceived speed
   - Status: May warrant ADR if implementation reveals complexity

**Recommendation**: Monitor implementation. If optimistic routing requires significant architectural changes or introduces edge cases, create ADR documenting the pattern and tradeoffs.

## Success Criteria Mapping

| Success Criterion | Validation Method |
|-------------------|-------------------|
| SC-001: 100% color palette compliance | Visual inspection + color picker verification |
| SC-002: Value proposition understood in 5s | User testing (5 participants minimum) |
| SC-003: 100% routing logic accuracy | Automated E2E tests (authenticated + guest scenarios) |
| SC-004: WCAG AA contrast compliance | axe DevTools + WAVE accessibility audit |
| SC-005: Zero FOUC instances | Manual testing across all page transitions |
| SC-006: 100% form usability | User testing (5 participants minimum) |
| SC-007: Consistent card styling | Visual inspection across all screen sizes |
| SC-008: Header/footer consistency | Visual inspection across all routes |
| SC-009: Page load under 3 seconds | Lighthouse performance audit |
| SC-010: 80%+ positive design feedback | User survey (10 participants minimum) |

## Dependencies

**External Dependencies**:
- Better Auth session management (existing)
- Backend REST APIs for task data (existing)
- Tailwind CSS 4 (already installed)

**Internal Dependencies**:
- Existing authentication flow must remain functional
- Existing task CRUD operations must remain functional
- No breaking changes to component props or APIs

**Blockers**: None identified

## Next Steps

1. **Review and approve this plan** - Ensure alignment with requirements
2. **Generate research.md** - Complete Phase 0 research tasks
3. **Generate quickstart.md** - Create developer guide
4. **Run `/sp.tasks`** - Generate detailed task breakdown
5. **Begin implementation** - Execute tasks in priority order

---

**Plan Status**: ✅ Ready for Review
**Constitution Compliance**: ✅ All gates passed
**Next Command**: `/sp.tasks` (after approval)
