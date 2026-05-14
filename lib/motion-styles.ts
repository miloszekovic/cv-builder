import { cn } from "./cn";

/** Buttons and controls — smooth hover without layout shift */
export const motionInteractive = cn(
  "transition-[color,background-color,border-color,box-shadow,opacity,filter] duration-200 ease-[cubic-bezier(0.33,1,0.68,1)]",
  "motion-reduce:duration-75",
);

/** Text links (Add …, etc.) */
export const motionLink = cn(
  "underline-offset-[0.18em] decoration-from-font",
  "transition-[color,text-decoration-color,opacity] duration-200 ease-out",
  "motion-reduce:duration-75",
);

/** Text-only actions (+ Add …) — no underline */
export const motionTextButton = cn(
  "transition-[color,opacity] duration-200 ease-out motion-reduce:duration-75",
);
