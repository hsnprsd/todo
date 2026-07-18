"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, Check, X } from "lucide-react";

const navItems = [
  { label: "Inbox", icon: "tray" },
  { label: "Today", icon: "calendar", count: 2 },
  { label: "Upcoming", icon: "clock" },
];

const lists = [
  { label: "Personal", color: "bg-violet-500" },
  { label: "Work", color: "bg-sky-500" },
  { label: "Shopping", color: "bg-amber-500" },
];

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    tray: <path d="M4 5h16l-2 14H6L4 5Zm1 9h4l1.5 2h3L15 14h4M9 9h6" />,
    calendar: <path d="M6 3v3m12-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />,
    clock: <path d="M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
    plus: <path d="M12 5v14M5 12h14" />,
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-[1.8]">
      {paths[name]}
    </svg>
  );
}

type Task = {
  id: number;
  title: string;
  notes: string | null;
  dueDate: string | null;
  completed: boolean;
};

function formatDueDate(dueDate: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dueDate}T00:00:00`));
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) throw new Error("Could not load tasks.");
        setTasks((await response.json()) as Task[]);
      } catch {
        setError("Could not load tasks. Please refresh and try again.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadTasks();
  }, []);

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = taskTitle.trim();

    if (!title || isSaving) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          notes: taskNotes,
          dueDate: taskDueDate,
        }),
      });
      if (!response.ok) throw new Error("Could not add task.");

      const task = (await response.json()) as Task;
      setTasks((currentTasks) => [...currentTasks, task]);
      setTaskTitle("");
      setTaskNotes("");
      setTaskDueDate("");
      setIsAdding(false);
    } catch {
      setError("Could not add the task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleTask(id: number) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    const completed = !task.completed;
    setError("");
    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item.id === id ? { ...item, completed } : item,
      ),
    );

    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed }),
      });
      if (!response.ok) throw new Error("Could not update task.");
    } catch {
      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === id ? { ...item, completed: task.completed } : item,
        ),
      );
      setError("Could not update the task. Please try again.");
    }
  }

  function closeTaskModal() {
    if (isSaving) return;
    setTaskTitle("");
    setTaskNotes("");
    setTaskDueDate("");
    setIsAdding(false);
  }

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <div className="flex min-h-screen bg-zinc-900 text-zinc-100">
      <aside className="flex w-20 shrink-0 flex-col border-r border-zinc-700 bg-zinc-800 px-3 py-5 md:w-64 md:px-4">
        <div className="mb-8 flex items-center justify-center gap-3 px-2 md:justify-start">
          <div className="grid size-9 place-items-center rounded-xl bg-white text-sm font-bold text-zinc-950">T</div>
          <span className="hidden text-lg font-semibold tracking-tight md:block">Todo</span>
        </div>

        <nav aria-label="Main navigation" className="space-y-1">
          {navItems.map((item, index) => (
            <a
              key={item.label}
              href="#"
              className={`flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:justify-start ${
                index === 0 ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
              }`}
            >
              <Icon name={item.icon} />
              <span className="hidden flex-1 md:block">{item.label}</span>
              {(item.label === "Inbox" ? activeTasks.length : (item.count ?? 0)) > 0 && (
                <span className="hidden text-xs text-zinc-500 md:block">
                  {item.label === "Inbox" ? activeTasks.length : item.count}
                </span>
              )}
            </a>
          ))}
        </nav>

        <div className="mt-8 hidden md:block">
          <div className="mb-2 flex items-center justify-between px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Lists</p>
            <button aria-label="Add list" className="text-zinc-500 transition-colors hover:text-zinc-100">
              <Icon name="plus" />
            </button>
          </div>
          <div className="space-y-1">
            {lists.map((list) => (
              <a key={list.label} href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100">
                <span className={`size-2 rounded-full ${list.color}`} />
                {list.label}
              </a>
            ))}
          </div>
        </div>

      </aside>

      <main className="min-w-0 flex-1 px-6 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <header className="mb-10 flex items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-sm text-zinc-500">Saturday, July 18</p>
              <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
            </div>
          </header>

          <button
            type="button"
            onClick={() => {
              setError("");
              setIsAdding(true);
            }}
            className="mb-6 flex w-full items-center gap-3 rounded-xl border border-dashed border-zinc-600 px-4 py-3 text-left text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <span className="grid size-6 place-items-center rounded-md bg-white text-zinc-950"><Icon name="plus" /></span>
            Add a task
          </button>

          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-red-950 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {isLoading ? (
            <p className="py-8 text-center text-sm text-zinc-500">Loading tasks…</p>
          ) : (
            <ul className="space-y-2">
              {activeTasks.length === 0 && (
                <li>
                  <section className="rounded-2xl border border-zinc-700 bg-zinc-800 p-8 text-center shadow-sm shadow-black/20">
                    <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-zinc-700 text-zinc-300">
                      <Icon name="tray" />
                    </div>
                    <h2 className="font-semibold">Your inbox is clear</h2>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                      Capture tasks as they come to you. You can organize them into lists later.
                    </p>
                  </section>
                </li>
              )}

              {activeTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-2 py-2 shadow-sm shadow-black/20 transition-colors hover:border-zinc-600"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} as complete`}
                    title="Mark as complete"
                    className="grid size-6 shrink-0 place-items-center rounded-md text-zinc-400 transition-colors hover:bg-green-500/15 hover:text-green-400"
                  >
                    <Check aria-hidden="true" className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTask(task)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate text-sm text-zinc-200">{task.title}</span>
                    {task.dueDate && (
                      <span className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                        <CalendarDays aria-hidden="true" className="size-3" />
                        {formatDueDate(task.dueDate)}
                      </span>
                    )}
                  </button>
                </li>
              ))}

              {completedTasks.length > 0 && (
                <li className="py-1 text-center">
                  <button
                    type="button"
                    onClick={() => setShowCompleted((current) => !current)}
                    className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
                  >
                    {showCompleted ? "Hide completed" : `Show completed (${completedTasks.length})`}
                  </button>
                </li>
              )}

              {showCompleted && completedTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-2 py-2 shadow-sm shadow-black/20 transition-colors hover:border-zinc-600"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} as incomplete`}
                    title="Mark as incomplete"
                    className="grid size-6 shrink-0 place-items-center rounded-md bg-zinc-700 text-zinc-100 transition-colors hover:bg-green-500/20 hover:text-green-400"
                  >
                    <Check aria-hidden="true" className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTask(task)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate text-sm text-zinc-500 line-through">{task.title}</span>
                    {task.dueDate && (
                      <span className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                        <CalendarDays aria-hidden="true" className="size-3" />
                        {formatDueDate(task.dueDate)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {isAdding && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeTaskModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-task-title"
            className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/40"
          >
            <form
              onSubmit={addTask}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeTaskModal();
                }
              }}
            >
              <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                <h2 id="add-task-title" className="text-lg font-semibold">Add a task</h2>
                <button
                  type="button"
                  onClick={closeTaskModal}
                  disabled={isSaving}
                  aria-label="Close"
                  className="grid size-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </header>

              <div className="space-y-4 px-5 py-5">
                <div>
                  <label htmlFor="task-title" className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Title
                  </label>
                  <input
                    id="task-title"
                    autoFocus
                    required
                    value={taskTitle}
                    onChange={(event) => setTaskTitle(event.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label htmlFor="task-notes" className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Notes <span className="font-normal text-zinc-500">(optional)</span>
                  </label>
                  <textarea
                    id="task-notes"
                    rows={3}
                    value={taskNotes}
                    onChange={(event) => setTaskNotes(event.target.value)}
                    placeholder="Add any details"
                    className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label htmlFor="task-due-date" className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Due date <span className="font-normal text-zinc-500">(optional)</span>
                  </label>
                  <input
                    id="task-due-date"
                    type="date"
                    value={taskDueDate}
                    onChange={(event) => setTaskDueDate(event.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-zinc-500"
                  />
                </div>

                {error && (
                  <p role="alert" className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">
                    {error}
                  </p>
                )}
              </div>

              <footer className="flex justify-end gap-2 border-t border-zinc-800 px-5 py-4">
                <button
                  type="button"
                  onClick={closeTaskModal}
                  disabled={isSaving}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!taskTitle.trim() || isSaving}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSaving ? "Adding…" : "Add task"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {selectedTask && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedTask(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-details-title"
            onKeyDown={(event) => {
              if (event.key === "Escape") setSelectedTask(null);
            }}
            className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/40"
          >
            <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <h2 id="task-details-title" className="text-lg font-semibold">Task details</h2>
              <button
                type="button"
                autoFocus
                onClick={() => setSelectedTask(null)}
                aria-label="Close"
                className="grid size-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </header>

            <div className="space-y-5 px-5 py-5">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Title</p>
                <p className="text-zinc-100">{selectedTask.title}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Notes</p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                  {selectedTask.notes || "No notes"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Due date</p>
                <p className="flex items-center gap-2 text-sm text-zinc-300">
                  <CalendarDays aria-hidden="true" className="size-4 text-zinc-500" />
                  {selectedTask.dueDate ? formatDueDate(selectedTask.dueDate) : "No due date"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</p>
                <p className="text-sm text-zinc-300">{selectedTask.completed ? "Completed" : "Active"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
