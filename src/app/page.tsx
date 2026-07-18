"use client";

import { FormEvent, useEffect, useState } from "react";

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
    close: <path d="m6 6 12 12M18 6 6 18" />,
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
  completed: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
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
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error("Could not add task.");

      const task = (await response.json()) as Task;
      setTasks((currentTasks) => [...currentTasks, task]);
      setTaskTitle("");
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

          {isAdding ? (
            <form onSubmit={addTask} className="mb-6 rounded-xl border border-zinc-600 bg-zinc-800 p-3 shadow-sm shadow-black/20">
              <label htmlFor="new-task" className="sr-only">Task name</label>
              <input
                id="new-task"
                autoFocus
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setTaskTitle("");
                    setIsAdding(false);
                  }
                }}
                placeholder="What needs to be done?"
                className="w-full bg-transparent px-1 py-1 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
              />
              <div className="mt-3 flex items-center justify-end gap-2 border-t border-zinc-800 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setTaskTitle("");
                    setIsAdding(false);
                  }}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!taskTitle.trim() || isSaving}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSaving ? "Adding…" : "Add task"}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mb-6 flex w-full items-center gap-3 rounded-xl border border-dashed border-zinc-600 px-4 py-3 text-left text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <span className="grid size-6 place-items-center rounded-md bg-white text-zinc-950"><Icon name="plus" /></span>
              Add a task
            </button>
          )}

          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-red-950 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {isLoading ? (
            <p className="py-8 text-center text-sm text-zinc-500">Loading tasks…</p>
          ) : (
            <ul className="space-y-3">
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
                  className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4 shadow-sm shadow-black/20"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} as complete`}
                    className="size-4 accent-white"
                  />
                  <span className="text-sm text-zinc-200">{task.title}</span>
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
                  className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4 shadow-sm shadow-black/20"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} as incomplete`}
                    className="size-4 accent-white"
                  />
                  <span className="text-sm text-zinc-500 line-through">{task.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
