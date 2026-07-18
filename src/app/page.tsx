"use client";

import { FormEvent, useState } from "react";

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
    search: <path d="m20 20-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />,
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

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = taskTitle.trim();

    if (!title) return;

    setTasks((currentTasks) => [
      ...currentTasks,
      { id: Date.now(), title, completed: false },
    ]);
    setTaskTitle("");
    setIsAdding(false);
  }

  function toggleTask(id: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  return (
    <div className="flex min-h-screen bg-white text-zinc-900">
      <aside className="flex w-20 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 px-3 py-5 md:w-64 md:px-4">
        <div className="mb-8 flex items-center justify-center gap-3 px-2 md:justify-start">
          <div className="grid size-9 place-items-center rounded-xl bg-zinc-900 text-sm font-bold text-white">T</div>
          <span className="hidden text-lg font-semibold tracking-tight md:block">Todo</span>
        </div>

        <nav aria-label="Main navigation" className="space-y-1">
          {navItems.map((item, index) => (
            <a
              key={item.label}
              href="#"
              className={`flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:justify-start ${
                index === 0 ? "bg-zinc-200 text-zinc-950" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
              }`}
            >
              <Icon name={item.icon} />
              <span className="hidden flex-1 md:block">{item.label}</span>
              {(item.label === "Inbox" ? tasks.length : (item.count ?? 0)) > 0 && (
                <span className="hidden text-xs text-zinc-500 md:block">
                  {item.label === "Inbox" ? tasks.length : item.count}
                </span>
              )}
            </a>
          ))}
        </nav>

        <div className="mt-8 hidden md:block">
          <div className="mb-2 flex items-center justify-between px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Lists</p>
            <button aria-label="Add list" className="text-zinc-400 transition-colors hover:text-zinc-900">
              <Icon name="plus" />
            </button>
          </div>
          <div className="space-y-1">
            {lists.map((list) => (
              <a key={list.label} href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100">
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
            <button aria-label="Search" className="grid size-10 place-items-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900">
              <Icon name="search" />
            </button>
          </header>

          {isAdding ? (
            <form onSubmit={addTask} className="mb-6 rounded-xl border border-zinc-300 bg-white p-3 shadow-sm">
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
                className="w-full px-1 py-1 text-sm outline-none placeholder:text-zinc-400"
              />
              <div className="mt-3 flex items-center justify-end gap-2 border-t border-zinc-100 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setTaskTitle("");
                    setIsAdding(false);
                  }}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!taskTitle.trim()}
                  className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Add task
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mb-6 flex w-full items-center gap-3 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-left text-sm text-zinc-500 transition-colors hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-800"
            >
              <span className="grid size-6 place-items-center rounded-md bg-zinc-900 text-white"><Icon name="plus" /></span>
              Add a task
            </button>
          )}

          {tasks.length === 0 ? (
            <section className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm shadow-zinc-100">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-zinc-100 text-zinc-500">
                <Icon name="tray" />
              </div>
              <h2 className="font-semibold">Your inbox is clear</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                Capture tasks as they come to you. You can organize them into lists later.
              </p>
            </section>
          ) : (
            <ul className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white px-4 shadow-sm shadow-zinc-100">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 py-4">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
                    className="size-4 accent-zinc-900"
                  />
                  <span className={`text-sm ${task.completed ? "text-zinc-400 line-through" : "text-zinc-800"}`}>
                    {task.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
