"use client";

import { type FormEvent, useState } from "react";
import { closestCenter, DndContext, DragOverlay, type DragEndEvent, type DragOverEvent, KeyboardSensor, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import AddTaskModal from "@/components/add-task-modal";
import TaskCard, { TaskCardPreview } from "@/components/task-card";
import TaskDetailsModal from "@/components/task-details-modal";
import { useTasks } from "@/hooks/use-tasks";
import type { Task } from "@/types/task";

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function DayColumn({ date, tasks, previewTask, onAdd, onToggle, onOpen }: { date: Date; tasks: Task[]; previewTask?: Task; onAdd: (dueDate: string) => void; onToggle: (id: number) => void; onOpen: (task: Task) => void }) {
  const [showCompleted, setShowCompleted] = useState(false);
  const dateKey = toDateKey(date);
  const { setNodeRef, isOver } = useDroppable({ id: `day:${dateKey}` });
  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const visibleTasks = showCompleted ? [...activeTasks, ...completedTasks] : activeTasks;
  const progress = tasks.length === 0 ? 0 : Math.round((completedTasks.length / tasks.length) * 100);

  return (
    <section ref={setNodeRef} className={`min-h-80 rounded-2xl border bg-zinc-900 p-3 transition-colors ${isOver ? "border-sky-500 bg-sky-950/20" : "border-zinc-700"}`}>
      <header className="mb-3 border-b border-zinc-800 pb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "short" }).format(date)}</p>
        <p className="mt-1 text-lg font-semibold text-zinc-200">{new Intl.DateTimeFormat("fa-IR-u-ca-persian", { month: "short", day: "numeric" }).format(date)}</p>
        <div className="mt-3 flex items-center gap-2">
          <div
            role="progressbar"
            aria-label="پیشرفت کارهای روز"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800"
          >
            <div className="h-full rounded-full bg-green-500 transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="w-9 text-left text-xs tabular-nums text-zinc-500">{new Intl.NumberFormat("fa-IR").format(progress)}٪</span>
        </div>
      </header>
      <button
        type="button"
        onClick={() => onAdd(dateKey)}
        className="mb-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-zinc-600 px-3 py-2 text-right text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
      >
        <span className="grid size-5 place-items-center rounded-md bg-white text-zinc-950">
          <Plus aria-hidden="true" className="size-4" />
        </span>
        افزودن کار
      </button>
      <SortableContext items={visibleTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {activeTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={onToggle} onOpen={onOpen} keepInPlace showDueDate={false} />)}
          {activeTasks.length === 0 && !previewTask && (
            <li><p className="py-8 text-center text-xs text-zinc-600">کارها را اینجا رها کنید</p></li>
          )}
          {previewTask && !previewTask.completed && <li><TaskCardPreview task={previewTask} faded showDueDate={false} /></li>}
          {completedTasks.length > 0 && (
            <li className="py-1 text-center">
              <button type="button" onClick={() => setShowCompleted((current) => !current)} className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-100">
                {showCompleted ? "پنهان کردن انجام‌شده‌ها" : `نمایش انجام‌شده‌ها (${new Intl.NumberFormat("fa-IR").format(completedTasks.length)})`}
              </button>
            </li>
          )}
          {showCompleted && completedTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={onToggle} onOpen={onOpen} keepInPlace showDueDate={false} />)}
          {previewTask && previewTask.completed && <li><TaskCardPreview task={previewTask} faded showDueDate={false} /></li>}
        </ul>
      </SortableContext>
    </section>
  );
}

export default function CalendarPage() {
  const { tasks, isLoading, isSaving, error, clearError, addTask, updateTask, toggleTask, moveTaskToDate, reorderTasks } = useTasks();
  const [dayOffset, setDayOffset] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [dragPreview, setDragPreview] = useState<{ taskId: number; dueDate: string } | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 4 }, (_, index) => addDays(today, dayOffset + index));
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const activeTask = tasks.find((task) => task.id === activeTaskId);

  function openAddModal(dueDate: string) {
    clearError();
    setTaskDueDate(dueDate);
    setIsAdding(true);
  }

  function closeAddModal() {
    if (isSaving) return;
    setTaskTitle("");
    setTaskNotes("");
    setTaskDueDate("");
    setIsAdding(false);
  }

  async function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await addTask(taskTitle.trim(), taskNotes, taskDueDate)) closeAddModal();
  }

  function getTargetDate(overId: string | number) {
    return typeof overId === "string" && overId.startsWith("day:")
      ? overId.slice(4)
      : tasks.find((item) => item.id === overId)?.dueDate;
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over || active.id === over.id) return;
    const task = tasks.find((item) => item.id === active.id);
    const targetDate = getTargetDate(over.id);
    if (!task || !targetDate) return;
    if (targetDate === task.dueDate) {
      setDragPreview(null);
    } else if (targetDate !== dragPreview?.dueDate) {
      setDragPreview({ taskId: task.id, dueDate: targetDate });
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    const task = tasks.find((item) => item.id === active.id);
    const targetDate = dragPreview?.taskId === active.id
      ? dragPreview.dueDate
      : over ? getTargetDate(over.id) : null;
    setDragPreview(null);
    setActiveTaskId(null);
    if (task && targetDate && targetDate !== task.dueDate) {
      void moveTaskToDate(task.id, targetDate);
    } else if (task && over && active.id !== over.id) {
      const targetTask = tasks.find((item) => item.id === over.id);
      if (targetTask?.dueDate === task.dueDate) {
        void reorderTasks(task.id, targetTask.id);
      }
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><p className="mb-1 text-sm text-zinc-500">برنامه چهارروزه</p><h1 className="text-3xl font-bold tracking-tight">تقویم</h1></div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setDayOffset(0)} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800">امروز</button>
          <button type="button" onClick={() => setDayOffset((offset) => offset - 4)} aria-label="چهار روز قبل" className="grid size-9 place-items-center rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"><ChevronRight aria-hidden="true" className="size-4" /></button>
          <button type="button" onClick={() => setDayOffset((offset) => offset + 4)} aria-label="چهار روز بعد" className="grid size-9 place-items-center rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"><ChevronLeft aria-hidden="true" className="size-4" /></button>
        </div>
      </header>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-950 px-4 py-3 text-sm text-red-300">{error}</p>}
      {isLoading ? <p className="py-8 text-center text-sm text-zinc-500">در حال بارگذاری کارها…</p> : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active }) => setActiveTaskId(Number(active.id))}
          onDragOver={handleDragOver}
          onDragCancel={() => {
            setDragPreview(null);
            setActiveTaskId(null);
          }}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto pb-2"><div className="grid min-w-[900px] grid-cols-4 gap-3">
            {days.map((date) => {
              const dateKey = toDateKey(date);
              const previewTask = activeTask && dragPreview?.dueDate === dateKey
                ? { ...activeTask, dueDate: dateKey }
                : undefined;
              const dayTasks = tasks.filter((task) => task.dueDate === dateKey);
              return <DayColumn key={dateKey} date={date} tasks={dayTasks} previewTask={previewTask} onAdd={openAddModal} onToggle={toggleTask} onOpen={(task) => { clearError(); setSelectedTaskId(task.id); }} />;
            })}
          </div></div>
          <DragOverlay>
            {activeTask && <div className="w-56"><TaskCardPreview task={activeTask} showDueDate={false} /></div>}
          </DragOverlay>
        </DndContext>
      )}
      {isAdding && (
        <AddTaskModal
          title={taskTitle}
          notes={taskNotes}
          dueDate={taskDueDate}
          error={error}
          isSaving={isSaving}
          onTitleChange={setTaskTitle}
          onNotesChange={setTaskNotes}
          onDueDateChange={setTaskDueDate}
          onClose={closeAddModal}
          onSubmit={submitTask}
        />
      )}
      {selectedTask && <TaskDetailsModal task={selectedTask} error={error} isSaving={isSaving} onClose={() => setSelectedTaskId(null)} onSave={(nextTitle, nextNotes, nextDueDate, completed) => updateTask(selectedTask.id, nextTitle, nextNotes, nextDueDate, completed)} />}
    </div>
  );
}
