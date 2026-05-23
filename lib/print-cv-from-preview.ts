import type { RefObject } from "react";
import type { CVData } from "@/lib/cv-schema";
import { fetchCvPdfBlob, printPdfBlob, printPdfBlobUrl } from "@/lib/fetch-cv-pdf-client";

export async function printCvFromPreview({
  getCv,
  getPdfBlob,
  getPdfBlobUrl,
  previewIframeRef,
  previewBusy,
}: {
  getCv: () => CVData;
  getPdfBlob: () => Blob | null;
  getPdfBlobUrl: () => string | null;
  previewIframeRef: RefObject<HTMLIFrameElement | null>;
  previewBusy: boolean;
}): Promise<void> {
  if (previewBusy) {
    throw new Error("PDF preview is still generating. Try again in a moment.");
  }

  const cv = getCv();
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
}
