"use client";

import { ArrowUp } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-zinc-200/80 pt-8 dark:border-zinc-800/90 sm:mt-20 sm:pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <Logo className="opacity-90" />
        <p className="max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Edit locally in your browser. Export when you are ready — PDF or JSON.
        </p>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          © {year} CVbuilder. All data is stored on this device unless you choose
          AI-assisted draft.
        </p>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          <ArrowUp className="size-3 shrink-0" aria-hidden />
          Top
        </Button>
      </div>
    </footer>
  );
}
