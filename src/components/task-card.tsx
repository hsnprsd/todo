"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { CalendarDays, Check } from "lucide-react";
import type { Task } from "@/types/task";

export function formatDueDate(dueDate: string) {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dueDate}T00:00:00`));
}

export default function TaskCard({
  task,
  onToggle,
  onOpen,
  keepInPlace = false,
  showDueDate = true,
}: {
  task: Task;
  onToggle: (id: number) => void;
  onOpen: (task: Task) => void;
  keepInPlace?: boolean;
  showDueDate?: boolean;
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
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ layout: { duration: 0.2 } }}
    >
      <div
        ref={setNodeRef}
        style={{
          transform: isDragging && keepInPlace ? undefined : CSS.Transform.toString(transform),
          transition,
        }}
        {...attributes}
        {...listeners}
        className={`flex cursor-grab touch-none items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-2 py-2 shadow-sm shadow-black/20 transition-[border-color,box-shadow,opacity] hover:border-zinc-600 hover:shadow-md active:cursor-grabbing ${
          isDragging && !keepInPlace ? "z-10 opacity-50 shadow-lg" : ""
        }`}
      >
        <motion.button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? `فعال کردن ${task.title}` : `انجام‌شده علامت زدن ${task.title}`}
          title={task.completed ? "فعال کردن" : "انجام‌شده علامت زدن"}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.88 }}
          animate={{
            backgroundColor: task.completed ? "rgb(63 63 70)" : "rgba(0, 0, 0, 0)",
            color: task.completed ? "rgb(244 244 245)" : "rgb(161 161 170)",
          }}
          className="grid size-6 shrink-0 place-items-center rounded-md hover:bg-green-500/20 hover:text-green-400"
        >
          <motion.span animate={{ scale: task.completed ? [0.7, 1.2, 1] : 1 }}>
            <Check aria-hidden="true" className="size-3.5" />
          </motion.span>
        </motion.button>
        <button type="button" onClick={() => onOpen(task)} className="min-w-0 flex-1 text-right">
          <motion.span
            animate={{ opacity: task.completed ? 0.55 : 1 }}
            className={`block truncate text-sm ${task.completed ? "text-zinc-500 line-through" : "text-zinc-200"}`}
          >
            {task.title}
          </motion.span>
          {showDueDate && task.dueDate && (
            <span className={`mt-1 flex items-center gap-1 text-xs ${task.completed ? "text-zinc-500" : "text-zinc-400"}`}>
              <CalendarDays aria-hidden="true" className="size-3" />
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </button>
      </div>
    </motion.li>
  );
}

export function TaskCardPreview({ task, faded = false, showDueDate = true }: { task: Task; faded?: boolean; showDueDate?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: faded ? 0.5 : 1, scale: 1, rotate: faded ? 0 : -1 }}
      className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-2 py-2 shadow-lg shadow-black/20"
    >
      <span className={`grid size-6 shrink-0 place-items-center rounded-md ${task.completed ? "bg-zinc-700 text-zinc-100" : "text-zinc-400"}`}>
        <Check aria-hidden="true" className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1 text-right">
        <span className={`block truncate text-sm ${task.completed ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
          {task.title}
        </span>
        {showDueDate && task.dueDate && (
          <span className={`mt-1 flex items-center gap-1 text-xs ${task.completed ? "text-zinc-500" : "text-zinc-400"}`}>
            <CalendarDays aria-hidden="true" className="size-3" />
            {formatDueDate(task.dueDate)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
