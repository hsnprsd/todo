"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import gregorianEn from "react-date-object/locales/gregorian_en";
import persianFa from "react-date-object/locales/persian_fa";

export default function PersianDatePicker({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedDate = value
    ? new DateObject({ date: value, calendar: gregorian, locale: gregorianEn, format: "YYYY-MM-DD" }).convert(persian, persianFa)
    : null;

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="relative">
      <DatePicker
        id={id}
        value={selectedDate}
        calendar={persian}
        locale={persianFa}
        format="YYYY/MM/DD"
        editable={false}
        calendarPosition="bottom-right"
        className="bg-dark green"
        containerClassName="w-full"
        inputClass="w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 pl-10 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        placeholder="انتخاب تاریخ شمسی"
        onChange={(date) => {
          if (!date) {
            onChange("");
            return;
          }
          const gregorianDate = new DateObject(date).convert(gregorian, gregorianEn);
          onChange(gregorianDate.format("YYYY-MM-DD"));
        }}
      />
      <AnimatePresence>
        {value && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7, y: "-50%" }}
          animate={{ opacity: 1, scale: 1, y: "-50%" }}
          exit={{ opacity: 0, scale: 0.7, y: "-50%" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => onChange("")}
          aria-label="پاک کردن تاریخ سررسید"
          title="پاک کردن تاریخ"
          className="absolute left-2 top-1/2 grid size-6 place-items-center rounded text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200"
        >
          <X aria-hidden="true" className="size-3.5" />
        </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
