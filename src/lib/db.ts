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
    completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);
