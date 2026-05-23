import type { CVData } from "./cv-schema";

export async function fetchCvPdfBlob(cv: CVData, signal?: AbortSignal): Promise<Blob> {
  const res = await fetch("/api/export-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cv }),
    signal,
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(j?.error || res.statusText || "PDF export failed");
  }
  return res.blob();
}

/** Fallback when preview iframe print is blocked (opens same blob URL in a new tab). */
export function printPdfBlobUrl(blobUrl: string): void {
  const tab = window.open(blobUrl, "_blank", "noopener,noreferrer");
  if (!tab) {
    throw new Error("Pop-up blocked. Allow pop-ups to print the PDF.");
  }
  tab.addEventListener("load", () => {
    tab.focus();
    tab.print();
  });
}

/** Fallback when only a Blob is available (creates a short-lived object URL). */
export function printPdfBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  try {
    printPdfBlobUrl(url);
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
  }
}
