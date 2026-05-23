"use client";

import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

export const CVPreview = forwardRef<
  HTMLIFrameElement,
  {
    blobUrl: string | null;
    busy: boolean;
    err: string | null;
    className?: string;
  }
>(function CVPreview({ blobUrl, busy, err, className }, ref) {
  const showPlaceholder = !blobUrl && !busy && !err;

  return (
    <div
      className={cn(
        "flex min-h-0 w-full flex-col overflow-hidden rounded-3xl border border-zinc-200/75 bg-linear-to-b from-zinc-100/90 to-zinc-50/95 p-5 shadow-[inset_0_1px_0_rgb(255_255_255_/0.65)] dark:border-zinc-700/70 dark:from-zinc-900 dark:to-zinc-950 dark:shadow-none sm:p-6",
        className,
      )}
    >
      <div className="relative flex h-[clamp(416px,calc((100vh-9rem)*0.8),896px)] flex-col overflow-hidden rounded-2xl border border-zinc-300/50 bg-white shadow-[0_2px_16px_-6px_rgb(0_0_0_/0.12)] dark:border-zinc-600/60 dark:bg-zinc-950">
        {busy && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/85 text-zinc-600 backdrop-blur-sm dark:bg-zinc-950/85 dark:text-zinc-300"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="size-8 animate-spin text-violet-500 dark:text-violet-400" aria-hidden />
            <span className="text-sm font-medium tracking-tight text-zinc-700 dark:text-zinc-200">
              Generating PDF preview…
            </span>
          </div>
        )}
        {err && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="text-sm font-medium text-red-700 dark:text-red-400" role="alert">
              {err}
            </p>
            <p className="max-w-sm text-xs text-zinc-600 dark:text-zinc-400">
              Uses the same API as export; if export is disabled, preview is unavailable.
            </p>
          </div>
        )}
        {blobUrl && !err && (
          <iframe
            ref={ref}
            key={blobUrl}
            title="CV PDF preview"
            src={blobUrl}
            className="min-h-0 w-full flex-1 border-0 bg-white"
          />
        )}
        {showPlaceholder && (
          <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Edit fields to generate a preview.
          </div>
        )}
      </div>
    </div>
  );
});
