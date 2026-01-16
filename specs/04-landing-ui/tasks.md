# Tasks: Global UI Overhaul & Landing Page

**Input**: Design documents from `/specs/04-landing-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in specification - manual visual testing and accessibility audits will be performed

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/app/`, `frontend/components/`, `frontend/lib/`
- All changes confined to `frontend/` directory (no backend modifications)

---

## Phase 1: Setup (Design System Foundation)

**Purpose**: Configure Tailwind CSS with custom design tokens and prepare global styles

- [x] T001 Update Tailwind configuration with custom color palette in frontend/tailwind.config.ts
- [x] T002 [P] Update global styles with base layer in frontend/app/globals.css
- [x] T003 [P] Verify Tailwind compilation and design tokens work correctly

**Checkpoint**: Design system configured - custom colors, fonts, shadows, and breakpoints available

---

## Phase 2: Foundational (Global Components)

**Purpose**: Create header and footer components that ALL user stories depend on for visual consistency

**⚠️ CRITICAL**: These components must be complete before ANY page work can begin

- [x] T004 Create Header component with navigation in frontend/components/header.tsx
- [x] T005 Create Footer component with links in frontend/components/footer.tsx
- [x] T006 Update root layout to include Header and Footer in frontend/app/layout.tsx
- [x] T007 Verify header and footer render correctly on all existing pages

**Checkpoint**: Foundation ready - all pages now have consistent header/footer structure

---

## Phase 3: User Story 1 - Landing Page Discovery & Smart Navigation (Priority: P1) 🎯 MVP

**Goal**: Create a premium landing page with smart authentication-based routing that serves as the primary entry point

**Independent Test**: Visit `/` as both guest and authenticated user, verify visual design (white/black/purple), confirm "Get Started" and "Sign In" buttons redirect correctly based on auth status

### Implementation for User Story 1

- [x] T008 [US1] Create landing page with hero section in frontend/app/page.tsx
- [x] T009 [US1] Implement smart routing logic using Better Auth session hook in frontend/app/page.tsx
- [x] T010 [US1] Add "Get Started" button with conditional redirect (guest→/sign-in, auth→/dashboard) in frontend/app/page.tsx
- [x] T011 [US1] Add "Sign In" button with conditional redirect (guest→/sign-in, auth→/dashboard) in frontend/app/page.tsx
- [x] T012 [US1] Style landing page with white background, black text, purple accents in frontend/app/page.tsx
- [x] T013 [US1] Add value proposition content (headline, description) in frontend/app/page.tsx
- [x] T014 [US1] Implement responsive layout for mobile (320-767px) in frontend/app/page.tsx
- [x] T015 [US1] Implement responsive layout for tablet (768-1023px) in frontend/app/page.tsx
- [x] T016 [US1] Implement responsive layout for desktop (1024px+) in frontend/app/page.tsx
- [x] T017 [US1] Verify WCAG AA contrast ratios (black on white: 19.56:1, purple on white: 5.35:1)
- [x] T018 [US1] Test smart routing as guest user (buttons redirect to /sign-in)
- [x] T019 [US1] Test smart routing as authenticated user (buttons redirect to /dashboard)

**Checkpoint**: Landing page complete and independently testable - MVP ready for demo

---

## Phase 4: User Story 2 - Authentication Experience Redesign (Priority: P2)

**Goal**: Update sign-in and sign-up pages with premium light theme and clear visual feedback

**Independent Test**: Navigate to `/sign-in` and `/sign-up`, verify white background, visible input borders, purple buttons, proper focus states, and WCAG AA compliance

### Implementation for User Story 2

- [x] T020 [P] [US2] Update sign-in page with white background and light theme in frontend/app/sign-in/page.tsx
- [x] T021 [P] [US2] Update sign-up page with white background and light theme in frontend/app/sign-up/page.tsx
- [x] T022 [US2] Style input fields with visible light grey borders in frontend/app/sign-in/page.tsx
- [x] T023 [US2] Style input fields with visible light grey borders in frontend/app/sign-up/page.tsx
- [x] T024 [US2] Add focus states with purple accent border to inputs in frontend/app/sign-in/page.tsx
- [x] T025 [US2] Add focus states with purple accent border to inputs in frontend/app/sign-up/page.tsx
- [x] T026 [US2] Style submit button with purple accent color (#7C3AED) in frontend/app/sign-in/page.tsx
- [x] T027 [US2] Style submit button with purple accent color (#7C3AED) in frontend/app/sign-up/page.tsx
- [x] T028 [US2] Ensure consistent styling between sign-in and sign-up pages
- [x] T029 [US2] Implement responsive layout for mobile/tablet/desktop on sign-in page
- [x] T030 [US2] Implement responsive layout for mobile/tablet/desktop on sign-up page
- [x] T031 [US2] Verify WCAG AA contrast for all text and interactive elements
- [x] T032 [US2] Test form input visibility and focus states on both pages
- [x] T033 [US2] Verify visual consistency with landing page (seamless transition)

**Checkpoint**: Authentication pages complete and independently testable

---

## Phase 5: User Story 3 - Dashboard Visual Consistency (Priority: P3)

**Goal**: Update dashboard and task components with premium light theme, ensuring seamless visual transition from auth pages

**Independent Test**: Log in and access `/dashboard`, verify white background, task cards with shadows, purple action buttons, text truncation, and responsive layout across all breakpoints

### Implementation for User Story 3

- [x] T034 [US3] Update dashboard page with white background and black text in frontend/app/dashboard/page.tsx
- [x] T035 [US3] Update task list component with light theme styling in frontend/components/task-list.tsx
- [x] T036 [US3] Update task item component with white card and shadow depth in frontend/components/task-item.tsx
- [x] T037 [US3] Add text truncation with ellipsis for long task titles in frontend/components/task-item.tsx
- [x] T038 [US3] Add text truncation with ellipsis for long descriptions in frontend/components/task-item.tsx
- [x] T039 [US3] Style action buttons (add, edit, delete) with purple accent in frontend/components/task-item.tsx
- [x] T040 [US3] Update task form component with light theme styling in frontend/components/task-form.tsx
- [x] T041 [US3] Style form inputs with visible borders and purple focus states in frontend/components/task-form.tsx
- [x] T042 [US3] Style submit button with purple accent in frontend/components/task-form.tsx
- [x] T043 [US3] Implement responsive card layout for mobile (320-767px) in frontend/components/task-list.tsx
- [x] T044 [US3] Implement responsive card layout for tablet (768-1023px) in frontend/components/task-list.tsx
- [x] T045 [US3] Implement responsive card layout for desktop (1024px+) in frontend/components/task-list.tsx
- [x] T046 [US3] Verify card shadows render correctly (0 1px 3px rgba(0,0,0,0.1))
- [x] T047 [US3] Test text truncation with various title/description lengths
- [x] T048 [US3] Verify visual consistency with auth pages (seamless transition)
- [x] T049 [US3] Test todo CRUD operations work with new styling

**Checkpoint**: Dashboard complete and independently testable

---

## Phase 6: User Story 4 - Global Navigation & Footer Consistency (Priority: P4)

**Goal**: Validate and enhance header/footer consistency across all pages, ensuring seamless navigation experience

**Independent Test**: Navigate between landing, auth, and dashboard pages, verify header and footer maintain consistent styling, active link highlighting works, and conditional content displays correctly

### Implementation for User Story 4

- [x] T050 [US4] Verify header displays consistently on landing page
- [x] T051 [US4] Verify header displays consistently on sign-in page
- [x] T052 [US4] Verify header displays consistently on sign-up page
- [x] T053 [US4] Verify header displays consistently on dashboard page
- [x] T054 [US4] Implement active link highlighting with purple accent in frontend/components/header.tsx
- [x] T055 [US4] Add conditional user menu for authenticated users in frontend/components/header.tsx
- [x] T056 [US4] Add conditional CTA buttons (Sign In, Get Started) for guests in frontend/components/header.tsx
- [x] T057 [US4] Implement mobile hamburger menu in frontend/components/header.tsx
- [x] T058 [US4] Style mobile menu with light theme in frontend/components/header.tsx
- [x] T059 [US4] Verify footer displays consistently on all pages
- [x] T060 [US4] Test navigation between all pages (landing, auth, dashboard)
- [x] T061 [US4] Verify header/footer responsive behavior at all breakpoints
- [x] T062 [US4] Test mobile menu open/close functionality

**Checkpoint**: Global navigation complete and consistent across all pages

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, accessibility audit, and performance optimization

- [x] T063 [P] Run Lighthouse accessibility audit on landing page (target: 90+)
- [x] T064 [P] Run Lighthouse accessibility audit on sign-in page (target: 90+)
- [x] T065 [P] Run Lighthouse accessibility audit on sign-up page (target: 90+)
- [x] T066 [P] Run Lighthouse accessibility audit on dashboard page (target: 90+)
- [x] T067 [P] Verify WCAG AA contrast ratios on all pages using axe DevTools
- [x] T068 [P] Test keyboard navigation on all pages
- [x] T069 [P] Test screen reader compatibility (NVDA or VoiceOver)
- [x] T070 [P] Verify no FOUC (Flash of Unstyled Content) on page transitions
- [x] T071 [P] Run Lighthouse performance audit on all pages (target: 90+)
- [x] T072 [P] Test responsive layout on mobile devices (375px, 414px)
- [x] T073 [P] Test responsive layout on tablet devices (768px, 1024px)
- [x] T074 [P] Test responsive layout on desktop (1280px, 1920px)
- [x] T075 [P] Cross-browser testing on Chrome (latest)
- [x] T076 [P] Cross-browser testing on Firefox (latest)
- [x] T077 [P] Cross-browser testing on Safari (latest)
- [x] T078 [P] Cross-browser testing on Edge (latest)
- [x] T079 Verify page load times under 3 seconds on all pages
- [x] T080 Verify all functional requirements (FR-001 through FR-017) are met
- [x] T081 Verify all success criteria (SC-001 through SC-010) are met
- [x] T082 Run quickstart.md validation checklist
- [x] T083 Document any deviations or known issues

**Checkpoint**: Feature complete, validated, and ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Landing Page): Can start after Foundational
  - US2 (Auth Pages): Can start after Foundational (independent of US1)
  - US3 (Dashboard): Can start after Foundational (independent of US1, US2)
  - US4 (Global Consistency): Depends on US1, US2, US3 completion
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1, US2
- **User Story 4 (P4)**: Depends on US1, US2, US3 completion (validates consistency across all pages)

### Within Each User Story

- Landing page (US1): Smart routing logic → styling → responsive → testing
- Auth pages (US2): Page updates can be done in parallel → consistency check → responsive → testing
- Dashboard (US3): Page update → component updates (can be parallel) → responsive → testing
- Global consistency (US4): Validation tasks → enhancements → mobile menu → testing

### Parallel Opportunities

- **Phase 1 (Setup)**: T002 and T003 can run in parallel with T001
- **Phase 2 (Foundational)**: T004 and T005 can run in parallel
- **Phase 4 (US2)**: T020 and T021 can run in parallel (different pages)
- **Phase 4 (US2)**: T022-T027 can be grouped by page and run in parallel
- **Phase 7 (Polish)**: Most tasks marked [P] can run in parallel (different pages/tools)
- **User Stories**: US1, US2, US3 can be worked on in parallel by different team members after Foundational phase completes

---

## Parallel Example: User Story 2 (Auth Pages)

```bash
# Launch both page updates together:
Task: "Update sign-in page with white background and light theme in frontend/app/sign-in/page.tsx"
Task: "Update sign-up page with white background and light theme in frontend/app/sign-up/page.tsx"

# Then launch all input styling together:
Task: "Style input fields with visible light grey borders in frontend/app/sign-in/page.tsx"
Task: "Style input fields with visible light grey borders in frontend/app/sign-up/page.tsx"
Task: "Add focus states with purple accent border to inputs in frontend/app/sign-in/page.tsx"
Task: "Add focus states with purple accent border to inputs in frontend/app/sign-up/page.tsx"
```

---

## Parallel Example: Polish Phase

```bash
# Launch all Lighthouse audits together:
Task: "Run Lighthouse accessibility audit on landing page (target: 90+)"
Task: "Run Lighthouse accessibility audit on sign-in page (target: 90+)"
Task: "Run Lighthouse accessibility audit on sign-up page (target: 90+)"
Task: "Run Lighthouse accessibility audit on dashboard page (target: 90+)"

# Launch all cross-browser tests together:
Task: "Cross-browser testing on Chrome (latest)"
Task: "Cross-browser testing on Firefox (latest)"
Task: "Cross-browser testing on Safari (latest)"
Task: "Cross-browser testing on Edge (latest)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007) - CRITICAL
3. Complete Phase 3: User Story 1 (T008-T019)
4. **STOP and VALIDATE**: Test landing page independently
5. Deploy/demo if ready - MVP complete!

**MVP Deliverable**: Premium landing page with smart routing, consistent header/footer, full responsive support

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Auth pages updated)
4. Add User Story 3 → Test independently → Deploy/Demo (Dashboard updated)
5. Add User Story 4 → Test independently → Deploy/Demo (Global consistency validated)
6. Add Polish → Final validation → Production deployment

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T007)
2. Once Foundational is done:
   - Developer A: User Story 1 (T008-T019) - Landing page
   - Developer B: User Story 2 (T020-T033) - Auth pages
   - Developer C: User Story 3 (T034-T049) - Dashboard
3. After US1, US2, US3 complete:
   - Developer A: User Story 4 (T050-T062) - Global consistency
4. All developers: Polish phase (T063-T083) - parallel testing

---

## Task Summary

**Total Tasks**: 83 tasks

**Tasks per User Story**:
- Setup (Phase 1): 3 tasks
- Foundational (Phase 2): 4 tasks
- User Story 1 (P1): 12 tasks
- User Story 2 (P2): 14 tasks
- User Story 3 (P3): 16 tasks
- User Story 4 (P4): 13 tasks
- Polish (Phase 7): 21 tasks

**Parallel Opportunities**: 28 tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**:
- US1: Visit `/` as guest and authenticated user, verify design and routing
- US2: Visit `/sign-in` and `/sign-up`, verify design and form elements
- US3: Visit `/dashboard`, verify design and task components
- US4: Navigate between all pages, verify header/footer consistency

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 19 tasks

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No tests included (not requested in specification)
- Manual testing via Lighthouse, axe DevTools, and visual inspection
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All changes confined to `frontend/` directory (no backend modifications)
- Preserve all existing functionality (only visual changes)
