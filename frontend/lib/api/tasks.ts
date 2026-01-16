/**
 * Task API client functions.
 *
 * All functions automatically include session token from cookies.
 */

import { Task, TaskListResponse, CreateTaskRequest, UpdateTaskRequest } from "@/types/task";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get session token from cookies.
 */
function getSessionToken(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "better-auth.session_data") {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * List all tasks for the authenticated user.
 */
export async function listTasks(): Promise<TaskListResponse> {
  const token = getSessionToken();

  const response = await fetch(`${API_BASE_URL}/api/v1/tasks`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Not authenticated");
    }
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new task.
 */
export async function createTask(data: CreateTaskRequest): Promise<Task> {
  const token = getSessionToken();

  const response = await fetch(`${API_BASE_URL}/api/v1/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Not authenticated");
    }
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.detail || "Invalid task data");
    }
    throw new Error(`Failed to create task: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a specific task by ID.
 */
export async function getTask(taskId: string): Promise<Task> {
  const token = getSessionToken();

  const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${taskId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Not authenticated");
    }
    if (response.status === 404) {
      throw new Error("Task not found");
    }
    throw new Error(`Failed to fetch task: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update a task.
 */
export async function updateTask(taskId: string, data: UpdateTaskRequest): Promise<Task> {
  const token = getSessionToken();

  const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Not authenticated");
    }
    if (response.status === 404) {
      throw new Error("Task not found");
    }
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.detail || "Invalid task data");
    }
    throw new Error(`Failed to update task: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a task.
 */
export async function deleteTask(taskId: string): Promise<void> {
  const token = getSessionToken();

  const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Not authenticated");
    }
    if (response.status === 404) {
      throw new Error("Task not found");
    }
    throw new Error(`Failed to delete task: ${response.statusText}`);
  }
}
