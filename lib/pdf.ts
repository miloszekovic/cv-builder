import type { CVData } from "./cv-schema";
import { effectivePhotoMode } from "./cv-photo";

const THRESHOLD = 115;

/**
 * Cheap heuristic for "may exceed 2 pages" before PDF export.
 * Tune against real exports; intentionally conservative.
 */
export function estimateCvLengthPressure(cv: CVData): number {
  let score = 0;
  const profile = cv.body.profile?.length ?? 0;
  score += Math.min(profile / 25, 14);

  const exp = cv.body.experience ?? [];
  score += exp.length * 4;
  for (const e of exp) {
    score += (e.intro?.length ?? 0) / 120;
    score += (e.outro?.length ?? 0) / 120;
    score += (e.bullets?.length ?? 0) * 2.2;
    for (const b of e.bullets ?? []) {
      score += Math.min(b.length / 80, 3);
    }
  }

  const skills = cv.sidebar.skills ?? [];
  for (const s of skills) {
    score += (s.visibleTags?.length ?? 0) * 0.35;
  }

  const edu = cv.sidebar.education?.length ?? 0;
  score += edu * 1.5;

  const certs = cv.sidebar.certificates?.length ?? 0;
  score += certs * 0.8;

  const langs = cv.sidebar.languages?.length ?? 0;
  score += langs * 0.6;

  const hobbies = (cv.sidebar.hobbiesText?.length ?? 0) / 40;

  score += hobbies * 0.5;

  if (effectivePhotoMode(cv.body) !== "none") score += 2;

  return Math.round(score * 10) / 10;
}

export function shouldWarnPdfLength(cv: CVData): boolean {
  return estimateCvLengthPressure(cv) > THRESHOLD;
}

export const PDF_LENGTH_WARNING =
  "This CV may exceed 2 pages. Consider shortening profile, experience bullets or skills.";
