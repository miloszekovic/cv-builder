"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import type { CVData } from "@/lib/cv-schema";
import { fetchCvPdfBlob } from "@/lib/fetch-cv-pdf-client";
import { cn } from "@/lib/cn";
import { motionInteractive } from "@/lib/motion-styles";

export function ExportButton({
  getCv,
  getPdfBlob,
  getPdfBlobUrl,
  previewBusy,
  compact,
}: {
  getCv: () => CVData;
  /** Cached PDF from live preview — avoids duplicate server renders. */
  getPdfBlob: () => Blob | null;
  /** Same object URL as the preview iframe (do not revoke from export). */
  getPdfBlobUrl: () => string | null;
  previewBusy: boolean;
  /** Smaller controls for the centered header strip. */
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function resolvePdfBlob(): Promise<Blob> {
    const cached = getPdfBlob();
    if (cached) return cached;
    return fetchCvPdfBlob(getCv());
  }

  async function downloadPdf() {
    const cv = getCv();
    setBusy(true);
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
      setBusy(false);
    }
  }

  const primary = compact
    ? "inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2.5 text-sm font-semibold text-white"
    : "inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-base font-semibold text-white";

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Export PDF"
    >
      <button
        type="button"
        onClick={() => void downloadPdf()}
        disabled={busy || previewBusy}
        aria-busy={busy}
        aria-describedby={err ? "export-pdf-error" : undefined}
        className={cn(
          motionInteractive,
          primary,
          "hover:bg-violet-500 hover:brightness-105 active:brightness-95 disabled:opacity-60 motion-reduce:hover:brightness-100 motion-reduce:active:brightness-100",
        )}
      >
        {busy ? (
          <Loader2 className={compact ? "size-3.5 animate-spin" : "size-4 animate-spin"} aria-hidden />
        ) : (
          <Download className={compact ? "size-3.5" : "size-4"} aria-hidden />
        )}
        Export PDF
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
