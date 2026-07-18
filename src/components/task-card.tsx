"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, Check } from "lucide-react";
import type { Task } from "@/types/task";

export function formatDueDate(dueDate: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dueDate}T00:00:00`));
}

export default function TaskCard({
  task,
  onToggle,
  onOpen,
}: {
  task: Task;
  onToggle: (id: number) => void;
  onOpen: (task: Task) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`flex cursor-grab touch-none items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-2 py-2 shadow-sm shadow-black/20 transition-colors hover:border-zinc-600 active:cursor-grabbing ${
        isDragging ? "z-10 opacity-70 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
        title={`Mark as ${task.completed ? "incomplete" : "complete"}`}
        className={`grid size-6 shrink-0 place-items-center rounded-md transition-colors hover:bg-green-500/20 hover:text-green-400 ${
          task.completed ? "bg-zinc-700 text-zinc-100" : "text-zinc-400"
        }`}
      >
        <Check aria-hidden="true" className="size-3.5" />
      </button>
      <button type="button" onClick={() => onOpen(task)} className="min-w-0 flex-1 text-left">
        <span className={`block truncate text-sm ${task.completed ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
          {task.title}
        </span>
        {task.dueDate && (
          <span className={`mt-1 flex items-center gap-1 text-xs ${task.completed ? "text-zinc-500" : "text-zinc-400"}`}>
            <CalendarDays aria-hidden="true" className="size-3" />
            {formatDueDate(task.dueDate)}
          </span>
        )}
      </button>
    </li>
  );
}
