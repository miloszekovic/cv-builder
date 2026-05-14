import { cn } from "./cn";

/** Text inputs, textareas, selects — app UI (not print). */
export const formFieldClass = cn(
  "w-full rounded-lg border border-slate-300/90 bg-slate-50/95 px-3 py-2.5 text-base leading-snug text-slate-900 shadow-xs ring-1 ring-slate-950/4",
  "placeholder:text-slate-400",
  "transition-[border-color,box-shadow,background-color,ring-color] duration-200 ease-out motion-reduce:duration-75",
  "hover:border-slate-400 hover:bg-white hover:shadow-md hover:ring-slate-950/7",
  "dark:border-slate-600 dark:bg-slate-950/85 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-black/25 dark:ring-white/5",
  "dark:hover:border-slate-500 dark:hover:bg-slate-900 dark:hover:shadow-lg dark:hover:shadow-black/40 dark:hover:ring-white/8",
  "focus:border-blue-500 focus:bg-white focus:shadow-md focus:outline-hidden focus:ring-2 focus:ring-blue-500/25",
  "dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-400/30",
);

export const formLabelClass =
  "text-sm font-medium leading-tight text-slate-700 dark:text-slate-300";

/** Selects: same as fields plus custom chevron and room for the glyph on the right. */
export const formSelectClass = cn(formFieldClass, "select-chevron cursor-pointer max-w-full");
