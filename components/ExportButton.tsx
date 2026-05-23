"use client";

import { Download, Loader2, Printer } from "lucide-react";
import { useState, type RefObject } from "react";
import type { CVData } from "@/lib/cv-schema";
import { fetchCvPdfBlob, printPdfBlob, printPdfBlobUrl } from "@/lib/fetch-cv-pdf-client";
import { cn } from "@/lib/cn";
import { motionInteractive } from "@/lib/motion-styles";

export function ExportButton({
  getCv,
  getPdfBlob,
  getPdfBlobUrl,
  previewIframeRef,
  previewBusy,
  compact,
}: {
  getCv: () => CVData;
  /** Cached PDF from live preview — avoids duplicate server renders. */
  getPdfBlob: () => Blob | null;
  /** Same object URL as the preview iframe (do not revoke from export/print). */
  getPdfBlobUrl: () => string | null;
  previewIframeRef: RefObject<HTMLIFrameElement | null>;
  previewBusy: boolean;
  /** Smaller controls for the centered header strip. */
  compact?: boolean;
}) {
  const [busyAction, setBusyAction] = useState<"download" | "print" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const busy = busyAction !== null;

  async function resolvePdfBlob(): Promise<Blob> {
    const cached = getPdfBlob();
    if (cached) return cached;
    return fetchCvPdfBlob(getCv());
  }

  async function downloadPdf() {
    const cv = getCv();
    setBusyAction("download");
    setErr(null);
    try {
      const cachedUrl = getPdfBlobUrl();
      const blob = await resolvePdfBlob();
      const url = cachedUrl ?? URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(cv.meta.versionName || "cv").replace(/\s+/g, "-") || "cv"}.pdf`;
      a.click();
      if (!cachedUrl) URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusyAction(null);
    }
  }

  async function printCv() {
    if (previewBusy) {
      setErr("PDF preview is still generating. Try again in a moment.");
      return;
    }

    const cv = getCv();
    setBusyAction("print");
    setErr(null);
    try {
      const blob = getPdfBlob();
      const blobUrl = getPdfBlobUrl();
      const iframeWin = previewIframeRef.current?.contentWindow;

      if (blob && iframeWin) {
        iframeWin.focus();
        window.setTimeout(() => iframeWin.print(), 150);
        return;
      }

      if (blobUrl) {
        printPdfBlobUrl(blobUrl);
        return;
      }

      const pdfBlob = await fetchCvPdfBlob(cv);
      printPdfBlob(pdfBlob);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Print failed");
    } finally {
      setBusyAction(null);
    }
  }

  const primary = compact
    ? "inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2.5 text-sm font-semibold text-white"
    : "inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-base font-semibold text-white";
  const secondary = compact
    ? "inline-flex items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-800 shadow-[0_1px_2px_rgb(0_0_0_/0.04)] hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:bg-zinc-700/80"
    : "inline-flex items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-4 py-3 text-base font-medium text-zinc-800 shadow-[0_1px_2px_rgb(0_0_0_/0.04)] hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:bg-zinc-700/80";

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Export and print"
    >
      <button
        type="button"
        onClick={() => void downloadPdf()}
        disabled={busy || previewBusy}
        aria-busy={busyAction === "download"}
        aria-describedby={err ? "export-pdf-error" : undefined}
        className={cn(
          motionInteractive,
          primary,
          "hover:bg-violet-500 hover:brightness-105 active:brightness-95 disabled:opacity-60 motion-reduce:hover:brightness-100 motion-reduce:active:brightness-100",
        )}
      >
        {busyAction === "download" ? (
          <Loader2 className={compact ? "size-3.5 animate-spin" : "size-4 animate-spin"} aria-hidden />
        ) : (
          <Download className={compact ? "size-3.5" : "size-4"} aria-hidden />
        )}
        Export PDF
      </button>
      <button
        type="button"
        onClick={() => void printCv()}
        disabled={busy || previewBusy}
        aria-busy={busyAction === "print"}
        aria-describedby={err ? "export-pdf-error" : undefined}
        className={cn(motionInteractive, secondary, "disabled:opacity-60")}
      >
        {busyAction === "print" ? (
          <Loader2 className={compact ? "size-3.5 animate-spin" : "size-4 animate-spin"} aria-hidden />
        ) : (
          <Printer className={compact ? "size-3.5" : "size-4"} aria-hidden />
        )}
        Print
      </button>
      {err && (
        <p
          id="export-pdf-error"
          className={cn(
            "w-full text-red-600 dark:text-red-400",
            compact ? "text-sm" : "text-base",
          )}
          role="alert"
        >
          {err}
        </p>
      )}
    </div>
  );
}
