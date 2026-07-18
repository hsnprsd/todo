"use client";

import { CalendarDays, X } from "lucide-react";
import { formatDueDate } from "@/components/task-card";
import type { Task } from "@/types/task";

export default function TaskDetailsModal({ task, onClose }: { task: Task; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="task-details-title" onKeyDown={(event) => event.key === "Escape" && onClose()} className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/40">
        <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h2 id="task-details-title" className="text-lg font-semibold">Task details</h2>
          <button type="button" autoFocus onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>
        <div className="space-y-5 px-5 py-5">
          <Detail label="Title"><p className="text-zinc-100">{task.title}</p></Detail>
          <Detail label="Notes"><p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">{task.notes || "No notes"}</p></Detail>
          <Detail label="Due date">
            <p className="flex items-center gap-2 text-sm text-zinc-300"><CalendarDays aria-hidden="true" className="size-4 text-zinc-500" />{task.dueDate ? formatDueDate(task.dueDate) : "No due date"}</p>
          </Detail>
          <Detail label="Status"><p className="text-sm text-zinc-300">{task.completed ? "Completed" : "Active"}</p></Detail>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>{children}</div>;
}
