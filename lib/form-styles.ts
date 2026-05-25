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
export const formLabelControlStack = "flex flex-col gap-2";

/** Vertical rhythm for labelled fields inside a section or nested group. */
export const formFieldsStackClass = "flex flex-col gap-6";

/** Editor section card — form fields on the left column. */
export const editorSectionClass =
  "space-y-4 rounded-2xl border border-zinc-200/80 bg-white px-6 pt-5 pb-4 shadow-[0_1px_4px_rgb(0_0_0_/0.05)] dark:border-zinc-700/60 dark:bg-zinc-900/50 dark:shadow-[0_1px_3px_rgb(0_0_0_/0.04)] sm:px-7 sm:pt-6 sm:pb-4";

/** Live preview panel on the right — separate from form section spacing. */
export const editorPreviewSectionClass =
  "space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_1px_4px_rgb(0_0_0_/0.05)] dark:border-zinc-700/60 dark:bg-zinc-900/50 dark:shadow-[0_1px_3px_rgb(0_0_0_/0.04)] sm:p-7";

export const editorSectionTitleClass =
  "border-b border-zinc-200/80 pb-2.5 text-xl font-semibold tracking-tight text-zinc-900 dark:border-zinc-800/90 dark:text-zinc-50";

/** Nested block inside a section (e.g. one experience role) — tinted tray for white field cards. */
export const formNestedGroupClass =
  "flex flex-col gap-6 rounded-xl border border-zinc-200/70 bg-zinc-50 p-5 shadow-[inset_0_1px_0_rgb(255_255_255_/0.9)] sm:p-6 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:shadow-none";

export const formNestedGroupHeaderClass =
  "flex flex-wrap items-center justify-between gap-2 border-b border-zinc-300/60 pb-4 dark:border-zinc-700/60";

export const formNestedGroupTitleClass =
  "text-sm font-semibold tracking-tight text-zinc-800 dark:text-zinc-200";

const formFieldBaseClass =
  "w-full min-h-11 rounded-lg px-3.5 py-2.5 text-[0.9375rem] leading-snug text-zinc-900 antialiased placeholder:text-zinc-400 caret-violet-600 transition-[border-color,box-shadow,background-color] duration-200 ease-out motion-reduce:duration-75 focus:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-[0.52] dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:caret-violet-400";

/** Fields on white section cards — subtle fill so inputs don't merge with the card. */
export const formFieldSectionClass = cn(
  formFieldBaseClass,
  "border border-zinc-300/70 bg-white shadow-[0_1px_2px_rgb(0_0_0_/0.04)]",
  "hover:border-zinc-400/80 hover:bg-zinc-50/80",
  "dark:border-zinc-600/80 dark:bg-zinc-900/65 dark:shadow-[inset_0_1px_0_rgb(255_255_255_/0.04)]",
  "dark:hover:border-zinc-500 dark:hover:bg-zinc-900/80",
  "focus:border-violet-400 focus:bg-white focus:shadow-[0_0_0_3px_rgb(139_92_246_/0.16)]",
  "dark:focus:border-violet-400 dark:focus:bg-zinc-950 dark:focus:shadow-[0_0_0_3px_rgb(167_139_250_/0.2)]",
);

/** Fields inside nested groups — white cards on the tinted tray. */
export const formFieldSoftClass = cn(
  formFieldBaseClass,
  "border border-zinc-200/90 bg-white shadow-[0_1px_2px_rgb(0_0_0_/0.05)]",
  "hover:border-zinc-300 hover:shadow-[0_1px_3px_rgb(0_0_0_/0.07)]",
  "dark:border-zinc-600/85 dark:bg-zinc-900/70 dark:shadow-[0_1px_2px_rgb(0_0_0_/0.25)]",
  "dark:hover:border-zinc-500 dark:hover:bg-zinc-900/85",
  "focus:border-violet-400 focus:shadow-[0_0_0_3px_rgb(139_92_246_/0.16),0_1px_2px_rgb(0_0_0_/0.05)]",
  "dark:focus:border-violet-400 dark:focus:bg-zinc-950 dark:focus:shadow-[0_0_0_3px_rgb(167_139_250_/0.2),0_1px_2px_rgb(0_0_0_/0.25)]",
);

export const formSelectSectionClass = cn(formFieldSectionClass, "select-chevron cursor-pointer max-w-full");
export const formSelectSoftClass = cn(formFieldSoftClass, "select-chevron cursor-pointer max-w-full");


/** Outer shell wrapping editor tabs + form / preview columns. */
export const editorWorkspaceShellClass =
  "rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_4px_rgb(0_0_0_/0.05)] dark:border-zinc-700/60 dark:bg-zinc-950/30 dark:shadow-[0_1px_3px_rgb(0_0_0_/0.04)]";

export const editorWorkspaceTabBarClass =
  "border-b border-zinc-200/80 bg-zinc-50/95 px-4 py-4 sm:px-6 sm:py-5 dark:border-zinc-700/70 dark:bg-zinc-900/40";

export const editorWorkspaceBodyClass =
  "grid gap-6 px-4 pt-4 pb-4 sm:gap-8 sm:px-6 sm:pt-6 sm:pb-4 lg:grid-cols-2 lg:items-start xl:gap-x-10";

/** Selects: same as fields plus custom chevron and room for the glyph on the right. */
export const formSelectClass = cn(formFieldClass, "select-chevron cursor-pointer max-w-full");
