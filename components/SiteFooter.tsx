"use client";

import { ArrowUp } from "lucide-react";
import { CVBuilderLogo } from "@/components/CVBuilderLogo";
import { cn } from "@/lib/cn";
import { motionInteractive } from "@/lib/motion-styles";

const backToTopClass = cn(
  motionInteractive,
  "inline-flex shrink-0 items-center gap-1 rounded-lg border border-zinc-200/80 bg-zinc-50/80 px-2 py-1 text-[0.6875rem] font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800",
);

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="print:hidden mt-16 border-t border-zinc-200/80 pt-8 dark:border-zinc-800/90 sm:mt-20 sm:pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <CVBuilderLogo className="opacity-90" />
        <p className="max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Edit locally in your browser. Export when you are ready — PDF or JSON.
        </p>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          © {year} CVbuilder. All data is stored on this device unless you choose
          AI-assisted draft.
        </p>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={backToTopClass}
          aria-label="Back to top"
        >
          <ArrowUp className="size-3 shrink-0" aria-hidden />
          Top
        </button>
      </div>
    </footer>
  );
}
