export type RecurrenceType = "daily" | "weekly" | "persian_monthly";

export const persianWeekdays = [
  { value: 6, label: "ش" },
  { value: 0, label: "ی" },
  { value: 1, label: "د" },
  { value: 2, label: "س" },
  { value: 3, label: "چ" },
  { value: 4, label: "پ" },
  { value: 5, label: "ج" },
] as const;

function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function persianDateParts(dateKey: string) {
  const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  }).formatToParts(new Date(`${dateKey}T12:00:00Z`));
  const getPart = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: getPart("year"), month: getPart("month"), day: getPart("day") };
}

function nextPersianMonth(dateKey: string) {
  const current = persianDateParts(dateKey);
  const targetMonth = current.month === 12 ? 1 : current.month + 1;
  const targetYear = current.month === 12 ? current.year + 1 : current.year;
  let lastDateInTargetMonth = "";

  for (let offset = 1; offset <= 45; offset += 1) {
    const candidate = addDays(dateKey, offset);
    const parts = persianDateParts(candidate);
    if (parts.year === targetYear && parts.month === targetMonth) {
      lastDateInTargetMonth = candidate;
      if (parts.day === current.day) return candidate;
    } else if (lastDateInTargetMonth) {
      return lastDateInTargetMonth;
    }
  }

  return lastDateInTargetMonth || addDays(dateKey, 30);
}

export function getNextDueDate(dueDate: string, recurrenceType: RecurrenceType, weekdays: number[]) {
  if (recurrenceType === "daily") return addDays(dueDate, 1);
  if (recurrenceType === "persian_monthly") return nextPersianMonth(dueDate);

  const selectedDays = new Set(weekdays);
  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = addDays(dueDate, offset);
    if (selectedDays.has(new Date(`${candidate}T12:00:00Z`).getUTCDay())) return candidate;
  }
  return addDays(dueDate, 7);
}

export function recurrenceLabel(type: RecurrenceType | null, weekdays: number[]) {
  if (type === "daily") return "هر روز";
  if (type === "persian_monthly") return "هر ماه شمسی";
  if (type === "weekly") {
    const labels = persianWeekdays.filter((day) => weekdays.includes(day.value)).map((day) => day.label);
    return labels.length ? `هفتگی: ${labels.join("، ")}` : "هفتگی";
  }
  return "بدون تکرار";
}
