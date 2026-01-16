# Data Model: Global UI Overhaul & Landing Page

**Feature**: 04-landing-ui | **Date**: 2026-01-16 | **Phase**: 1 (Design)

## Overview

This feature is a **frontend-only visual redesign** that does not introduce new data models or modify existing database schemas. All data interactions use existing models and APIs.

## Existing Models Used

This feature interacts with the following existing data models:

### 1. User Model

**Source**: Backend (`backend/app/models/user.py`)
**Managed By**: Better Auth + Backend API

**Attributes** (relevant to this feature):
- `id` (UUID) - User identifier
- `email` (string) - User email address
- `name` (string, optional) - User display name
- `created_at` (timestamp) - Account creation date

**Usage in This Feature**:
- Authentication status checks (is user logged in?)
- Display user name in header/navigation
- Conditional routing based on authentication state

**No Changes Required**: This feature only reads user session data; no modifications to User model.

---

### 2. Session Model

**Source**: Better Auth (frontend `lib/auth-client.ts`)
**Managed By**: Better Auth library

**Attributes** (relevant to this feature):
- `user` (User object) - Authenticated user data
- `session` (Session object) - Session metadata
- `expiresAt` (timestamp) - Session expiration

**Usage in This Feature**:
- Smart routing logic (check if session exists)
- Conditional UI rendering (show user menu vs guest CTAs)
- Optimistic navigation decisions

**No Changes Required**: This feature uses existing Better Auth session management.

---

### 3. Task Model

**Source**: Backend (`backend/app/models/task.py`)
**Managed By**: Backend API

**Attributes** (relevant to this feature):
- `id` (UUID) - Task identifier
- `title` (string) - Task title
- `description` (string, optional) - Task description
- `completed` (boolean) - Completion status
- `user_id` (UUID) - Owner user ID
- `created_at` (timestamp) - Creation date
- `updated_at` (timestamp) - Last update date

**Usage in This Feature**:
- Display tasks in dashboard with new styling
- Text truncation for long titles/descriptions
- Visual indicators for completion status

**No Changes Required**: This feature only updates the visual presentation of tasks; no schema changes.

---

## Data Flow

### Authentication Flow

```
User Action → Better Auth Session Check → Conditional Routing
                                        ↓
                            Session Exists? → /dashboard
                            Session Missing? → /sign-in
```

**Implementation**: Client-side check using `useSession()` hook from Better Auth.

**No Backend Changes**: Uses existing Better Auth + JWT verification flow.

---

### Task Data Flow

```
Dashboard Load → GET /api/v1/tasks → Backend API → PostgreSQL
                                    ↓
                        Task List Component → Styled Cards
                                            ↓
                                    Text Truncation Applied
```

**Implementation**: Existing API calls with updated UI components.

**No Backend Changes**: Uses existing REST endpoints.

---

## State Management

### Client-Side State

**Authentication State**:
- Managed by Better Auth
- Accessed via `useSession()` hook
- Cached and revalidated automatically

**Task State**:
- Fetched from backend API
- Managed by React state (existing pattern)
- No changes to state management approach

**UI State**:
- Mobile menu open/closed (new)
- Text expansion state for truncated content (new)
- Managed by local component state

**No Global State Changes**: This feature does not introduce new global state management patterns.

---

## Validation Rules

### No New Validation Required

This feature does not modify data submission flows. Existing validation rules remain:

**User Registration** (existing):
- Email format validation
- Password strength requirements
- Handled by Better Auth

**Task Creation/Update** (existing):
- Title required (max 200 characters)
- Description optional (max 1000 characters)
- Handled by backend Pydantic models

**No Changes**: Visual redesign does not affect validation logic.

---

## Database Schema

### No Schema Changes

This feature does not require database migrations or schema modifications.

**Existing Tables Used**:
- `users` - User accounts (Better Auth managed)
- `tasks` - User tasks (backend managed)
- `sessions` - Auth sessions (Better Auth managed)

**Migration Status**: N/A - No migrations required

---

## API Contracts

### No New Endpoints

This feature uses existing REST API endpoints:

**Authentication**:
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `GET /api/auth/session` - Session check
- `POST /api/auth/sign-out` - User logout

**Tasks**:
- `GET /api/v1/tasks` - List user tasks
- `POST /api/v1/tasks` - Create task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task
- `PATCH /api/v1/tasks/:id/toggle` - Toggle completion

**No Changes**: All endpoints remain unchanged.

---

## Summary

**Data Model Status**: ✅ No new models required

This feature is purely a visual redesign that:
- Uses existing User, Session, and Task models
- Does not modify database schemas
- Does not introduce new API endpoints
- Does not change validation rules
- Does not alter data flow patterns

**Impact**: Frontend-only changes to styling, layout, and visual presentation.

**Next Steps**: Proceed to `quickstart.md` for developer implementation guide.
