"use client";

import { FormEvent, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import PersianDatePicker from "@/components/persian-date-picker";
import RecurrencePicker from "@/components/recurrence-picker";
import type { RecurrenceType } from "@/lib/recurrence";

export default function AddTaskModal({
  title,
  notes,
  dueDate,
  recurrenceType,
  recurrenceWeekdays,
  error,
  isSaving,
  onTitleChange,
  onNotesChange,
  onDueDateChange,
  onRecurrenceTypeChange,
  onRecurrenceWeekdaysChange,
  onClose,
  onSubmit,
}: {
  title: string;
  notes: string;
  dueDate: string;
  recurrenceType: RecurrenceType | null;
  recurrenceWeekdays: number[];
  error: string;
  isSaving: boolean;
  onTitleChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onRecurrenceTypeChange: (value: RecurrenceType | null) => void;
  onRecurrenceWeekdaysChange: (value: number[]) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) onClose();
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isSaving, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/40"
      >
        <form onSubmit={onSubmit}>
          <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
            <h2 id="add-task-title" className="text-lg font-semibold">افزودن کار</h2>
            <button type="button" onClick={onClose} disabled={isSaving} aria-label="بستن" className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40">
              <X aria-hidden="true" className="size-4" />
            </button>
          </header>

          <div className="space-y-4 px-5 py-5">
            <div>
              <label htmlFor="task-title" className="mb-1.5 block text-sm font-medium text-zinc-300">عنوان</label>
              <input id="task-title" autoFocus required value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder="چه کاری باید انجام شود؟" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500" />
            </div>
            <div>
              <label htmlFor="task-notes" className="mb-1.5 block text-sm font-medium text-zinc-300">یادداشت <span className="font-normal text-zinc-500">(اختیاری)</span></label>
              <textarea id="task-notes" rows={3} value={notes} onChange={(event) => onNotesChange(event.target.value)} placeholder="جزئیات را وارد کنید" className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500" />
            </div>
            <div>
              <label htmlFor="task-due-date" className="mb-1.5 block text-sm font-medium text-zinc-300">تاریخ سررسید <span className="font-normal text-zinc-500">(اختیاری)</span></label>
              <PersianDatePicker id="task-due-date" value={dueDate} onChange={onDueDateChange} />
            </div>
            <RecurrencePicker
              dueDate={dueDate}
              type={recurrenceType}
              weekdays={recurrenceWeekdays}
              onTypeChange={onRecurrenceTypeChange}
              onWeekdaysChange={onRecurrenceWeekdaysChange}
            />
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} role="alert" className="overflow-hidden rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <footer className="flex justify-end gap-2 border-t border-zinc-800 px-5 py-4">
            <button type="button" onClick={onClose} disabled={isSaving} className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40">انصراف</button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" disabled={!title.trim() || isSaving || Boolean(recurrenceType && !dueDate) || Boolean(recurrenceType === "weekly" && recurrenceWeekdays.length === 0)} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40">{isSaving ? "در حال افزودن…" : "افزودن کار"}</motion.button>
          </footer>
        </form>
      </motion.div>
    </motion.div>
  );
}
