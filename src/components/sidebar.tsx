"use client";

import Link from "next/link";
import { CalendarDays, Clock3, Inbox, Plus } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "صندوق ورودی", href: "/", icon: Inbox },
  { label: "امروز", href: "/calender", icon: Clock3 },
  { label: "تقویم", href: "/calender", icon: CalendarDays },
];

const lists = [
  { label: "شخصی", color: "bg-violet-500" },
  { label: "کاری", color: "bg-sky-500" },
  { label: "خرید", color: "bg-amber-500" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-20 shrink-0 flex-col border-l border-zinc-700 bg-zinc-800 px-3 py-5 md:w-64 md:px-4">
      <Link href="/" className="mb-8 flex items-center justify-center gap-3 px-2 md:justify-start">
        <span className="grid size-9 place-items-center rounded-xl bg-white text-sm font-bold text-zinc-950">ک</span>
        <span className="hidden text-lg font-semibold tracking-tight md:block">کارها</span>
      </Link>

      <nav aria-label="ناوبری اصلی" className="space-y-1">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href && (item.href !== "/calender" || index === 2);
          const NavIcon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:justify-start ${
                isActive ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
              }`}
            >
              <NavIcon aria-hidden="true" className="size-5" />
              <span className="hidden md:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 hidden md:block">
        <div className="mb-2 flex items-center justify-between px-3">
          <p className="text-xs font-semibold text-zinc-400">فهرست‌ها</p>
          <button aria-label="افزودن فهرست" className="text-zinc-500 transition-colors hover:text-zinc-100">
            <Plus aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="space-y-1">
          {lists.map((list) => (
            <a key={list.label} href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100">
              <span className={`size-2 rounded-full ${list.color}`} />
              {list.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
