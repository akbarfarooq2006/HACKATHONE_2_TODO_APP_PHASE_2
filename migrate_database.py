#!/usr/bin/env python3
"""
Database Migration Script
Run this script whenever you change the DATABASE_URL to set up all required tables.

Usage:
    python migrate_database.py              # Check and migrate if needed
    python migrate_database.py --force      # Drop and recreate all tables
    python migrate_database.py --check      # Only check current state

Options:
    --force     Drop all existing tables and recreate from scratch
    --check     Only check current database state without making changes
    --help      Show this help message
"""

from sqlalchemy import create_engine, text
import os
import sys
from pathlib import Path

def load_env_file(env_path):
    """Load environment variables from .env file."""
    if not os.path.exists(env_path):
        print(f"❌ Error: {env_path} not found")
        return False

    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                value = value.strip('"').strip("'")
                os.environ[key] = value
    return True

def check_database_state(engine):
    """Check current database state and return table list."""
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema='public'
            ORDER BY table_name
        """))
        return [row[0] for row in result]

def drop_all_tables(engine):
    """Drop all tables in the database."""
    print("\n⚠️  WARNING: This will delete ALL data in the database!")
    response = input("Type 'yes' to confirm: ")

    if response.lower() != 'yes':
        print("❌ Aborted by user")
        sys.exit(0)

    print("\n🗑️  Dropping all tables...")
    with engine.begin() as conn:
        # Drop tables in correct order (respecting foreign keys)
        tables_to_drop = ['task', 'session', 'account', 'verification', 'jwks', 'user']
        for table in tables_to_drop:
            try:
                conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
                print(f"   ✓ Dropped {table}")
            except Exception as e:
                print(f"   ⚠️  Could not drop {table}: {e}")

def create_better_auth_tables(engine, schema_path):
    """Create Better Auth tables."""
    print("\n📝 Creating Better Auth tables...")

    with open(schema_path, 'r') as f:
        schema_sql = f.read()

    try:
        with engine.begin() as conn:
            conn.execute(text(schema_sql))
        print("✅ Better Auth tables created:")
        print("   - user")
        print("   - session")
        print("   - account")
        print("   - verification")
        print("   - jwks")
        return True
    except Exception as e:
        if "already exists" in str(e):
            print("ℹ️  Better Auth tables already exist (skipping)")
            return True
        else:
            print(f"❌ Error creating Better Auth tables: {e}")
            return False

def create_task_table(engine, migration_path):
    """Create task table with proper error handling."""
    print("\n📝 Creating task table...")

    with open(migration_path, 'r') as f:
        migration_sql = f.read()

    try:
        with engine.begin() as conn:
            conn.execute(text(migration_sql))
        print("✅ Task table created with:")
        print("   - Foreign key: task.user_id → user.id")
        print("   - Indexes: idx_task_user_id, idx_task_created_at, idx_task_user_created")
        print("   - Auto-update trigger for updated_at")
        return True
    except Exception as e:
        error_msg = str(e)
        if "already exists" in error_msg:
            print("ℹ️  Task table already exists (skipping)")
            return True
        else:
            print(f"❌ Error creating task table: {e}")
            return False

def show_database_state(engine):
    """Display current database state."""
    print("\n" + "=" * 60)
    print("📊 Current Database State")
    print("=" * 60)

    tables = check_database_state(engine)

    if not tables:
        print("\n⚠️  Database is empty - no tables found")
        return False

    print(f"\n✓ Total tables: {len(tables)}")
    for table in tables:
        print(f"   - {table}")

    # Check for required tables
    required_tables = ['user', 'session', 'account', 'verification', 'jwks', 'task']
    missing_tables = [t for t in required_tables if t not in tables]

    if missing_tables:
        print(f"\n⚠️  Missing tables: {', '.join(missing_tables)}")
        return False
    else:
        print("\n✅ All required tables present")

        # Show task table schema
        print("\n📋 Task table schema:")
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'task'
                ORDER BY ordinal_position
            """))
            for row in result:
                nullable = 'NULL' if row[2] == 'YES' else 'NOT NULL'
                print(f"   - {row[0]}: {row[1]} ({nullable})")

        return True

def run_migrations(force=False, check_only=False):
    """Run all database migrations."""

    project_root = Path(__file__).parent

    print("=" * 60)
    print("🔄 Database Migration Script")
    print("=" * 60)

    # Load environment
    env_path = project_root / "backend" / ".env"
    print(f"\n📂 Loading environment from: {env_path}")

    if not load_env_file(env_path):
        sys.exit(1)

    DATABASE_URL = os.getenv('DATABASE_URL')
    if not DATABASE_URL:
        print("❌ Error: DATABASE_URL not found in backend/.env")
        sys.exit(1)

    # Mask password for display
    display_url = DATABASE_URL
    if '@' in display_url:
        parts = display_url.split('@')
        if ':' in parts[0]:
            user_pass = parts[0].split(':')
            display_url = f"{user_pass[0]}:****@{parts[1]}"

    print(f"🔗 Database: {display_url[:60]}...")

    try:
        engine = create_engine(DATABASE_URL)

        # Check current state
        current_tables = check_database_state(engine)

        if check_only:
            show_database_state(engine)
            return

        # Force mode: drop and recreate
        if force:
            drop_all_tables(engine)
            current_tables = []

        # Determine what needs to be created
        needs_better_auth = not all(t in current_tables for t in ['user', 'session', 'account', 'verification', 'jwks'])
        needs_task = 'task' not in current_tables

        if not needs_better_auth and not needs_task:
            print("\n✅ All tables already exist!")
            show_database_state(engine)
            print("\n💡 Use --force to drop and recreate all tables")
            print("💡 Use --check to view current database state")
            return

        # Create Better Auth tables if needed
        if needs_better_auth or force:
            # Use schema-fixed.sql which has the correct Better Auth schema
            schema_path = project_root / "schema-fixed.sql"
            if not schema_path.exists():
                # Fallback to schema.sql if schema-fixed.sql doesn't exist
                schema_path = project_root / "schema.sql"
                print("⚠️  Warning: Using schema.sql (may have outdated schema)")

            if not schema_path.exists():
                print(f"❌ Error: {schema_path} not found")
                sys.exit(1)

            if not create_better_auth_tables(engine, schema_path):
                sys.exit(1)

        # Create task table if needed
        if needs_task or force:
            task_migration_path = project_root / "specs" / "03-todo-crud" / "migrations" / "003_create_tasks_table.sql"
            if not task_migration_path.exists():
                print(f"❌ Error: {task_migration_path} not found")
                sys.exit(1)

            if not create_task_table(engine, task_migration_path):
                sys.exit(1)

        # Show final state
        show_database_state(engine)

        print("\n" + "=" * 60)
        print("✅ Migration completed successfully!")
        print("=" * 60)
        print("\n🚀 Next steps:")
        print("   1. Start backend:  cd backend && uv run uvicorn app.main:app --reload")
        print("   2. Start frontend: cd frontend && npm run dev")
        print("   3. Open browser:   http://localhost:3000")

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    # Parse command line arguments
    force = '--force' in sys.argv
    check_only = '--check' in sys.argv
    show_help = '--help' in sys.argv or '-h' in sys.argv

    if show_help:
        print(__doc__)
        sys.exit(0)

    run_migrations(force=force, check_only=check_only)
