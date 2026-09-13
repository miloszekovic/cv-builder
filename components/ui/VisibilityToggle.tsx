"use client";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

export function VisibilityToggle({
  visible,
  onToggle,
  label,
  className,
}: {
  visible: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={visible}
      aria-label={
        visible
          ? `${label}, visible on CV. Click to hide.`
          : `${label}, hidden on CV. Click to show.`
      }
      title={visible ? "Hide on CV" : "Show on CV"}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-500/70",
        visible
          ? "text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/40"
          : "text-zinc-400 hover:bg-zinc-200/80 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-700/80 dark:hover:text-zinc-300",
        className,
      )}
    >
      {visible ? (
        <Eye className="size-4" aria-hidden />
      ) : (
        <EyeOff className="size-4" aria-hidden />
      )}
    </button>
  );
}
