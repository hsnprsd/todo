import type { RecurrenceType } from "@/lib/recurrence";

export type Task = {
  id: number;
  title: string;
  notes: string | null;
  dueDate: string | null;
  completed: boolean;
  recurrenceType: RecurrenceType | null;
  recurrenceWeekdays: number[];
};
