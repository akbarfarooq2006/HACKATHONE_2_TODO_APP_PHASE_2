# Quick Migration Reference

## When Database URL Changes

**One command to set up everything:**

```bash
python migrate_database.py
```

That's it! This will:
- ✅ Create all Better Auth tables (user, session, account, verification, jwks)
- ✅ Create task table with proper foreign keys and indexes
- ✅ Skip tables that already exist (safe to run multiple times)
- ✅ Show you the final database state

---

## Common Commands

```bash
# Check what's in your database (no changes)
python migrate_database.py --check

# Create missing tables (safe - won't delete data)
python migrate_database.py

# Start fresh (⚠️ DELETES ALL DATA - asks for confirmation)
python migrate_database.py --force

# Show help
python migrate_database.py --help
```

---

## Quick Setup After New Database URL

1. **Update `backend/.env`:**
   ```bash
   DATABASE_URL="your_new_neon_url_here"
   ```

2. **Update `frontend/.env.local`:**
   ```bash
   DATABASE_URL="your_new_neon_url_here"
   ```

3. **Run migration:**
   ```bash
   python migrate_database.py
   ```

4. **Start servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && uv run uvicorn app.main:app --reload

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Open browser:** http://localhost:3000

---

## What Gets Created

- **6 tables total**
- **5 Better Auth tables:** user, session, account, verification, jwks
- **1 Application table:** task (with foreign keys, indexes, triggers)

---

## Need More Details?

See [DATABASE-MIGRATION-GUIDE.md](./DATABASE-MIGRATION-GUIDE.md) for:
- Detailed explanations
- Troubleshooting guide
- Step-by-step instructions
- All available options

---

## Files Created

- `migrate_database.py` - Main migration script (Python)
- `migrate_database.sh` - Bash wrapper script
- `DATABASE-MIGRATION-GUIDE.md` - Comprehensive guide
- `MIGRATION-QUICK-REF.md` - This file
