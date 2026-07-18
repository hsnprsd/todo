"use client";

import { FormEvent, useState } from "react";
import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { Inbox, Plus } from "lucide-react";
import AddTaskModal from "@/components/add-task-modal";
import TaskCard from "@/components/task-card";
import TaskDetailsModal from "@/components/task-details-modal";
import { useTasks } from "@/hooks/use-tasks";
import type { RecurrenceType } from "@/lib/recurrence";

export default function Home() {
  const { tasks, isLoading, isSaving, error, clearError, addTask, updateTask, deleteTask, toggleTask, reorderTasks } = useTasks();
  const [showCompleted, setShowCompleted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType | null>(null);
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState<number[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  function closeAddModal() {
    if (isSaving) return;
    setTitle("");
    setNotes("");
    setDueDate("");
    setRecurrenceType(null);
    setRecurrenceWeekdays([]);
    setIsAdding(false);
  }

  async function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await addTask(title.trim(), notes, dueDate, recurrenceType, recurrenceWeekdays)) closeAddModal();
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) void reorderTasks(Number(active.id), Number(over.id));
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-3xl">
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="mb-1 text-sm text-zinc-500">
          {new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">صندوق ورودی</h1>
      </motion.header>

      <motion.button
        type="button"
        onClick={() => { clearError(); setIsAdding(true); }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, borderColor: "rgb(113 113 122)" }}
        whileTap={{ scale: 0.99 }}
        className="mb-6 flex w-full items-center gap-3 rounded-xl border border-dashed border-zinc-600 px-4 py-3 text-right text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        <motion.span whileHover={{ rotate: 90 }} className="grid size-6 place-items-center rounded-md bg-white text-zinc-950"><Plus aria-hidden="true" className="size-5" /></motion.span>
        افزودن کار
      </motion.button>

      <AnimatePresence>
        {error && <motion.p initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }} role="alert" className="mb-4 overflow-hidden rounded-lg bg-red-950 px-4 py-3 text-sm text-red-300">{error}</motion.p>}
      </AnimatePresence>

      {isLoading ? (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4 }} className="py-8 text-center text-sm text-zinc-500">در حال بارگذاری کارها…</motion.p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {activeTasks.length === 0 && (
                <motion.li key="empty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
                  <section className="rounded-2xl border border-zinc-700 bg-zinc-800 p-8 text-center shadow-sm shadow-black/20">
                    <motion.div initial={{ scale: 0.7, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-zinc-700 text-zinc-300"><Inbox aria-hidden="true" className="size-5" /></motion.div>
                    <h2 className="font-semibold">صندوق ورودی شما خالی است</h2>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">کارها را همان لحظه که به ذهنتان می‌رسند ثبت کنید. بعداً می‌توانید آن‌ها را در فهرست‌ها مرتب کنید.</p>
                  </section>
                </motion.li>
              )}
            </AnimatePresence>
            <SortableContext items={activeTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence initial={false}>
                {activeTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={toggleTask} onOpen={(item) => { clearError(); setSelectedTaskId(item.id); }} />)}
              </AnimatePresence>
            </SortableContext>
            <AnimatePresence>
              {completedTasks.length > 0 && (
                <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-1 text-center">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => setShowCompleted((current) => !current)} className="text-sm font-medium text-zinc-400 hover:text-zinc-100">
                    {showCompleted ? "پنهان کردن انجام‌شده‌ها" : `نمایش انجام‌شده‌ها (${new Intl.NumberFormat("fa-IR").format(completedTasks.length)})`}
                  </motion.button>
                </motion.li>
              )}
            </AnimatePresence>
            <SortableContext items={completedTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence initial={false}>
                {showCompleted && completedTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={toggleTask} onOpen={(item) => { clearError(); setSelectedTaskId(item.id); }} />)}
              </AnimatePresence>
            </SortableContext>
          </ul>
        </DndContext>
      )}

      <AnimatePresence>
        {isAdding && <AddTaskModal title={title} notes={notes} dueDate={dueDate} recurrenceType={recurrenceType} recurrenceWeekdays={recurrenceWeekdays} error={error} isSaving={isSaving} onTitleChange={setTitle} onNotesChange={setNotes} onDueDateChange={setDueDate} onRecurrenceTypeChange={setRecurrenceType} onRecurrenceWeekdaysChange={setRecurrenceWeekdays} onClose={closeAddModal} onSubmit={submitTask} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedTask && <TaskDetailsModal task={selectedTask} error={error} isSaving={isSaving} onClose={() => setSelectedTaskId(null)} onSave={(nextTitle, nextNotes, nextDueDate, completed, nextRecurrenceType, nextRecurrenceWeekdays) => updateTask(selectedTask.id, nextTitle, nextNotes, nextDueDate, completed, nextRecurrenceType, nextRecurrenceWeekdays)} onDelete={() => deleteTask(selectedTask.id)} />}
      </AnimatePresence>
    </motion.div>
  );
}
