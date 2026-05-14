"use client";

import type { CVData } from "@/lib/cv-schema";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/** Wait after last change before hitting the server (Playwright PDF). */
const PREVIEW_DEBOUNCE_MS = 900;

/**
 * Live preview = isti PDF kao „Export PDF“: POST na `/api/export-pdf`, prikaz u `<iframe>`.
 * Debounce smanjuje broj renderovanja na serveru.
 */
export function CVPreview({ cv, className }: { cv: CVData; className?: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const requestSeq = useRef(0);
  const blobUrlRef = useRef<string | null>(null);

  const replaceBlobUrl = useCallback((next: string | null) => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    if (next) blobUrlRef.current = next;
    setBlobUrl(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const seq = ++requestSeq.current;
    const timer = window.setTimeout(async () => {
      setBusy(true);
      setErr(null);
      try {
        const res = await fetch("/api/export-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cv }),
        });
        if (cancelled || requestSeq.current !== seq) return;
        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error || res.statusText || "Preview failed");
        }
        const blob = await res.blob();
        if (cancelled || requestSeq.current !== seq) return;
        const url = URL.createObjectURL(blob);
        if (cancelled || requestSeq.current !== seq) {
          URL.revokeObjectURL(url);
          return;
        }
        replaceBlobUrl(url);
      } catch (e) {
        if (cancelled || requestSeq.current !== seq) return;
        replaceBlobUrl(null);
        setErr(e instanceof Error ? e.message : "Preview failed");
      } finally {
        if (!cancelled && requestSeq.current === seq) setBusy(false);
      }
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [cv, replaceBlobUrl]);

  useEffect(
    () => () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    },
    [],
  );

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
              Isti API kao export; ako je export isključen, nema pregleda.
            </p>
          </div>
        )}
        {blobUrl && !err && (
          <iframe
            key={blobUrl}
            title="CV PDF preview"
            src={blobUrl}
            className="min-h-0 w-full flex-1 border-0 bg-white"
          />
        )}
        {showPlaceholder && (
          <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Menjaj polja da se pojavi pregled.
          </div>
        )}
      </div>
    </div>
  );
}
