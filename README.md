# کارها (Karha)

A Persian, RTL task manager built with Next.js. Karha provides a focused inbox and a four-day calendar for organizing one-off and recurring tasks, with all data stored locally in SQLite.

## Features

- Create, edit, complete, and delete tasks
- Add notes and due dates with a Persian date picker
- Daily, weekly, and Persian-monthly recurrence
- Drag-and-drop task ordering
- Drag tasks between dates in the four-day calendar
- Completion progress and animations
- Collapsible RTL sidebar
- Local SQLite persistence with automatic schema setup

## Tech stack

- [Next.js 16](https://nextjs.org/) and React 19
- TypeScript
- Tailwind CSS 4
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [dnd kit](https://dndkit.com/) for drag and drop
- [Motion](https://motion.dev/) for animations

## Getting started

### Prerequisites

- Node.js 20 or later
- [Bun](https://bun.sh/) (recommended; the repository includes `bun.lock`)

### Installation

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

The database and `tasks` table are created automatically on first run at `data/todo.db`.

To use npm instead:

```bash
npm install
npm run dev
```

## Configuration

By default, task data is stored in `data/todo.db`. Set `TODO_DB_PATH` to use another location:

```bash
TODO_DB_PATH=/absolute/path/to/todo.db bun dev
```

The parent directory is created automatically if it does not exist.

## Available scripts

```bash
bun dev      # Start the development server
bun run build # Create a production build
bun start    # Start the production server
bun run lint # Run ESLint
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Task inbox |
| `/calender` | Four-day calendar view |
| `/api/tasks` | Task CRUD, reordering, and recurrence API |

## Project structure

```text
src/
├── app/                 # Pages, layout, styles, and API routes
├── components/          # Task cards, modals, sidebar, and pickers
├── hooks/use-tasks.ts   # Client-side task state and API operations
├── lib/db.ts            # SQLite initialization and migrations
├── lib/recurrence.ts    # Recurring-task date calculations
└── types/task.ts        # Shared task types
```

## Production notes

```bash
bun run build
bun start
```

Karha requires a persistent, writable filesystem for its SQLite database. When deploying with containers or a hosting provider, mount persistent storage and point `TODO_DB_PATH` to that location. Ephemeral or serverless filesystems will not preserve task data between deployments.
