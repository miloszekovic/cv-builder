"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
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

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl p-1",
        embedded
          ? "bg-transparent"
          : "border border-zinc-300/70 bg-zinc-100 shadow-[inset_0_1px_0_rgb(255_255_255_/0.85)] dark:border-zinc-700 dark:bg-zinc-800/90 dark:shadow-none",
      )}
    >
      <Button
        variant="segment"
        segmentTone="dark"
        selected={theme === "dark"}
        aria-label="Dark theme"
        aria-pressed={theme === "dark"}
        className="dark:focus-visible:ring-offset-zinc-900"
        onClick={() => set("dark")}
      >
        <Moon className="size-4.5 shrink-0" aria-hidden />
      </Button>
      <Button
        variant="segment"
        segmentTone="light"
        selected={theme === "light"}
        aria-label="Light theme"
        aria-pressed={theme === "light"}
        className="dark:focus-visible:ring-offset-zinc-900"
        onClick={() => set("light")}
      >
        <Sun className="size-4.5 shrink-0" aria-hidden />
      </Button>
    </div>
  );
}
