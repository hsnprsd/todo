"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
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

function SidebarLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <AnimatePresence initial={false}>
      <motion.span
        data-sidebar-label
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        className={className}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
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
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      data-sidebar
      className={`flex w-20 shrink-0 flex-col border-l border-zinc-700 bg-zinc-800 px-3 py-5 ${shouldAnimate ? "transition-[width,padding] duration-200" : ""} ${isCollapsed ? "md:w-20 md:px-3" : "md:w-64 md:px-4"}`}
    >
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link data-sidebar-item href="/" className={`mb-8 flex items-center justify-center gap-3 px-2 ${isCollapsed ? "md:justify-center" : "md:justify-start"}`}>
          <motion.span whileHover={{ rotate: -4 }} className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-sm font-bold text-zinc-950">ک</motion.span>
          {!isCollapsed && <SidebarLabel className="hidden text-lg font-semibold tracking-tight md:block">کارها</SidebarLabel>}
        </Link>
      </motion.div>

      <nav aria-label="ناوبری اصلی" className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const NavIcon = item.icon;
          return (
            <motion.div key={item.label} whileHover={{ x: -2 }} whileTap={{ scale: 0.98 }}>
              <Link
                data-sidebar-item
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`relative flex items-center justify-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isCollapsed ? "md:justify-center" : "md:justify-start"} ${
                  isActive ? "text-white" : "text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
                }`}
              >
                {isActive && <motion.span layoutId="active-sidebar-item" className="absolute inset-0 bg-zinc-700" />}
                <NavIcon aria-hidden="true" className="relative z-10 size-5 shrink-0" />
                {!isCollapsed && <SidebarLabel className="relative z-10 hidden md:block">{item.label}</SidebarLabel>}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <motion.button
        type="button"
        data-sidebar-item
        onClick={toggleSidebar}
        aria-label={isCollapsed ? "باز کردن نوار کناری" : "جمع کردن نوار کناری"}
        title={isCollapsed ? "باز کردن نوار کناری" : "جمع کردن نوار کناری"}
        whileHover={{ x: isCollapsed ? -2 : 2 }}
        whileTap={{ scale: 0.95 }}
        className={`mt-auto hidden items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-100 md:flex ${isCollapsed ? "justify-center" : "justify-start"}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={isCollapsed ? "open" : "close"} initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 45 }}>
            {isCollapsed ? <ChevronLeft aria-hidden="true" className="size-5 shrink-0" /> : <ChevronRight aria-hidden="true" className="size-5 shrink-0" />}
          </motion.span>
        </AnimatePresence>
        {!isCollapsed && <SidebarLabel>جمع کردن</SidebarLabel>}
      </motion.button>
    </motion.aside>
  );
}
