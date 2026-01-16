-- Rollback Migration: Drop tasks table
-- Feature: 03-todo-crud
-- Date: 2026-01-16
-- Description: Rolls back the task table creation by dropping the table, trigger, and function

-- Drop trigger
DROP TRIGGER IF EXISTS trigger_update_task_updated_at ON task;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_task_updated_at();

-- Drop indexes (will be dropped automatically with table, but explicit for clarity)
DROP INDEX IF EXISTS idx_task_user_created;
DROP INDEX IF EXISTS idx_task_created_at;
DROP INDEX IF EXISTS idx_task_user_id;

-- Drop task table (CASCADE will drop foreign key constraints)
DROP TABLE IF EXISTS task CASCADE;

-- Verify table dropped
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'task'
    ) THEN
        RAISE NOTICE 'Task table dropped successfully';
    ELSE
        RAISE EXCEPTION 'Task table drop failed';
    END IF;
END $$;
