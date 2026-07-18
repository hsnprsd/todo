import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getNextDueDate, type RecurrenceType } from "@/lib/recurrence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TaskRow = {
  id: number;
  title: string;
  notes: string | null;
  dueDate: string | null;
  completed: 0 | 1;
  recurrenceType: RecurrenceType | null;
  recurrenceWeekdays: string;
  recurrenceGenerated: 0 | 1;
};

const taskSelection = `
  id,
  title,
  notes,
  due_date AS dueDate,
  completed,
  recurrence_type AS recurrenceType,
  recurrence_weekdays AS recurrenceWeekdays,
  recurrence_generated AS recurrenceGenerated
`;

function parseWeekdays(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((day): day is number => Number.isInteger(day) && day >= 0 && day <= 6)
      : [];
  } catch {
    return [];
  }
}

function serializeTask(task: TaskRow) {
  return {
    id: task.id,
    title: task.title,
    notes: task.notes,
    dueDate: task.dueDate,
    completed: Boolean(task.completed),
    recurrenceType: task.recurrenceType,
    recurrenceWeekdays: parseWeekdays(task.recurrenceWeekdays),
  };
}

function parseRecurrence(type: unknown, weekdays: unknown) {
  if (type === null || type === undefined || type === "") {
    return { recurrenceType: null, recurrenceWeekdays: [] } as const;
  }
  if (type !== "daily" && type !== "weekly" && type !== "persian_monthly") return null;
  const recurrenceWeekdays = Array.isArray(weekdays)
    ? [...new Set(weekdays.filter((day): day is number => Number.isInteger(day) && day >= 0 && day <= 6))]
    : [];
  if (type === "weekly" && recurrenceWeekdays.length === 0) return null;
  return { recurrenceType: type as RecurrenceType, recurrenceWeekdays };
}

function isValidDate(value: string | null) {
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function selectTask(id: number | bigint) {
  return db.prepare(`SELECT ${taskSelection} FROM tasks WHERE id = ?`).get(id) as TaskRow;
}

function generateNextOccurrence(task: TaskRow) {
  if (!task.recurrenceType || !task.dueDate || task.recurrenceGenerated) return null;
  const weekdays = parseWeekdays(task.recurrenceWeekdays);
  const nextDueDate = getNextDueDate(task.dueDate, task.recurrenceType, weekdays);

  db.prepare("UPDATE tasks SET recurrence_generated = 1 WHERE id = ?").run(task.id);
  const result = db.prepare(`
    INSERT INTO tasks (title, notes, due_date, sort_order, recurrence_type, recurrence_weekdays)
    VALUES (?, ?, ?, COALESCE((SELECT MAX(sort_order) + 1 FROM tasks), 1), ?, ?)
  `).run(task.title, task.notes, nextDueDate, task.recurrenceType, task.recurrenceWeekdays);
  return selectTask(result.lastInsertRowid);
}

export function GET() {
  const tasks = db
    .prepare(`SELECT ${taskSelection} FROM tasks ORDER BY sort_order ASC, id ASC`)
    .all() as TaskRow[];
  return NextResponse.json(tasks.map(serializeTask));
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    title?: unknown;
    notes?: unknown;
    dueDate?: unknown;
    recurrenceType?: unknown;
    recurrenceWeekdays?: unknown;
  };
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;
  const dueDate = typeof body.dueDate === "string" ? body.dueDate.trim() || null : null;
  const recurrence = parseRecurrence(body.recurrenceType, body.recurrenceWeekdays);

  if (!title) return NextResponse.json({ error: "عنوان کار الزامی است." }, { status: 400 });
  if (!isValidDate(dueDate)) return NextResponse.json({ error: "تاریخ سررسید معتبر نیست." }, { status: 400 });
  if (!recurrence) return NextResponse.json({ error: "الگوی تکرار معتبر نیست." }, { status: 400 });
  if (recurrence.recurrenceType && !dueDate) {
    return NextResponse.json({ error: "کار تکرارشونده به تاریخ سررسید نیاز دارد." }, { status: 400 });
  }

  const result = db.prepare(`
    INSERT INTO tasks (title, notes, due_date, sort_order, recurrence_type, recurrence_weekdays)
    VALUES (?, ?, ?, COALESCE((SELECT MAX(sort_order) + 1 FROM tasks), 1), ?, ?)
  `).run(title, notes, dueDate, recurrence.recurrenceType, JSON.stringify(recurrence.recurrenceWeekdays));

  return NextResponse.json(serializeTask(selectTask(result.lastInsertRowid)), { status: 201 });
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as { id?: unknown };
  if (typeof body.id !== "number" || !Number.isInteger(body.id)) {
    return NextResponse.json({ error: "شناسه کار معتبر نیست." }, { status: 400 });
  }
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(body.id);
  if (result.changes === 0) return NextResponse.json({ error: "کار پیدا نشد." }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    id?: unknown;
    title?: unknown;
    notes?: unknown;
    completed?: unknown;
    dueDate?: unknown;
    recurrenceType?: unknown;
    recurrenceWeekdays?: unknown;
    orderedIds?: unknown;
  };

  if (Array.isArray(body.orderedIds)) {
    const orderedIds = body.orderedIds;
    const invalid = orderedIds.some((id) => typeof id !== "number" || !Number.isInteger(id));
    if (invalid || new Set(orderedIds).size !== orderedIds.length) {
      return NextResponse.json({ error: "ترتیب کارها معتبر نیست." }, { status: 400 });
    }
    const updateOrder = db.prepare("UPDATE tasks SET sort_order = ? WHERE id = ?");
    db.transaction((ids: number[]) => ids.forEach((id, index) => updateOrder.run(index + 1, id)))(orderedIds as number[]);
    return NextResponse.json({ success: true });
  }

  if (typeof body.id === "number" && typeof body.title === "string") {
    const title = body.title.trim();
    const notes = typeof body.notes === "string" ? body.notes.trim() || null : null;
    const dueDate = typeof body.dueDate === "string" ? body.dueDate.trim() || null : null;
    const recurrence = parseRecurrence(body.recurrenceType, body.recurrenceWeekdays);
    if (!title) return NextResponse.json({ error: "عنوان کار الزامی است." }, { status: 400 });
    if (!isValidDate(dueDate)) return NextResponse.json({ error: "تاریخ سررسید معتبر نیست." }, { status: 400 });
    if (typeof body.completed !== "boolean" || !recurrence) {
      return NextResponse.json({ error: "به‌روزرسانی کار معتبر نیست." }, { status: 400 });
    }
    if (recurrence.recurrenceType && !dueDate) {
      return NextResponse.json({ error: "کار تکرارشونده به تاریخ سررسید نیاز دارد." }, { status: 400 });
    }

    const mutation = db.transaction(() => {
      const previous = selectTask(body.id as number);
      if (!previous) return null;
      db.prepare(`
        UPDATE tasks
        SET title = ?, notes = ?, due_date = ?, completed = ?, recurrence_type = ?, recurrence_weekdays = ?
        WHERE id = ?
      `).run(title, notes, dueDate, body.completed ? 1 : 0, recurrence.recurrenceType, JSON.stringify(recurrence.recurrenceWeekdays), body.id);
      const task = selectTask(body.id as number);
      const nextTask = !previous.completed && body.completed ? generateNextOccurrence(task) : null;
      return { task, nextTask };
    })();

    if (!mutation) return NextResponse.json({ error: "کار پیدا نشد." }, { status: 404 });
    return NextResponse.json({ task: serializeTask(mutation.task), nextTask: mutation.nextTask ? serializeTask(mutation.nextTask) : null });
  }

  if (typeof body.id === "number" && typeof body.dueDate === "string") {
    if (!isValidDate(body.dueDate)) return NextResponse.json({ error: "تاریخ سررسید معتبر نیست." }, { status: 400 });
    const result = db.prepare("UPDATE tasks SET due_date = ? WHERE id = ?").run(body.dueDate, body.id);
    if (result.changes === 0) return NextResponse.json({ error: "کار پیدا نشد." }, { status: 404 });
    return NextResponse.json({ task: serializeTask(selectTask(body.id)), nextTask: null });
  }

  if (typeof body.id !== "number" || typeof body.completed !== "boolean") {
    return NextResponse.json({ error: "به‌روزرسانی کار معتبر نیست." }, { status: 400 });
  }

  const mutation = db.transaction(() => {
    const previous = selectTask(body.id as number);
    if (!previous) return null;
    db.prepare("UPDATE tasks SET completed = ? WHERE id = ?").run(body.completed ? 1 : 0, body.id);
    const task = selectTask(body.id as number);
    const nextTask = !previous.completed && body.completed ? generateNextOccurrence(task) : null;
    return { task, nextTask };
  })();

  if (!mutation) return NextResponse.json({ error: "کار پیدا نشد." }, { status: 404 });
  return NextResponse.json({ task: serializeTask(mutation.task), nextTask: mutation.nextTask ? serializeTask(mutation.nextTask) : null });
}
