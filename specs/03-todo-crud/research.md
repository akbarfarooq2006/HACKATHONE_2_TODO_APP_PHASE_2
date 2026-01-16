# Research: Todo Task Management

**Feature**: 03-todo-crud | **Date**: 2026-01-09 | **Phase**: 0 (Research)

## Purpose

This document captures technical research and decisions made during the planning phase for the Todo Task Management feature. All decisions are based on existing Phase 2 infrastructure and constitutional requirements.

## Research Questions & Decisions

### 1. Task Model Design

**Question**: How should we structure the Task model to ensure data integrity and efficient querying?

**Decision**: SQLModel with user_id foreign key constraint

**Rationale**:
- Maintains referential integrity at database level (tasks cannot exist without valid user)
- Leverages existing Phase 2 user model and database connection
- Supports efficient filtering by user_id with database indexes
- SQLModel provides both ORM and Pydantic validation in single model
- Consistent with Phase 2 User and Session models

**Alternatives Considered**:
1. **Separate task service with user reference by ID only** (no FK constraint)
   - Rejected: Loses referential integrity, orphaned tasks possible, manual cleanup required
2. **Embedded tasks in user document** (NoSQL-style)
   - Rejected: Violates monorepo architecture (PostgreSQL required), poor scalability for large task lists
3. **Separate tasks database**
   - Rejected: Adds complexity, violates Phase 2 shared database principle, complicates transactions

**Implementation Notes**:
- Use UUID for task.id (consistent with user.id)
- Add ON DELETE CASCADE to foreign key (when user deleted, tasks auto-deleted)
- Create index on user_id for query performance
- Create index on created_at for ordering performance

---

### 2. API Endpoint Structure

**Question**: What API design pattern should we use for task operations?

**Decision**: RESTful endpoints at `/api/v1/tasks` following REST conventions

**Rationale**:
- Consistent with Phase 2 API structure (`/api/v1/auth`, `/api/v1/health`)
- Standard HTTP methods map naturally to CRUD operations
- Resource-oriented design is intuitive and well-documented
- URL path versioning (`/api/v1/`) allows future API evolution
- Stateless design aligns with constitutional API-First principle

**Alternatives Considered**:
1. **GraphQL**
   - Rejected: Adds significant complexity (schema, resolvers, client library)
   - Rejected: Overkill for simple CRUD operations
   - Rejected: Not needed for this use case (no complex nested queries)
2. **RPC-style endpoints** (e.g., `/api/v1/createTask`, `/api/v1/deleteTask`)
   - Rejected: Less standard than REST
   - Rejected: Doesn't leverage HTTP methods semantically
   - Rejected: Harder to cache and reason about

**Endpoint Mapping**:
- `GET /api/v1/tasks` → List all user's tasks
- `POST /api/v1/tasks` → Create new task
- `GET /api/v1/tasks/{id}` → Get specific task
- `PATCH /api/v1/tasks/{id}` → Update task (partial update)
- `DELETE /api/v1/tasks/{id}` → Delete task

**Implementation Notes**:
- Use PATCH (not PUT) for updates to support partial updates
- Return 201 Created for POST with Location header
- Return 204 No Content for DELETE (no response body)
- Use standard HTTP status codes (200, 201, 400, 401, 403, 404, 500)

---

### 3. Frontend State Management

**Question**: What state management approach should we use for task list and operations?

**Decision**: React hooks (useState, useEffect) with optimistic updates

**Rationale**:
- Simple and sufficient for single-user task list management
- No additional dependencies required (React hooks built-in)
- Optimistic updates provide instant feedback (better UX)
- Easy to implement error handling and rollback
- Consistent with Phase 2 dashboard implementation

**Alternatives Considered**:
1. **Redux or Zustand** (global state management)
   - Rejected: Overkill for single-user task list (no complex shared state)
   - Rejected: Adds dependency and boilerplate
   - Rejected: Not needed for this feature scope
2. **React Query / TanStack Query**
   - Rejected: Adds dependency (not in Phase 2 stack)
   - Rejected: Caching not critical for personal task list
   - Rejected: Simple fetch + useState is sufficient
3. **Server Components only** (no client state)
   - Rejected: Requires full page refresh for every operation (poor UX)
   - Rejected: Doesn't support optimistic updates or inline editing

**Implementation Pattern**:
```typescript
const [tasks, setTasks] = useState<Task[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Optimistic update pattern
const deleteTask = async (id: string) => {
  const originalTasks = [...tasks];
  setTasks(tasks.filter(t => t.id !== id)); // Optimistic
  try {
    await api.deleteTask(id);
  } catch (err) {
    setTasks(originalTasks); // Rollback on error
    setError('Failed to delete task');
  }
};
```

---

### 4. Inline Editing Implementation

**Question**: How should we implement inline editing with pencil button trigger?

**Decision**: Component state toggle between view/edit modes with save/cancel buttons

**Rationale**:
- Matches clarification requirement (pencil button → inline edit → save/cancel)
- Standard pattern used in modern task apps (Todoist, Asana, Trello)
- Good UX: edit in place without navigation or modal
- Simple to implement with component state
- Supports keyboard shortcuts (Enter to save, Escape to cancel)

**Alternatives Considered**:
1. **Modal dialog for editing**
   - Rejected: Violates clarification requirement for inline editing
   - Rejected: Requires extra click to open/close modal (slower workflow)
2. **contentEditable HTML attribute**
   - Rejected: Harder to control and validate
   - Rejected: Accessibility issues
   - Rejected: Difficult to handle save/cancel cleanly
3. **Always-editable fields** (no view mode)
   - Rejected: Confusing UX (when is it saving?)
   - Rejected: Accidental edits more likely

**Implementation Pattern**:
```typescript
const [isEditing, setIsEditing] = useState(false);
const [editTitle, setEditTitle] = useState(task.title);
const [editDescription, setEditDescription] = useState(task.description);

const handleSave = async () => {
  await api.updateTask(task.id, { title: editTitle, description: editDescription });
  setIsEditing(false);
};

const handleCancel = () => {
  setEditTitle(task.title); // Reset to original
  setEditDescription(task.description);
  setIsEditing(false);
};
```

---

### 5. Delete Confirmation Pattern

**Question**: How should we implement delete confirmation to prevent accidental deletion?

**Decision**: Modal dialog with confirm/cancel buttons

**Rationale**:
- Matches clarification requirement (confirmation dialog before deletion)
- Standard pattern for destructive actions
- Prevents accidental deletion (especially important since no undo/archive)
- Clear and unambiguous user intent required
- Accessible and keyboard-navigable

**Alternatives Considered**:
1. **Undo toast notification** (delete immediately, show undo for 5 seconds)
   - Rejected: Doesn't match clarification requirement for confirmation
   - Rejected: More complex to implement (requires temporary storage)
   - Rejected: Risk of permanent deletion if user doesn't notice toast
2. **No confirmation** (delete immediately)
   - Rejected: Violates clarification requirement
   - Rejected: High risk of accidental data loss
   - Rejected: Poor UX for destructive action
3. **Double-click to delete**
   - Rejected: Not discoverable (users won't know to double-click)
   - Rejected: Still allows accidental deletion

**Implementation Pattern**:
```typescript
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

const handleDeleteClick = (taskId: string) => {
  setTaskToDelete(taskId);
  setShowDeleteConfirm(true);
};

const handleConfirmDelete = async () => {
  if (taskToDelete) {
    await api.deleteTask(taskToDelete);
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  }
};
```

---

### 6. Task Ordering Strategy

**Question**: How should we order tasks in the list?

**Decision**: ORDER BY created_at DESC in SQL query (newest first)

**Rationale**:
- Matches clarification requirement (creation date, newest first, stable ordering)
- Efficient database operation (single ORDER BY clause)
- Stable ordering (doesn't change when tasks edited or completed)
- Predictable UX (new tasks always appear at top)
- Leverages database index on created_at

**Alternatives Considered**:
1. **Client-side sorting** (fetch all, sort in JavaScript)
   - Rejected: Less efficient (sorting in application layer)
   - Rejected: Wastes bandwidth (can't leverage database indexes)
2. **ORDER BY updated_at DESC** (most recently modified first)
   - Rejected: Violates clarification requirement
   - Rejected: Unstable ordering (list shuffles when tasks edited)
   - Rejected: Confusing UX (tasks jump around)
3. **Manual ordering** (user-defined order with drag-and-drop)
   - Rejected: Out of scope (not in requirements)
   - Rejected: Adds complexity (requires order field and update logic)

**Implementation**:
```python
# Backend query
statement = (
    select(Task)
    .where(Task.user_id == current_user.id)
    .order_by(Task.created_at.desc())
)
tasks = db.exec(statement).all()
```

---

### 7. Session Token Verification

**Question**: How should we verify session tokens for task API endpoints?

**Decision**: Reuse existing `get_current_user` dependency from Phase 2

**Rationale**:
- Already implemented, tested, and working in Phase 2
- Maintains consistency across all protected endpoints
- No code duplication
- Proven security model (session token → database lookup → user object)
- Follows DRY principle

**Alternatives Considered**:
1. **New verification logic specific to tasks**
   - Rejected: Duplicates existing code
   - Rejected: Increases maintenance burden
   - Rejected: Risk of inconsistency between endpoints
2. **JWT verification** (decode token directly)
   - Rejected: Phase 2 uses session tokens (not JWT)
   - Rejected: Would require architectural change
3. **API key authentication**
   - Rejected: Violates Phase 2 authentication architecture
   - Rejected: Less secure for user-specific operations

**Implementation**:
```python
from app.auth.dependencies import get_current_user

@router.get("/tasks")
async def list_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # current_user is already authenticated and validated
    tasks = db.exec(
        select(Task).where(Task.user_id == current_user.id)
    ).all()
    return tasks
```

---

### 8. Error Handling Strategy

**Question**: How should we handle and communicate errors to the frontend?

**Decision**: HTTP status codes + JSON error responses with descriptive messages

**Rationale**:
- RESTful standard approach
- Consistent with Phase 2 error handling
- Easy to handle in frontend (check response.status)
- Descriptive messages help debugging and user feedback
- Supports internationalization (error messages can be translated)

**Alternatives Considered**:
1. **Custom error codes** (e.g., ERR_TASK_001)
   - Rejected: Less standard than HTTP status codes
   - Rejected: Requires documentation of all error codes
   - Rejected: Harder for frontend to handle generically
2. **Exceptions only** (no structured error responses)
   - Rejected: Poor client experience (generic 500 errors)
   - Rejected: Harder to debug
   - Rejected: No way to distinguish error types

**Error Response Format**:
```json
{
  "detail": "Task not found",
  "error_code": "TASK_NOT_FOUND",
  "status_code": 404
}
```

**Status Code Mapping**:
- 200: Success (GET, PATCH)
- 201: Created (POST)
- 204: No Content (DELETE)
- 400: Bad Request (validation errors, empty title, etc.)
- 401: Unauthorized (missing or invalid session token)
- 403: Forbidden (attempting to access another user's task)
- 404: Not Found (task ID doesn't exist)
- 500: Internal Server Error (unexpected errors)

---

## Technology Stack Validation

### Frontend Dependencies (No Changes Required)

All required frontend technologies already exist in Phase 2:
- ✅ Next.js 16.1.1 (App Router)
- ✅ React 19
- ✅ TypeScript 5.x (strict mode)
- ✅ Tailwind CSS 3.x
- ✅ Better Auth client

**No new npm packages needed.**

### Backend Dependencies (No Changes Required)

All required backend technologies already exist in Phase 2:
- ✅ FastAPI 0.128.0
- ✅ SQLModel 0.0.31
- ✅ Python 3.12+
- ✅ uvicorn 0.40.0
- ✅ psycopg2-binary (PostgreSQL driver)
- ✅ pydantic-settings

**No new pip packages needed.**

### Database (No Changes Required)

- ✅ Neon PostgreSQL (serverless)
- ✅ Shared database with user and session tables
- ✅ Connection string in environment variables

**Only requires new table creation (migration script).**

---

## Performance Considerations

### Database Indexes

**Required Indexes**:
1. `task.user_id` - For efficient filtering by user (most common query)
2. `task.created_at` - For efficient ordering (every list query)
3. `task.id` - Primary key (automatic)

**Query Performance**:
- List query: `SELECT * FROM task WHERE user_id = ? ORDER BY created_at DESC`
  - Uses index on user_id (filter) + index on created_at (sort)
  - Expected: <50ms for 500 tasks
- Get by ID: `SELECT * FROM task WHERE id = ? AND user_id = ?`
  - Uses primary key index
  - Expected: <10ms

### Frontend Performance

**Optimization Strategies**:
1. **Optimistic updates**: Instant UI feedback, rollback on error
2. **Debounced inline editing**: Wait 300ms after typing before enabling save
3. **Memoization**: Use React.memo for TaskItem components (prevent unnecessary re-renders)
4. **Virtual scrolling**: Not needed (max 500 tasks, modern browsers handle easily)

**Expected Performance**:
- Initial load: <2 seconds (100 tasks)
- Create task: <1 second (optimistic update)
- Toggle complete: <500ms (optimistic update)
- Delete task: <1 second (optimistic update)

---

## Security Considerations

### Zero-Trust Architecture

**Enforcement Points**:
1. **Backend**: Every endpoint uses `get_current_user` dependency
2. **Database**: All queries filter by `user_id = current_user.id`
3. **Validation**: Ownership check before update/delete operations
4. **Response**: Never include other users' data in responses

**Security Tests Required**:
- ✅ User A cannot list User B's tasks
- ✅ User A cannot get User B's task by ID
- ✅ User A cannot update User B's task
- ✅ User A cannot delete User B's task
- ✅ Unauthenticated requests return 401
- ✅ Invalid session tokens return 401

### Input Validation

**Backend Validation** (Pydantic/SQLModel):
- Title: Required, non-empty, max 200 characters
- Description: Optional, max 2000 characters
- Completed: Boolean only
- User ID: Derived from session token (never from request body)

**Frontend Validation**:
- Title: Required, show error if empty
- Description: Optional, character count display
- Trim whitespace before submission

---

## Conclusion

All research questions resolved. No new dependencies required. Implementation can proceed using existing Phase 2 infrastructure with minimal additions (Task model, 5 API endpoints, 4 UI components).

**Ready for Phase 1**: Data model design and API contract definition.
