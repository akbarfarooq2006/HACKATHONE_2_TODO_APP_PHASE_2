"use client";

/**
 * TaskItem component - displays a single task with inline editing and actions.
 */

import { useState } from "react";
import { Task } from "@/types/task";
import { updateTask, deleteTask } from "@/lib/api/tasks";

interface TaskItemProps {
  task: Task;
  onUpdate: () => void;
  onDelete: () => void;
}

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleComplete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await updateTask(task.id, { completed: !task.completed });
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setError("Title cannot be empty");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await updateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setIsEditing(false);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteTask(task.id);
      onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      setShowDeleteConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className={`border rounded-lg p-4 shadow-card transition-all ${
      task.completed
        ? "bg-green-50 border-green-200"
        : "bg-background border-border"
    }`}>
      {isEditing ? (
        // Edit mode
        <div className="space-y-3">
          <div>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              placeholder="Task title"
              maxLength={200}
              disabled={isLoading}
            />
            <div className="text-xs text-foreground opacity-60 mt-1">
              {editTitle.length}/200 characters
            </div>
          </div>
          <div>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-border rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              placeholder="Task description (optional)"
              rows={3}
              maxLength={2000}
              disabled={isLoading}
            />
            <div className="text-xs text-foreground opacity-60 mt-1">
              {editDescription.length}/2000 characters
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={isLoading}
              className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isLoading}
              className="px-4 py-2 border border-border text-foreground rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // View mode
        <div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggleComplete}
              disabled={isLoading}
              className="mt-1 h-5 w-5 rounded border-border text-accent focus:ring-accent"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`text-lg font-medium truncate ${
                    task.completed ? "line-through text-foreground opacity-40" : "text-foreground"
                  }`}
                  title={task.title}
                >
                  {task.title}
                </h3>
                {task.completed && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white whitespace-nowrap">
                    Completed
                  </span>
                )}
              </div>
              {task.description && (
                <p
                  className={`mt-1 text-sm truncate ${
                    task.completed ? "line-through text-foreground opacity-40" : "text-foreground opacity-80"
                  }`}
                  title={task.description}
                >
                  {task.description}
                </p>
              )}
              <div className="mt-2 text-xs text-foreground opacity-60">
                Created: {new Date(task.created_at).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
                className="p-2 text-foreground hover:text-accent disabled:opacity-50 transition-colors"
                title="Edit task"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="p-2 text-foreground hover:text-red-600 disabled:opacity-50 transition-colors"
                title="Delete task"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600">{error}</div>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Task</h3>
            <p className="text-foreground opacity-80 mb-4">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            {error && (
              <div className="mb-4 text-sm text-red-600">{error}</div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 border border-border text-foreground rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
