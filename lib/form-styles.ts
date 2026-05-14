import { cn } from "./cn";

/** Text inputs, textareas, selects — app UI (not print). */
export const formFieldClass = cn(
  "w-full min-h-11 rounded-[0.875rem] border border-zinc-200 bg-white px-4 py-2.5 text-[0.9375rem] leading-snug text-zinc-900 antialiased",
  "shadow-[inset_0_1px_0_rgb(255_255_255_/0.7),0_1px_2px_rgb(0_0_0_/0.045)]",
  "placeholder:text-zinc-400 placeholder:transition-colors",
  "caret-violet-600 dark:caret-violet-400",
  "transition-[border-color,box-shadow,background-color,color] duration-200 ease-out motion-reduce:duration-75",
  "hover:border-zinc-300 hover:bg-zinc-50/95",
  "dark:border-zinc-600 dark:bg-zinc-900/55 dark:text-zinc-50 dark:placeholder:text-zinc-500",
  "dark:shadow-[inset_0_1px_0_rgb(255_255_255_/0.05),0_1px_2px_rgb(0_0_0_/0.35)]",
  "dark:hover:border-zinc-500 dark:hover:bg-zinc-900/85",
  "focus:border-violet-500 focus:bg-white focus:shadow-[0_0_0_3px_rgb(139_92_246_/0.2),0_1px_3px_rgb(0_0_0_/0.06)] focus:outline-hidden",
  "dark:focus:border-violet-400 dark:focus:bg-zinc-950 dark:focus:shadow-[0_0_0_3px_rgb(167_139_250_/0.24),0_1px_3px_rgb(0_0_0_/0.4)]",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-[0.52]",
  "read-only:border-zinc-200/80 read-only:bg-zinc-50 read-only:text-zinc-700 dark:read-only:border-zinc-700 dark:read-only:bg-zinc-900/40 dark:read-only:text-zinc-300",
);

export const formLabelClass =
  "text-[0.8125rem] font-medium leading-snug tracking-wide text-zinc-600 dark:text-zinc-400";

/** Label text stacked above an input/textarea (`<label className={formLabelControlStack}>`). */
export const formLabelControlStack = "flex flex-col gap-2.5";

/** Selects: same as fields plus custom chevron and room for the glyph on the right. */
export const formSelectClass = cn(formFieldClass, "select-chevron cursor-pointer max-w-full");
