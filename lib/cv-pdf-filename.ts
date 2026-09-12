import type { CVData } from "./cv-schema";
import { getCvTemplate } from "./cv-templates";

function sanitizeFileSegment(value: string): string {
  return value
    .trim()
    .replace(/[^\w\s\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Base download name: `{version name} - {template label}` */
export function cvExportDownloadBaseName(cv: CVData): string {
  const base = sanitizeFileSegment(cv.meta.versionName || "cv") || "cv";
  const template = sanitizeFileSegment(getCvTemplate(cv.meta.template).label) || "Classic";
  return `${base} - ${template}`;
}

export function cvPdfDownloadFileName(cv: CVData): string {
  return `${cvExportDownloadBaseName(cv)}.pdf`;
}

export function cvJsonDownloadFileName(cv: CVData): string {
  return `${cvExportDownloadBaseName(cv)}.json`;
}
