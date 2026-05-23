"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CVData } from "@/lib/cv-schema";
import { fetchCvPdfBlob } from "@/lib/fetch-cv-pdf-client";

/** Wait after last change before hitting the server (Playwright PDF). */
export const CV_PDF_PREVIEW_DEBOUNCE_MS = 900;

/**
 * Debounced server PDF for live preview, export, and print — one blob for all three.
 */
export function useCvPdfPreview(cv: CVData) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const requestSeq = useRef(0);
  const blobUrlRef = useRef<string | null>(null);

  const replaceBlobUrl = useCallback((next: string | null, nextBlob: Blob | null) => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    if (next) blobUrlRef.current = next;
    setBlobUrl(next);
    setBlob(nextBlob);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const seq = ++requestSeq.current;
    const timer = window.setTimeout(async () => {
      setBusy(true);
      setErr(null);
      try {
        const nextBlob = await fetchCvPdfBlob(cv);
        if (cancelled || requestSeq.current !== seq) return;
        const url = URL.createObjectURL(nextBlob);
        if (cancelled || requestSeq.current !== seq) {
          URL.revokeObjectURL(url);
          return;
        }
        replaceBlobUrl(url, nextBlob);
      } catch (e) {
        if (cancelled || requestSeq.current !== seq) return;
        replaceBlobUrl(null, null);
        setErr(e instanceof Error ? e.message : "Preview failed");
      } finally {
        if (!cancelled && requestSeq.current === seq) setBusy(false);
      }
    }, CV_PDF_PREVIEW_DEBOUNCE_MS);

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

  return { blob, blobUrl, busy, err };
}
