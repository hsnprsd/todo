export type Task = {
  id: number;
  title: string;
  notes: string | null;
  dueDate: string | null;
  completed: boolean;
};
