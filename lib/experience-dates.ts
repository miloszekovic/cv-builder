/** 1-based month index → three-letter label (Jan–Dec). */
export const EXPERIENCE_MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const EXPERIENCE_MONTH_OPTIONS = EXPERIENCE_MONTH_LABELS.map(
  (label, index) => ({
    value: index + 1,
    label,
  }),
);

function formatPeriodPart(
  month?: number,
  year?: number | "present",
): string {
  if (year == null) return "";
  if (year === "present") return "Present";
  const monthLabel =
    month != null && month >= 1 && month <= 12
      ? EXPERIENCE_MONTH_LABELS[month - 1]
      : "";
  return monthLabel ? `${monthLabel} ${year}` : String(year);
}

export function formatExperiencePeriod(
  startMonth?: number,
  startYear?: number,
  endMonth?: number,
  endYear?: number | "present",
): string | null {
  const startStr = formatPeriodPart(startMonth, startYear);
  const endStr =
    endYear === "present"
      ? "Present"
      : formatPeriodPart(endMonth, endYear);

  if (startStr && endStr) return `${startStr} – ${endStr}`;
  return startStr || endStr || null;
}

export function hasExperiencePeriod(
  startMonth?: number,
  startYear?: number,
  endMonth?: number,
  endYear?: number | "present",
): boolean {
  return formatExperiencePeriod(startMonth, startYear, endMonth, endYear) != null;
}
