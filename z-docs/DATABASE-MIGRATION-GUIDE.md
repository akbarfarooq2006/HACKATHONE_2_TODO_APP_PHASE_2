# Database Migration Guide

This guide explains how to set up and migrate your database whenever you change the `DATABASE_URL`.

## Quick Start

When you get a new database URL (e.g., Neon database expires):

1. **Update environment variables** in both `backend/.env` and `frontend/.env.local`
2. **Run migration script**:
   ```bash
   python migrate_database.py
   ```

That's it! The script will automatically create all required tables.

---

## Migration Commands

### Option 1: Python Script (Recommended)

**Check current database state** (no changes):
```bash
python migrate_database.py --check
```

**Migrate missing tables** (safe - won't drop existing data):
```bash
python migrate_database.py
```

**Force recreate all tables** (⚠️ WARNING: Deletes all data):
```bash
python migrate_database.py --force
```

**Show help**:
```bash
python migrate_database.py --help
```

### Option 2: Bash Script

```bash
./migrate_database.sh
```

This is a wrapper that calls the Python script using the backend virtual environment.

### Option 3: Manual Migration (Advanced)

If you prefer to run migrations manually:

```bash
cd backend
.venv/bin/python -c "
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv('.env')
engine = create_engine(os.getenv('DATABASE_URL'))

# Create Better Auth tables
with open('../schema.sql', 'r') as f:
    with engine.begin() as conn:
        conn.execute(text(f.read()))

# Create task table
with open('../specs/03-todo-crud/migrations/003_create_tasks_table.sql', 'r') as f:
    with engine.begin() as conn:
        conn.execute(text(f.read()))

print('✅ Migration complete')
"
```

---

## What Gets Created

The migration script creates **6 tables**:

### Better Auth Tables (5)
- `user` - User accounts
- `session` - User sessions
- `account` - OAuth accounts
- `verification` - Email verification tokens
- `jwks` - JSON Web Key Set for JWT verification

### Application Tables (1)
- `task` - Todo tasks with:
  - Foreign key: `task.user_id` → `user.id` (CASCADE DELETE)
  - Indexes: `idx_task_user_id`, `idx_task_created_at`, `idx_task_user_created`
  - Auto-update trigger for `updated_at` timestamp

---

## Common Scenarios

### Scenario 1: New Database (Empty)

When you have a fresh database with no tables:

```bash
python migrate_database.py
```

**Output:**
```
✅ Better Auth tables created
✅ Task table created
✅ All required tables present
```

### Scenario 2: Existing Database (All Tables Present)

When all tables already exist:

```bash
python migrate_database.py
```

**Output:**
```
✅ All tables already exist!
💡 Use --force to drop and recreate all tables
💡 Use --check to view current database state
```

### Scenario 3: Partial Migration (Some Tables Missing)

When some tables exist but others are missing:

```bash
python migrate_database.py
```

The script will:
- Skip existing tables
- Create only missing tables
- Show final state

### Scenario 4: Check Database State

To see what's currently in your database without making changes:

```bash
python migrate_database.py --check
```

**Output:**
```
📊 Current Database State
✓ Total tables: 6
   - account
   - jwks
   - session
   - task
   - user
   - verification

✅ All required tables present

📋 Task table schema:
   - id: text (NOT NULL)
   - title: character varying (NOT NULL)
   - description: text (NULL)
   - completed: boolean (NOT NULL)
   - user_id: text (NOT NULL)
   - created_at: timestamp with time zone (NOT NULL)
   - updated_at: timestamp with time zone (NOT NULL)
```

### Scenario 5: Fresh Start (Delete Everything)

⚠️ **WARNING: This deletes ALL data!**

When you want to start completely fresh:

```bash
python migrate_database.py --force
```

You'll be prompted to confirm:
```
⚠️  WARNING: This will delete ALL data in the database!
Type 'yes' to confirm:
```

---

## Step-by-Step: Changing Database URL

### 1. Get New Database URL

From Neon dashboard, copy your new connection string:
```
postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

### 2. Update Backend Environment

Edit `backend/.env`:
```bash
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
BETTER_AUTH_SECRET="your-secret-key-here"
```

### 3. Update Frontend Environment

Edit `frontend/.env.local`:
```bash
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Important:** Both files must have the **same** `DATABASE_URL` and `BETTER_AUTH_SECRET`.

### 4. Run Migration

```bash
python migrate_database.py
```

### 5. Verify Migration

Check that all tables were created:
```bash
python migrate_database.py --check
```

### 6. Start Servers

**Backend:**
```bash
cd backend
uv run uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 7. Test Application

1. Open browser: `http://localhost:3000`
2. Sign up with a new account
3. Create some tasks
4. Verify CRUD operations work

---

## Troubleshooting

### Error: "DATABASE_URL not found"

**Problem:** Environment variable not set.

**Solution:**
1. Check `backend/.env` exists
2. Verify `DATABASE_URL` is defined
3. Make sure there are no typos

### Error: "Connection refused"

**Problem:** Database URL is incorrect or database is not accessible.

**Solution:**
1. Verify the database URL is correct
2. Check if the database is running (for Neon, check if it's not paused)
3. Verify network connectivity

### Error: "already exists"

**Problem:** Tables already exist (this is usually fine).

**Solution:**
- The script will skip existing tables automatically
- If you want to recreate, use `--force` flag

### Error: "foreign key constraint"

**Problem:** Trying to create task table before user table.

**Solution:**
- Run the full migration script (it creates tables in correct order)
- Or use `--force` to drop and recreate all tables

---

## Migration Script Features

### ✅ Smart Detection
- Checks which tables exist
- Only creates missing tables
- Skips existing tables automatically

### ✅ Safe by Default
- Never drops tables unless you use `--force`
- Requires confirmation before deleting data
- Shows clear warnings

### ✅ Comprehensive Reporting
- Shows what was created
- Displays final database state
- Reports any errors clearly

### ✅ Flexible Options
- `--check`: View state without changes
- `--force`: Fresh start (with confirmation)
- `--help`: Show usage information

---

## Files

### Migration Scripts
- `migrate_database.py` - Main Python migration script
- `migrate_database.sh` - Bash wrapper script

### SQL Files
- `schema.sql` - Better Auth tables schema
- `specs/03-todo-crud/migrations/003_create_tasks_table.sql` - Task table migration
- `specs/03-todo-crud/migrations/003_create_tasks_table_rollback.sql` - Rollback script

### Environment Files
- `backend/.env` - Backend environment variables
- `frontend/.env.local` - Frontend environment variables

---

## Best Practices

1. **Always backup data** before using `--force`
2. **Check state first** with `--check` before migrating
3. **Keep environment files in sync** (same DATABASE_URL and BETTER_AUTH_SECRET)
4. **Test after migration** to ensure everything works
5. **Don't commit .env files** to version control (they're in .gitignore)

---

## Quick Reference

| Command | Description | Safe? |
|---------|-------------|-------|
| `python migrate_database.py` | Create missing tables | ✅ Yes |
| `python migrate_database.py --check` | View current state | ✅ Yes |
| `python migrate_database.py --force` | Drop and recreate all | ⚠️ No - Deletes data |
| `python migrate_database.py --help` | Show help | ✅ Yes |
| `./migrate_database.sh` | Run via bash wrapper | ✅ Yes |

---

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Verify environment variables are correct
3. Check database connectivity
4. Review error messages carefully

For database schema issues, refer to:
- `schema.sql` for Better Auth tables
- `specs/03-todo-crud/migrations/003_create_tasks_table.sql` for task table
