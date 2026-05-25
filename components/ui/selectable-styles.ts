import { cn } from "@/lib/cn";
import { motionInteractive } from "@/lib/motion-styles";

const selectableFocus =
  "outline-hidden focus-within:ring-2 focus-within:ring-violet-500/55 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-zinc-950";

export function selectableCardClassName({
  selected,
  className,
}: {
  selected: boolean;
  className?: string;
}) {
  return cn(
    "flex cursor-pointer flex-col border motion-safe:transition-[border-color,background-color,box-shadow] motion-safe:duration-200",
    selectableFocus,
    selected
      ? "border-violet-400/80 bg-violet-50 ring-2 ring-violet-500/35 dark:border-violet-700/70 dark:bg-violet-950/40"
      : "border-zinc-300/70 bg-white hover:border-zinc-400 hover:bg-zinc-50/80 hover:shadow-[0_2px_8px_-4px_rgb(0_0_0_/0.08)] dark:border-zinc-700/80 dark:bg-zinc-800/30 dark:hover:border-zinc-600 dark:hover:shadow-none",
    className,
  );
}

export function radioSwatchClassName({
  selected,
  className,
}: {
  selected: boolean;
  className?: string;
}) {
  return cn(
    motionInteractive,
    "relative flex cursor-pointer items-center justify-center rounded-full outline-hidden p-0.5",
    "focus-within:ring-2 focus-within:ring-violet-500/70 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-violet-400 dark:focus-within:ring-offset-zinc-950",
    selected
      ? "ring-2 ring-zinc-900 ring-offset-2 ring-offset-white dark:ring-zinc-100 dark:ring-offset-zinc-950"
      : "ring-1 ring-zinc-400/80 hover:ring-zinc-500 dark:ring-zinc-600",
    className,
  );
}

export function radioSwatchDotClassName({ size }: { size: "sm" | "md" }) {
  return cn(
    "rounded-full border border-zinc-900/10 shadow-inner dark:border-white/15",
    size === "md" ? "size-7" : "size-6",
  );
}
