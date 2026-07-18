"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Repeat2 } from "lucide-react";
import { persianWeekdays, type RecurrenceType } from "@/lib/recurrence";

const weekdayNames: Record<number, string> = {
  0: "یکشنبه",
  1: "دوشنبه",
  2: "سه‌شنبه",
  3: "چهارشنبه",
  4: "پنجشنبه",
  5: "جمعه",
  6: "شنبه",
};

export default function RecurrencePicker({
  dueDate,
  type,
  weekdays,
  onTypeChange,
  onWeekdaysChange,
}: {
  dueDate: string;
  type: RecurrenceType | null;
  weekdays: number[];
  onTypeChange: (value: RecurrenceType | null) => void;
  onWeekdaysChange: (value: number[]) => void;
}) {
  function changeType(value: string) {
    const nextType = value ? value as RecurrenceType : null;
    onTypeChange(nextType);
    if (nextType === "weekly" && weekdays.length === 0) {
      const anchor = dueDate ? new Date(`${dueDate}T12:00:00`) : new Date();
      onWeekdaysChange([anchor.getDay()]);
    }
  }

  function toggleWeekday(day: number) {
    const nextDays = weekdays.includes(day)
      ? weekdays.filter((item) => item !== day)
      : [...weekdays, day];
    onWeekdaysChange(nextDays);
  }

  return (
    <div>
      <label htmlFor="task-recurrence" className="mb-1.5 block text-sm font-medium text-zinc-300">تکرار <span className="font-normal text-zinc-500">(اختیاری)</span></label>
      <div className="relative">
        <Repeat2 aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 z-10 size-4 -translate-y-1/2 text-zinc-500" />
        <select
          id="task-recurrence"
          value={type ?? ""}
          onChange={(event) => changeType(event.target.value)}
          className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800 py-2 pr-10 pl-3 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        >
          <option value="">بدون تکرار</option>
          <option value="daily">روزانه</option>
          <option value="weekly">هفتگی در روزهای مشخص</option>
          <option value="persian_monthly">ماهانه شمسی</option>
        </select>
      </div>

      <AnimatePresence>
        {type === "weekly" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-3 grid grid-cols-7 gap-1.5" aria-label="روزهای تکرار هفتگی">
              {persianWeekdays.map((day) => {
                const selected = weekdays.includes(day.value);
                return (
                  <motion.button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWeekday(day.value)}
                    whileTap={{ scale: 0.9 }}
                    aria-pressed={selected}
                    aria-label={weekdayNames[day.value]}
                    title={weekdayNames[day.value]}
                    className={`grid aspect-square place-items-center rounded-lg border text-xs transition-colors ${selected ? "border-green-500 bg-green-500/15 text-green-300" : "border-zinc-700 bg-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"}`}
                  >
                    {day.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {type && !dueDate && <p className="mt-2 text-xs text-amber-400">برای کار تکرارشونده تاریخ سررسید انتخاب کنید.</p>}
      {type === "weekly" && weekdays.length === 0 && <p className="mt-2 text-xs text-amber-400">حداقل یک روز هفته را انتخاب کنید.</p>}
      {type === "persian_monthly" && dueDate && <p className="mt-2 text-xs text-zinc-500">در همان روز از هر ماه شمسی تکرار می‌شود.</p>}
    </div>
  );
}
