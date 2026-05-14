"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { motionInteractive } from "@/lib/motion-styles";
import {
  applyTheme,
  readStoredTheme,
  subscribeTheme,
  THEME_STORAGE_KEY,
  type AppTheme,
} from "@/lib/theme";

type ThemeSelectProps = {
  /** When true, no outer frame — use inside a bordered toolbar cell */
  embedded?: boolean;
};

export function ThemeSelect({ embedded = false }: ThemeSelectProps) {
  const theme = useSyncExternalStore(subscribeTheme, readStoredTheme, () => "dark");

  const set = (next: AppTheme) => {
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  };

  const btn = (active: boolean, kind: "dark" | "light") =>
    cn(
      motionInteractive,
      "rounded-xl p-2.5 outline-hidden",
      "focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
      "dark:focus-visible:ring-offset-zinc-900",
      kind === "dark"
        ? active
          ? "bg-violet-600 text-white shadow-[0_2px_8px_-2px_rgb(0_0_0_/0.25)] dark:bg-violet-500"
          : "text-violet-900 hover:bg-violet-100/90 dark:text-violet-200 dark:hover:bg-violet-950/50"
        : active
          ? "bg-amber-500 text-white shadow-sm dark:bg-amber-500"
          : "text-amber-900 hover:bg-amber-100/90 dark:text-amber-100 dark:hover:bg-amber-950/50",
    );

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl p-1",
        embedded
          ? "bg-transparent"
          : "border border-zinc-200/80 bg-zinc-100/90 shadow-[inset_0_1px_0_rgb(255_255_255_/0.7)] dark:border-zinc-700 dark:bg-zinc-800/90",
      )}
    >
      <button
        type="button"
        aria-label="Dark theme"
        aria-pressed={theme === "dark"}
        className={btn(theme === "dark", "dark")}
        onClick={() => set("dark")}
      >
        <Moon className="size-4.5 shrink-0" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Light theme"
        aria-pressed={theme === "light"}
        className={btn(theme === "light", "light")}
        onClick={() => set("light")}
      >
        <Sun className="size-4.5 shrink-0" aria-hidden />
      </button>
    </div>
  );
}
