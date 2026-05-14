export const CV_ACCENT_IDS = [
  "teal",
  "ocean",
  "lavender",
  "rose",
  "sage",
  "clay",
  "indigo",
] as const;

export type CvAccentId = (typeof CV_ACCENT_IDS)[number];

export type CvAccentOption = {
  label: string;
  /** Primary accent (name, detail icons) */
  accent: string;
  /** Light gradient stops for initials avatar */
  initialsFrom: string;
  initialsTo: string;
};

export const CV_ACCENTS: Record<CvAccentId, CvAccentOption> = {
  teal: {
    label: "Teal",
    accent: "#0f766e",
    initialsFrom: "#ecfdf5",
    initialsTo: "#d1fae5",
  },
  ocean: {
    label: "Ocean",
    accent: "#2f6f84",
    initialsFrom: "#e8f4f8",
    initialsTo: "#cfeaf2",
  },
  lavender: {
    label: "Lavender",
    accent: "#6b5b9a",
    initialsFrom: "#f5f3ff",
    initialsTo: "#ebe4ff",
  },
  rose: {
    label: "Dusty rose",
    accent: "#a85f72",
    initialsFrom: "#fdf2f4",
    initialsTo: "#fce7ec",
  },
  sage: {
    label: "Sage",
    accent: "#4a7c59",
    initialsFrom: "#f0fdf4",
    initialsTo: "#dcf5e3",
  },
  clay: {
    label: "Warm clay",
    accent: "#a67c52",
    initialsFrom: "#fffbeb",
    initialsTo: "#fef3c7",
  },
  indigo: {
    label: "Indigo",
    accent: "#515f9c",
    initialsFrom: "#eef2ff",
    initialsTo: "#e0e7ff",
  },
};

export function getCvAccent(id: CvAccentId | undefined): CvAccentOption {
  if (id !== undefined && CV_ACCENT_IDS.includes(id)) return CV_ACCENTS[id];
  return CV_ACCENTS.teal;
}
