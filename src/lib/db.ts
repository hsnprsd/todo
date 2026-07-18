import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

const databasePath = process.env.TODO_DB_PATH ?? path.join(process.cwd(), "data", "todo.db");
mkdirSync(path.dirname(databasePath), { recursive: true });

const globalForDatabase = globalThis as unknown as {
  todoDatabase?: Database.Database;
};

export const db = globalForDatabase.todoDatabase ?? new Database(databasePath);

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.todoDatabase = db;
}

db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    notes TEXT,
    due_date TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
    recurrence_type TEXT CHECK (recurrence_type IN ('daily', 'weekly', 'persian_monthly')),
    recurrence_weekdays TEXT NOT NULL DEFAULT '[]',
    recurrence_generated INTEGER NOT NULL DEFAULT 0 CHECK (recurrence_generated IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const taskColumns = db.prepare("PRAGMA table_info(tasks)").all() as Array<{ name: string }>;
const taskColumnNames = new Set(taskColumns.map((column) => column.name));

if (!taskColumnNames.has("notes")) {
  db.exec("ALTER TABLE tasks ADD COLUMN notes TEXT");
}

if (!taskColumnNames.has("due_date")) {
  db.exec("ALTER TABLE tasks ADD COLUMN due_date TEXT");
}

if (!taskColumnNames.has("sort_order")) {
  db.exec("ALTER TABLE tasks ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0");
  db.exec("UPDATE tasks SET sort_order = id");
}

if (!taskColumnNames.has("recurrence_type")) {
  db.exec("ALTER TABLE tasks ADD COLUMN recurrence_type TEXT");
}

if (!taskColumnNames.has("recurrence_weekdays")) {
  db.exec("ALTER TABLE tasks ADD COLUMN recurrence_weekdays TEXT NOT NULL DEFAULT '[]'");
}

if (!taskColumnNames.has("recurrence_generated")) {
  db.exec("ALTER TABLE tasks ADD COLUMN recurrence_generated INTEGER NOT NULL DEFAULT 0");
}
