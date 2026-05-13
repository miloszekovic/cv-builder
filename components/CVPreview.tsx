"use client";

import type { CVData } from "@/lib/cv-schema";
import { CVPrint } from "@/components/print/CVPrint";
import { cn } from "@/lib/cn";

export function CVPreview({ cv, className }: { cv: CVData; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-auto rounded-2xl border border-slate-200/90 bg-linear-to-b from-slate-200/70 to-slate-100/90 p-4 shadow-inner dark:border-slate-700/90 dark:from-slate-900 dark:to-slate-950 sm:p-6",
        className,
      )}
    >
      <div className="mx-auto flex max-w-full justify-center">
        <div
          className="origin-top scale-[0.68] sm:scale-[0.78] md:scale-[0.85] lg:scale-[0.9]"
          style={{ width: "210mm" }}
        >
          <div
            className="overflow-hidden rounded-md border border-slate-300/90 bg-white text-slate-900 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/4 dark:border-slate-600 dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] dark:ring-white/6"
            style={{ colorScheme: "light" }}
          >
            <CVPrint cv={cv} />
          </div>
        </div>
      </div>
    </div>
  );
}
