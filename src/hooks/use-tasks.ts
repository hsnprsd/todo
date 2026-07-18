"use client";

import { useEffect, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { Task } from "@/types/task";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) throw new Error();
        setTasks((await response.json()) as Task[]);
      } catch {
        setError("بارگذاری کارها ممکن نشد. صفحه را تازه‌سازی کنید و دوباره تلاش کنید.");
      } finally {
        setIsLoading(false);
      }
    }
    void loadTasks();
  }, []);

  async function addTask(title: string, notes: string, dueDate: string) {
    if (!title.trim() || isSaving) return false;
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, notes, dueDate }),
      });
      if (!response.ok) throw new Error();
      const task = (await response.json()) as Task;
      setTasks((current) => [...current, task]);
      return true;
    } catch {
      setError("افزودن کار ممکن نشد. دوباره تلاش کنید.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateTask(id: number, title: string, notes: string, dueDate: string, completed: boolean) {
    if (!title.trim() || isSaving) return false;
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, notes, dueDate, completed }),
      });
      if (!response.ok) throw new Error();
      const updatedTask = (await response.json()) as Task;
      setTasks((current) => current.map((task) => task.id === id ? updatedTask : task));
      return true;
    } catch {
      setError("به‌روزرسانی کار ممکن نشد. دوباره تلاش کنید.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleTask(id: number) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const completed = !task.completed;
    setTasks((current) => current.map((item) => item.id === id ? { ...item, completed } : item));
    setError("");
    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed }),
      });
      if (!response.ok) throw new Error();
    } catch {
      setTasks((current) => current.map((item) => item.id === id ? task : item));
      setError("به‌روزرسانی کار ممکن نشد. دوباره تلاش کنید.");
    }
  }

  async function moveTaskToDate(id: number, dueDate: string) {
    const previous = tasks;
    setTasks((current) => current.map((task) => task.id === id ? { ...task, dueDate } : task));
    setError("");
    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, dueDate }),
      });
      if (!response.ok) throw new Error();
    } catch {
      setTasks(previous);
      setError("جابه‌جایی کار ممکن نشد. دوباره تلاش کنید.");
    }
  }

  async function reorderTasks(draggedId: number, targetId: number) {
    const draggedTask = tasks.find((task) => task.id === draggedId);
    const targetTask = tasks.find((task) => task.id === targetId);
    if (!draggedTask || !targetTask || draggedTask.completed !== targetTask.completed) return;

    const group = tasks.filter((task) => task.completed === draggedTask.completed);
    const reorderedGroup = arrayMove(
      group,
      group.findIndex((task) => task.id === draggedId),
      group.findIndex((task) => task.id === targetId),
    );
    let index = 0;
    const reordered = tasks.map((task) => task.completed === draggedTask.completed ? reorderedGroup[index++] : task);
    setTasks(reordered);
    setError("");
    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((task) => task.id) }),
      });
      if (!response.ok) throw new Error();
    } catch {
      setTasks(tasks);
      setError("مرتب‌سازی کارها ممکن نشد. دوباره تلاش کنید.");
    }
  }

  return {
    tasks,
    isLoading,
    isSaving,
    error,
    clearError: () => setError(""),
    addTask,
    updateTask,
    toggleTask,
    moveTaskToDate,
    reorderTasks,
  };
}
