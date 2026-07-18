"use client";

import { useState } from "react";
import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TaskCard from "@/components/task-card";
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

function DayColumn({ date, tasks, onToggle, onOpen }: { date: Date; tasks: Task[]; onToggle: (id: number) => void; onOpen: (task: Task) => void }) {
  const dateKey = toDateKey(date);
  const { setNodeRef, isOver } = useDroppable({ id: `day:${dateKey}` });
  return (
    <section ref={setNodeRef} className={`min-h-80 rounded-2xl border bg-zinc-900 p-3 transition-colors ${isOver ? "border-sky-500 bg-sky-950/20" : "border-zinc-700"}`}>
      <header className="mb-3 border-b border-zinc-800 pb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{new Intl.DateTimeFormat("en", { weekday: "short" }).format(date)}</p>
        <p className="mt-1 text-lg font-semibold text-zinc-200">{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date)}</p>
      </header>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {tasks.map((task) => <TaskCard key={task.id} task={task} onToggle={onToggle} onOpen={onOpen} />)}
        </ul>
      </SortableContext>
      {tasks.length === 0 && <p className="py-8 text-center text-xs text-zinc-600">Drop tasks here</p>}
    </section>
  );
}

export default function CalendarPage() {
  const { tasks, isLoading, error, toggleTask, moveTaskToDate } = useTasks();
  const [dayOffset, setDayOffset] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 4 }, (_, index) => addDays(today, dayOffset + index));
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;
    const task = tasks.find((item) => item.id === active.id);
    if (!task) return;
    const targetDate = typeof over.id === "string" && over.id.startsWith("day:")
      ? over.id.slice(4)
      : tasks.find((item) => item.id === over.id)?.dueDate;
    if (targetDate && targetDate !== task.dueDate) void moveTaskToDate(task.id, targetDate);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><p className="mb-1 text-sm text-zinc-500">Four-day schedule</p><h1 className="text-3xl font-bold tracking-tight">Calendar</h1></div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setDayOffset(0)} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800">Today</button>
          <button type="button" onClick={() => setDayOffset((offset) => offset - 4)} aria-label="Previous four days" className="grid size-9 place-items-center rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"><ChevronLeft aria-hidden="true" className="size-4" /></button>
          <button type="button" onClick={() => setDayOffset((offset) => offset + 4)} aria-label="Next four days" className="grid size-9 place-items-center rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"><ChevronRight aria-hidden="true" className="size-4" /></button>
        </div>
      </header>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-950 px-4 py-3 text-sm text-red-300">{error}</p>}
      {isLoading ? <p className="py-8 text-center text-sm text-zinc-500">Loading tasks…</p> : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto pb-2"><div className="grid min-w-[900px] grid-cols-4 gap-3">
            {days.map((date) => {
              const dateKey = toDateKey(date);
              return <DayColumn key={dateKey} date={date} tasks={tasks.filter((task) => !task.completed && task.dueDate === dateKey)} onToggle={toggleTask} onOpen={(task) => setSelectedTaskId(task.id)} />;
            })}
          </div></div>
        </DndContext>
      )}
      {selectedTask && <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTaskId(null)} />}
    </div>
  );
}
