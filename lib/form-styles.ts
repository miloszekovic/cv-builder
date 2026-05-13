import { cn } from "./cn";

/** Text inputs, textareas, selects — app UI (not print). */
export const formFieldClass = cn(
  "w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2.5 text-base leading-snug text-slate-900 shadow-xs",
  "placeholder:text-slate-400",
  "dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500",
  "focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20",
);

export const formLabelClass =
  "text-sm font-medium leading-tight text-slate-700 dark:text-slate-300";
