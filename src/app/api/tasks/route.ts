import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TaskRow = {
  id: number;
  title: string;
  notes: string | null;
  dueDate: string | null;
  completed: 0 | 1;
};

const taskSelection = "id, title, notes, due_date AS dueDate, completed";

function serializeTask(task: TaskRow) {
  return { ...task, completed: Boolean(task.completed) };
}

export function GET() {
  const tasks = db
    .prepare(`SELECT ${taskSelection} FROM tasks ORDER BY id ASC`)
    .all() as TaskRow[];

  return NextResponse.json(tasks.map(serializeTask));
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    title?: unknown;
    notes?: unknown;
    dueDate?: unknown;
  };
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;
  const dueDate = typeof body.dueDate === "string" ? body.dueDate.trim() || null : null;

  if (!title) {
    return NextResponse.json({ error: "Task title is required." }, { status: 400 });
  }

  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return NextResponse.json({ error: "Due date must be a valid date." }, { status: 400 });
  }

  const result = db
    .prepare("INSERT INTO tasks (title, notes, due_date) VALUES (?, ?, ?)")
    .run(title, notes, dueDate);
  const task = db
    .prepare(`SELECT ${taskSelection} FROM tasks WHERE id = ?`)
    .get(result.lastInsertRowid) as TaskRow;

  return NextResponse.json(serializeTask(task), { status: 201 });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    id?: unknown;
    completed?: unknown;
  };

  if (typeof body.id !== "number" || typeof body.completed !== "boolean") {
    return NextResponse.json({ error: "A valid task id and completed value are required." }, { status: 400 });
  }

  const result = db
    .prepare("UPDATE tasks SET completed = ? WHERE id = ?")
    .run(body.completed ? 1 : 0, body.id);

  if (result.changes === 0) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  const task = db
    .prepare(`SELECT ${taskSelection} FROM tasks WHERE id = ?`)
    .get(body.id) as TaskRow;

  return NextResponse.json(serializeTask(task));
}
