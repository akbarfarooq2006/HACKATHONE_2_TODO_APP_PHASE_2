-- Migration: Create tasks table for Todo Task Management feature
-- Feature: 03-todo-crud
-- Date: 2026-01-16
-- Description: Creates task table with user_id foreign key, indexes, and auto-update trigger

-- Create task table
CREATE TABLE IF NOT EXISTS task (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(200) NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint with cascade delete
    CONSTRAINT fk_task_user FOREIGN KEY (user_id)
        REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_task_user_id ON task(user_id);
CREATE INDEX IF NOT EXISTS idx_task_created_at ON task(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_user_created ON task(user_id, created_at DESC);

-- Create trigger function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_task_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before updates
CREATE TRIGGER trigger_update_task_updated_at
    BEFORE UPDATE ON task
    FOR EACH ROW
    EXECUTE FUNCTION update_task_updated_at();

-- Verify table creation
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'task'
    ) THEN
        RAISE NOTICE 'Task table created successfully';
    ELSE
        RAISE EXCEPTION 'Task table creation failed';
    END IF;
END $$;
