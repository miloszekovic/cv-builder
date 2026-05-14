"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
};

const WORDMARK_CLASS = cn(
  "bg-linear-to-br from-cyan-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-sm font-semibold tracking-tight text-transparent sm:text-base",
  "dark:from-cyan-400 dark:via-indigo-400 dark:to-fuchsia-400",
);

function CodeGradient({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient
        id={id}
        x1="4"
        y1="6"
        x2="36"
        y2="34"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#22d3ee" />
        <stop offset="0.45" stopColor="#6366f1" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
    </defs>
  );
}

function CodeMarkPaths({ gradId }: { gradId: string }) {
  const strokeUrl = `url(#${gradId})`;
  const common = {
    fill: "none" as const,
    stroke: strokeUrl,
    strokeWidth: 3.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <>
      <path d="M 11 8.5 L 5.5 20 L 11 31.5" {...common} />
      <path d="M 18.5 8 L 21.5 32" {...common} />
      <path d="M 29 8.5 L 34.5 20 L 29 31.5" {...common} />
    </>
  );
}

/** `</>` mark only (gradient stroke). */
export function CVBuilderMark({ className }: { className?: string }) {
  const gradId = `${useId().replace(/:/g, "")}-code`;
  return (
    <svg
      className={cn("size-7 shrink-0 drop-shadow-sm sm:size-8", className)}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <CodeGradient id={gradId} />
      <CodeMarkPaths gradId={gradId} />
    </svg>
  );
}

/** Gradient “CVbuilder” title text. */
export function CVBuilderWordmark({ className }: { className?: string }) {
  return <span className={cn(WORDMARK_CLASS, className)}>CVbuilder</span>;
}

/** Mark + wordmark in one inline cluster. */
export function CVBuilderLogo({ className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-px text-slate-900 dark:text-slate-50",
        className,
      )}
    >
      <CVBuilderMark />
      <CVBuilderWordmark />
    </span>
  );
}
