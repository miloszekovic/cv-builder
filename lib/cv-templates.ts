export const CV_TEMPLATE_IDS = [
  "classic",
  "modern",
  "minimal",
  "executive",
  "studio",
  "mono",
  "nordic",
] as const;

export type CvTemplateId = (typeof CV_TEMPLATE_IDS)[number];

export type CvTemplateLayout = "two-column" | "single-column";

export type CvTemplateOption = {
  label: string;
  tagline: string;
  layout: CvTemplateLayout;
  /** Mini preview accent in the template picker */
  previewHue: string;
};

export const CV_TEMPLATES: Record<CvTemplateId, CvTemplateOption> = {
  classic: {
    label: "Classic",
    tagline: "Serif sidebar layout",
    layout: "two-column",
    previewHue: "#0f766e",
  },
  modern: {
    label: "Modern",
    tagline: "Sans-serif, accent bars",
    layout: "two-column",
    previewHue: "#2563eb",
  },
  minimal: {
    label: "Minimal",
    tagline: "Airy, muted headings",
    layout: "two-column",
    previewHue: "#64748b",
  },
  executive: {
    label: "Executive",
    tagline: "Dark sidebar, sans-serif",
    layout: "two-column",
    previewHue: "#0f172a",
  },
  studio: {
    label: "Studio",
    tagline: "Accent sidebar, creative sans",
    layout: "two-column",
    previewHue: "#c026d3",
  },
  mono: {
    label: "Mono",
    tagline: "Single column stack",
    layout: "single-column",
    previewHue: "#18181b",
  },
  nordic: {
    label: "Nordic",
    tagline: "Light, spacious, thin type",
    layout: "two-column",
    previewHue: "#94a3b8",
  },
};

/** Maps removed / legacy template ids to a current default. */
const LEGACY_TEMPLATE_MAP: Record<string, CvTemplateId> = {
  heritage: "classic",
};

export function normalizeCvTemplate(id: string | undefined): CvTemplateId | undefined {
  if (!id) return undefined;
  if (CV_TEMPLATE_IDS.includes(id as CvTemplateId)) return id as CvTemplateId;
  return LEGACY_TEMPLATE_MAP[id] ?? "classic";
}

export function getCvTemplate(id: CvTemplateId | undefined): CvTemplateOption {
  const normalized = normalizeCvTemplate(id);
  if (normalized) return CV_TEMPLATES[normalized];
  return CV_TEMPLATES.classic;
}

export function cvTemplateUsesSingleColumn(id: CvTemplateId | undefined): boolean {
  return getCvTemplate(id).layout === "single-column";
}
