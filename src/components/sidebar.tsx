"use client";

import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

const navItems = [
  { label: "صندوق ورودی", href: "/", icon: Inbox },
  { label: "تقویم", href: "/calender", icon: CalendarDays },
];

const sidebarStorageKey = "todo-sidebar-collapsed";
const sidebarChangeEvent = "todo-sidebar-change";

function getSidebarState() {
  return window.localStorage.getItem(sidebarStorageKey) === "true";
}

function subscribeToSidebarState(callback: () => void) {
  function handleChange() {
    document.documentElement.classList.toggle("sidebar-collapsed", getSidebarState());
    callback();
  }

  window.addEventListener("storage", handleChange);
  window.addEventListener(sidebarChangeEvent, handleChange);
  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(sidebarChangeEvent, handleChange);
  };
}

export default function Sidebar() {
  const pathname = usePathname();
  const isCollapsed = useSyncExternalStore(subscribeToSidebarState, getSidebarState, () => false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  function toggleSidebar() {
    setShouldAnimate(true);
    window.localStorage.setItem(sidebarStorageKey, String(!isCollapsed));
    window.dispatchEvent(new Event(sidebarChangeEvent));
  }

  return (
    <aside data-sidebar className={`flex w-20 shrink-0 flex-col border-l border-zinc-700 bg-zinc-800 px-3 py-5 ${shouldAnimate ? "transition-[width] duration-200" : ""} ${isCollapsed ? "md:w-20 md:px-3" : "md:w-64 md:px-4"}`}>
      <Link data-sidebar-item href="/" className={`mb-8 flex items-center justify-center gap-3 px-2 ${isCollapsed ? "md:justify-center" : "md:justify-start"}`}>
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-sm font-bold text-zinc-950">ک</span>
        {!isCollapsed && <span data-sidebar-label className="hidden text-lg font-semibold tracking-tight md:block">کارها</span>}
      </Link>

      <nav aria-label="ناوبری اصلی" className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const NavIcon = item.icon;
          return (
            <Link
              key={item.label}
              data-sidebar-item
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isCollapsed ? "md:justify-center" : "md:justify-start"} ${
                isActive ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
              }`}
            >
              <NavIcon aria-hidden="true" className="size-5 shrink-0" />
              {!isCollapsed && <span data-sidebar-label className="hidden md:block">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        data-sidebar-item
        onClick={toggleSidebar}
        aria-label={isCollapsed ? "باز کردن نوار کناری" : "جمع کردن نوار کناری"}
        title={isCollapsed ? "باز کردن نوار کناری" : "جمع کردن نوار کناری"}
        className={`mt-auto hidden items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-100 md:flex ${isCollapsed ? "justify-center" : "justify-start"}`}
      >
        {isCollapsed ? <ChevronLeft aria-hidden="true" className="size-5 shrink-0" /> : <ChevronRight aria-hidden="true" className="size-5 shrink-0" />}
        {!isCollapsed && <span data-sidebar-label>جمع کردن</span>}
      </button>
    </aside>
  );
}
