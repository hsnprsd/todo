"use client";

import { FormEvent, useState } from "react";
import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Inbox, Plus } from "lucide-react";
import AddTaskModal from "@/components/add-task-modal";
import TaskCard from "@/components/task-card";
import TaskDetailsModal from "@/components/task-details-modal";
import { useTasks } from "@/hooks/use-tasks";

export default function Home() {
  const { tasks, isLoading, isSaving, error, clearError, addTask, toggleTask, reorderTasks } = useTasks();
  const [showCompleted, setShowCompleted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
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
    setIsAdding(false);
  }

  async function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await addTask(title.trim(), notes, dueDate)) closeAddModal();
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) void reorderTasks(Number(active.id), Number(over.id));
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-10">
        <p className="mb-1 text-sm text-zinc-500">
          {new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
      </header>

      <button type="button" onClick={() => { clearError(); setIsAdding(true); }} className="mb-6 flex w-full items-center gap-3 rounded-xl border border-dashed border-zinc-600 px-4 py-3 text-left text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-200">
        <span className="grid size-6 place-items-center rounded-md bg-white text-zinc-950"><Plus aria-hidden="true" className="size-5" /></span>
        Add a task
      </button>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-950 px-4 py-3 text-sm text-red-300">{error}</p>}

      {isLoading ? (
        <p className="py-8 text-center text-sm text-zinc-500">Loading tasks…</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <ul className="space-y-2">
            {activeTasks.length === 0 && (
              <li><section className="rounded-2xl border border-zinc-700 bg-zinc-800 p-8 text-center shadow-sm shadow-black/20">
                <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-zinc-700 text-zinc-300"><Inbox aria-hidden="true" className="size-5" /></div>
                <h2 className="font-semibold">Your inbox is clear</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">Capture tasks as they come to you. You can organize them into lists later.</p>
              </section></li>
            )}
            <SortableContext items={activeTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
              {activeTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={toggleTask} onOpen={(item) => setSelectedTaskId(item.id)} />)}
            </SortableContext>
            {completedTasks.length > 0 && (
              <li className="py-1 text-center"><button type="button" onClick={() => setShowCompleted((current) => !current)} className="text-sm font-medium text-zinc-400 hover:text-zinc-100">{showCompleted ? "Hide completed" : `Show completed (${completedTasks.length})`}</button></li>
            )}
            {showCompleted && (
              <SortableContext items={completedTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                {completedTasks.map((task) => <TaskCard key={task.id} task={task} onToggle={toggleTask} onOpen={(item) => setSelectedTaskId(item.id)} />)}
              </SortableContext>
            )}
          </ul>
        </DndContext>
      )}

      {isAdding && <AddTaskModal title={title} notes={notes} dueDate={dueDate} error={error} isSaving={isSaving} onTitleChange={setTitle} onNotesChange={setNotes} onDueDateChange={setDueDate} onClose={closeAddModal} onSubmit={submitTask} />}
      {selectedTask && <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTaskId(null)} />}
    </div>
  );
}
