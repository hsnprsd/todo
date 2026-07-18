"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import PersianDatePicker from "@/components/persian-date-picker";
import type { Task } from "@/types/task";

export default function TaskDetailsModal({
  task,
  error,
  isSaving,
  onClose,
  onSave,
  onDelete,
}: {
  task: Task;
  error: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (title: string, notes: string, dueDate: string, completed: boolean) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [completed, setCompleted] = useState(task.completed);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const lastQueuedSave = useRef(JSON.stringify([task.title, task.notes ?? "", task.dueDate ?? "", task.completed]));

  const saveChanges = useCallback((nextTitle: string, nextNotes: string, nextDueDate: string, nextCompleted: boolean) => {
    const normalizedTitle = nextTitle.trim();
    if (!normalizedTitle) return;
    const signature = JSON.stringify([normalizedTitle, nextNotes, nextDueDate, nextCompleted]);
    if (signature === lastQueuedSave.current) return;
    lastQueuedSave.current = signature;
    void onSave(normalizedTitle, nextNotes, nextDueDate, nextCompleted).then((succeeded) => {
      if (!succeeded && lastQueuedSave.current === signature) lastQueuedSave.current = "";
    });
  }, [onSave]);

  const close = useCallback(() => {
    saveChanges(title || task.title, notes, dueDate, completed);
    onClose();
  }, [completed, dueDate, notes, onClose, saveChanges, task.title, title]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    const timeout = window.setTimeout(() => saveChanges(title, notes, dueDate, completed), 500);
    return () => window.clearTimeout(timeout);
  }, [completed, dueDate, notes, saveChanges, title]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [close]);

  function finishEditingTitle() {
    const nextTitle = title.trim() || task.title;
    setTitle(nextTitle);
    setIsEditingTitle(false);
    saveChanges(nextTitle, notes, dueDate, completed);
  }

  async function handleDelete() {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    if (await onDelete()) onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-details-title"
        className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/40"
      >
        <div>
          <header className="flex items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4">
            <h2 id="task-details-title" className="flex min-w-0 flex-1 items-center gap-2 text-lg font-semibold">
              <button
                type="button"
                onClick={() => {
                  const nextCompleted = !completed;
                  setCompleted(nextCompleted);
                  saveChanges(title, notes, dueDate, nextCompleted);
                }}
                aria-label={completed ? "فعال کردن کار" : "انجام‌شده علامت زدن کار"}
                title={completed ? "فعال کردن" : "انجام‌شده علامت زدن"}
                className={`grid size-6 shrink-0 place-items-center rounded-md transition-colors hover:bg-green-500/20 hover:text-green-400 ${completed ? "bg-zinc-700 text-zinc-100" : "text-zinc-400"}`}
              >
                <Check aria-hidden="true" className="size-3.5" />
              </button>
              {isEditingTitle ? (
                <motion.input
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  ref={titleInputRef}
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onBlur={finishEditingTitle}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      finishEditingTitle();
                    }
                  }}
                  aria-label="عنوان کار"
                  className="min-w-0 flex-1 rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 text-base text-zinc-100 outline-none focus:border-zinc-400"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  title="ویرایش عنوان کار"
                  className={`min-w-0 flex-1 truncate rounded px-1 text-right hover:bg-zinc-800 ${completed ? "text-zinc-400 line-through" : ""}`}
                >
                  {title}
                </button>
              )}
            </h2>
            <button type="button" onClick={close} aria-label="بستن" className="grid size-8 shrink-0 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
              <X aria-hidden="true" className="size-4" />
            </button>
          </header>

          <div className="space-y-4 px-5 py-5">
            <div>
              <label htmlFor="edit-task-notes" className="mb-1.5 block text-sm font-medium text-zinc-300">یادداشت <span className="font-normal text-zinc-500">(اختیاری)</span></label>
              <textarea id="edit-task-notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} onBlur={() => saveChanges(title, notes, dueDate, completed)} placeholder="جزئیات را وارد کنید" className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500" />
            </div>
            <div>
              <label htmlFor="edit-task-due-date" className="mb-1.5 block text-sm font-medium text-zinc-300">تاریخ سررسید <span className="font-normal text-zinc-500">(اختیاری)</span></label>
              <PersianDatePicker id="edit-task-due-date" value={dueDate} onChange={(nextDueDate) => { setDueDate(nextDueDate); saveChanges(title, notes, nextDueDate, completed); }} />
            </div>
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} role="alert" className="overflow-hidden rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <footer className="flex items-center border-t border-zinc-800 px-5 py-4">
            <motion.button
              layout
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              animate={isConfirmingDelete ? { x: [0, -3, 3, -2, 2, 0] } : {}}
              whileTap={{ scale: 0.97 }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-950 hover:text-red-300 disabled:opacity-40"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={isConfirmingDelete ? "confirm" : "delete"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {isConfirmingDelete ? "برای تأیید دوباره کلیک کنید" : "حذف کار"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </footer>
        </div>
      </motion.div>
    </motion.div>
  );
}
