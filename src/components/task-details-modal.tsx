"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import type { Task } from "@/types/task";

export default function TaskDetailsModal({
  task,
  error,
  isSaving,
  onClose,
  onSave,
}: {
  task: Task;
  error: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (title: string, notes: string, dueDate: string, completed: boolean) => Promise<boolean>;
}) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [completed, setCompleted] = useState(task.completed);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) onClose();
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isSaving, onClose]);

  function finishEditingTitle() {
    if (!title.trim()) setTitle(task.title);
    setIsEditingTitle(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onSave(title.trim(), notes, dueDate, completed)) onClose();
  }

  function close() {
    if (!isSaving) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <div role="dialog" aria-modal="true" aria-labelledby="task-details-title" className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/40">
        <form onSubmit={handleSubmit}>
          <header className="flex items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4">
            <h2 id="task-details-title" className="flex min-w-0 flex-1 items-center gap-2 text-lg font-semibold">
              <button
                type="button"
                onClick={() => setCompleted((current) => !current)}
                aria-label={completed ? "فعال کردن کار" : "انجام‌شده علامت زدن کار"}
                title={completed ? "فعال کردن" : "انجام‌شده علامت زدن"}
                className={`grid size-6 shrink-0 place-items-center rounded-md transition-colors hover:bg-green-500/20 hover:text-green-400 ${completed ? "bg-zinc-700 text-zinc-100" : "text-zinc-400"}`}
              >
                <Check aria-hidden="true" className="size-3.5" />
              </button>
              {isEditingTitle ? (
                <input
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
            <button type="button" onClick={close} disabled={isSaving} aria-label="بستن" className="grid size-8 shrink-0 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40">
              <X aria-hidden="true" className="size-4" />
            </button>
          </header>

          <div className="space-y-4 px-5 py-5">
            <div>
              <label htmlFor="edit-task-notes" className="mb-1.5 block text-sm font-medium text-zinc-300">یادداشت <span className="font-normal text-zinc-500">(اختیاری)</span></label>
              <textarea id="edit-task-notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="جزئیات را وارد کنید" className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500" />
            </div>
            <div>
              <label htmlFor="edit-task-due-date" className="mb-1.5 block text-sm font-medium text-zinc-300">تاریخ سررسید <span className="font-normal text-zinc-500">(اختیاری)</span></label>
              <input id="edit-task-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500" />
            </div>
            {error && <p role="alert" className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p>}
          </div>

          <footer className="flex justify-end gap-2 border-t border-zinc-800 px-5 py-4">
            <button type="button" onClick={close} disabled={isSaving} className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40">انصراف</button>
            <button type="submit" disabled={!title.trim() || isSaving} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40">{isSaving ? "در حال ذخیره…" : "ذخیره تغییرات"}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
