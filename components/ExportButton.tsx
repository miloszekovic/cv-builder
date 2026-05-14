"use client";

import { Download, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import type { CVData } from "@/lib/cv-schema";
import {
  PDF_LENGTH_WARNING,
  shouldWarnPdfLength,
} from "@/lib/pdf";
import { cn } from "@/lib/cn";
import { motionInteractive } from "@/lib/motion-styles";

export function ExportButton({ getCv }: { getCv: () => CVData }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function downloadPdf() {
    const cv = getCv();
    if (typeof window !== "undefined" && shouldWarnPdfLength(cv)) {
      const ok = window.confirm(PDF_LENGTH_WARNING + "\n\nContinue with export?");
      if (!ok) return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error || res.statusText || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(cv.meta.versionName || "cv").replace(/\s+/g, "-") || "cv"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  function printCv() {
    const cv = getCv();
    if (typeof window !== "undefined" && shouldWarnPdfLength(cv)) {
      const ok = window.confirm(PDF_LENGTH_WARNING + "\n\nContinue with print?");
      if (!ok) return;
    }
    window.print();
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Export and print"
    >
      <button
        type="button"
        onClick={downloadPdf}
        disabled={busy}
        aria-busy={busy}
        aria-describedby={err ? "export-pdf-error" : undefined}
        className={cn(
          motionInteractive,
          "inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-base font-semibold text-white",
          "hover:bg-blue-700 hover:brightness-105 active:brightness-95 disabled:opacity-60 motion-reduce:hover:brightness-100 motion-reduce:active:brightness-100",
        )}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Download className="size-4" aria-hidden />
        )}
        Export PDF
      </button>
      <button
        type="button"
        onClick={printCv}
        className={cn(
          motionInteractive,
          "inline-flex items-center gap-2 rounded-lg border border-slate-200/90 bg-white px-4 py-2.5 text-base font-medium text-slate-800 shadow-xs hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
        )}
      >
        <Printer className="size-4" aria-hidden />
        Print
      </button>
      {err && (
        <p id="export-pdf-error" className="text-base text-red-600 dark:text-red-400" role="alert">
          {err}
        </p>
      )}
    </div>
  );
}
