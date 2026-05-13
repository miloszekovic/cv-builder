import type { CVData, PhotoMode } from "./cv-schema";

function hasText(s?: string | null) {
  return Boolean(s?.trim());
}

/** Legacy CVs without `photoMode`: infer from image. */
export function effectivePhotoMode(body: CVData["body"]): PhotoMode {
  const m = body.photoMode;
  if (m === "image" || m === "initials" || m === "none") return m;
  return hasText(body.image) ? "image" : "none";
}

/** Up to two graphemes from first name parts (Unicode-safe). */
export function initialsFromName(name?: string | null): string {
  if (!hasText(name)) return "?";
  const parts = name!.trim().split(/\s+/).filter(Boolean);
  const ch = (s: string) => [...s][0] ?? "";
  if (parts.length >= 2) {
    return `${ch(parts[0]!).toUpperCase()}${ch(parts[1]!).toUpperCase()}`;
  }
  const w = parts[0]!;
  const chars = [...w];
  if (chars.length >= 2) {
    return `${chars[0]!.toUpperCase()}${chars[1]!.toUpperCase()}`;
  }
  return chars[0]!.toUpperCase();
}

export function showHeaderAvatar(body: CVData["body"]): boolean {
  const mode = effectivePhotoMode(body);
  if (mode === "none") return false;
  if (mode === "image") return hasText(body.image);
  return hasText(body.name);
}
