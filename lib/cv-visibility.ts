import type {
  DetailFieldKey,
  Details,
  DetailsEnabled,
  ExperienceBullet,
  ExperienceItem,
} from "./cv-schema";
import { hasExperiencePeriod } from "./experience-dates";

export const DETAIL_FIELD_KEYS = [
  "location",
  "email",
  "phone",
  "website",
  "linkedIn",
  "gitHub",
  "portfolio",
  "workAuthorization",
  "availability",
  "workMode",
  "drivingLicense",
  "birthDate",
] as const satisfies readonly DetailFieldKey[];

export function isFieldEnabled(flag?: boolean): boolean {
  return flag !== false;
}

export function normalizeExperienceBullet(
  raw: string | ExperienceBullet,
): ExperienceBullet {
  if (typeof raw === "string") return { text: raw, enabled: true };
  return {
    text: raw.text ?? "",
    enabled: raw.enabled !== false,
  };
}

export function bulletText(bullet: ExperienceBullet): string {
  return bullet.text?.trim() ?? "";
}

export function isBulletVisible(bullet: ExperienceBullet): boolean {
  return isFieldEnabled(bullet.enabled) && Boolean(bulletText(bullet));
}

export function visibleBullets(exp: ExperienceItem): ExperienceBullet[] {
  return (exp.bullets ?? [])
    .map(normalizeExperienceBullet)
    .filter(isBulletVisible);
}

export function isExperienceEnabled(exp: ExperienceItem): boolean {
  return isFieldEnabled(exp.enabled);
}

export function experienceHasVisibleContent(exp: ExperienceItem): boolean {
  if (!isExperienceEnabled(exp)) return false;
  return (
    Boolean(exp.role?.trim()) ||
    Boolean(exp.company?.trim()) ||
    Boolean(exp.country?.trim()) ||
    Boolean(exp.intro?.trim()) ||
    Boolean(exp.outro?.trim()) ||
    visibleBullets(exp).length > 0 ||
    hasExperiencePeriod(
      exp.startMonth,
      exp.startYear,
      exp.endMonth,
      exp.endYear,
    )
  );
}

export function isDetailFieldEnabled(
  key: DetailFieldKey,
  enabled?: DetailsEnabled,
): boolean {
  return isFieldEnabled(enabled?.[key]);
}

export function isDetailFieldVisible(
  key: DetailFieldKey,
  details: Details | undefined,
  enabled?: DetailsEnabled,
): boolean {
  if (!isDetailFieldEnabled(key, enabled)) return false;
  const value = details?.[key];
  return Boolean(value?.trim());
}
