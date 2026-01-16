"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { listTasks } from "@/lib/api/tasks";
import { Task } from "@/types/task";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router, mounted]);

  const fetchTasks = async () => {
    if (!session) return;

    setTasksLoading(true);
    setTasksError(null);
    try {
      const response = await listTasks();
      setTasks(response.tasks);
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session]);

  if (isPending || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          <p className="mt-4 text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          My Tasks
        </h1>
        <p className="mt-2 text-foreground opacity-80">
          Manage your todo tasks efficiently
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TaskForm onTaskCreated={fetchTasks} />
        </div>

        <div className="lg:col-span-2">
          <TaskList
            tasks={tasks}
            loading={tasksLoading}
            error={tasksError}
            onUpdate={fetchTasks}
          />
        </div>
      </div>
    </div>
  );
}
