"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import {
  applyTheme,
  readStoredTheme,
  subscribeTheme,
  THEME_STORAGE_KEY,
  type AppTheme,
} from "@/lib/theme";

export function ThemeSelect() {
  const theme = useSyncExternalStore(subscribeTheme, readStoredTheme, () => "dark");

  const set = (next: AppTheme) => {
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  };

  const btn = (active: boolean) =>
    cn(
      "rounded-lg p-2 outline-hidden transition-colors",
      "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
      "dark:focus-visible:ring-offset-slate-900",
      active
        ? "bg-slate-900 text-white dark:bg-blue-600 dark:text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
    );

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-slate-200/90 bg-white p-1 shadow-xs",
        "dark:border-slate-600 dark:bg-slate-900",
      )}
    >
      <button
        type="button"
        aria-label="Dark theme"
        aria-pressed={theme === "dark"}
        className={btn(theme === "dark")}
        onClick={() => set("dark")}
      >
        <Moon className="size-[1.125rem] shrink-0" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Light theme"
        aria-pressed={theme === "light"}
        className={btn(theme === "light")}
        onClick={() => set("light")}
      >
        <Sun className="size-[1.125rem] shrink-0" aria-hidden />
      </button>
    </div>
  );
}
