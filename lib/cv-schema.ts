import { z } from "zod";
import { CV_ACCENT_IDS } from "./cv-accents";
import { CV_TEMPLATE_IDS } from "./cv-templates";

export const skillCategoryIdSchema = z.enum([
  "frontEnd",
  "uiUx",
  "tools",
  "aiAutomation",
  "principles",
  "cms",
]);

export type SkillCategoryId = z.infer<typeof skillCategoryIdSchema>;

export const endYearSchema = z.union([z.number().int(), z.literal("present")]);

export type EndYear = z.infer<typeof endYearSchema>;

export const detailFieldKeySchema = z.enum([
  "birthDate",
  "location",
  "email",
  "phone",
  "website",
  "portfolio",
  "workAuthorization",
  "availability",
  "workMode",
  "drivingLicense",
  "linkedIn",
  "gitHub",
]);

export type DetailFieldKey = z.infer<typeof detailFieldKeySchema>;

export const detailsSchema = z.object({
  birthDate: z.string().optional(),
  location: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  portfolio: z.string().optional(),
  workAuthorization: z.string().optional(),
  availability: z.string().optional(),
  workMode: z.string().optional(),
  drivingLicense: z.string().optional(),
  linkedIn: z.string().optional(),
  gitHub: z.string().optional(),
});

export type Details = z.infer<typeof detailsSchema>;

const detailsEnabledFieldsSchema = z.object({
  birthDate: z.boolean().optional(),
  location: z.boolean().optional(),
  email: z.boolean().optional(),
  phone: z.boolean().optional(),
  website: z.boolean().optional(),
  portfolio: z.boolean().optional(),
  workAuthorization: z.boolean().optional(),
  availability: z.boolean().optional(),
  workMode: z.boolean().optional(),
  drivingLicense: z.boolean().optional(),
  linkedIn: z.boolean().optional(),
  gitHub: z.boolean().optional(),
});

export type DetailsEnabled = z.infer<typeof detailsEnabledFieldsSchema>;

export const detailsEnabledSchema = detailsEnabledFieldsSchema.optional();

export const experienceMonthSchema = z.number().int().min(1).max(12);

export const experienceBulletSchema = z.object({
  text: z.string().optional(),
  enabled: z.boolean().optional(),
});

export type ExperienceBullet = z.infer<typeof experienceBulletSchema>;

export const experienceItemSchema = z.object({
  enabled: z.boolean().optional(),
  role: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  startMonth: experienceMonthSchema.optional(),
  startYear: z.number().int().optional(),
  endMonth: experienceMonthSchema.optional(),
  endYear: endYearSchema.optional(),
  intro: z.string().optional(),
  bullets: z.array(experienceBulletSchema).optional(),
  outro: z.string().optional(),
});

export type ExperienceItem = z.infer<typeof experienceItemSchema>;

export const educationItemSchema = z.object({
  university: z.string().optional(),
  title: z.string().optional(),
});

export type EducationItem = z.infer<typeof educationItemSchema>;

export const skillCategorySelectionSchema = z.object({
  categoryId: skillCategoryIdSchema,
  visibleTags: z.array(z.string()),
});

export type SkillCategorySelection = z.infer<
  typeof skillCategorySelectionSchema
>;

export const certificateItemSchema = z.object({
  year: z.number().int().optional(),
  name: z.string().optional(),
});

export type CertificateItem = z.infer<typeof certificateItemSchema>;

export const languageItemSchema = z.object({
  name: z.string().optional(),
  level: z.string().optional(),
});

export type LanguageItem = z.infer<typeof languageItemSchema>;

export const cvAccentIdSchema = z.enum(CV_ACCENT_IDS);

export const cvTemplateIdSchema = z.enum(CV_TEMPLATE_IDS);

export const metaSchema = z.object({
  versionName: z.string().optional(),
  targetRole: z.string().optional(),
  sidebarPosition: z.enum(["left", "right"]),
  template: cvTemplateIdSchema.optional(),
  accent: cvAccentIdSchema.optional(),
});

export const photoModeSchema = z.enum(["image", "initials", "none"]);

export type PhotoMode = z.infer<typeof photoModeSchema>;

export const bodySchema = z.object({
  image: z.string().optional(),
  photoMode: photoModeSchema.optional(),
  name: z.string().optional(),
  mainRole: z.string().optional(),
  profile: z.string().optional(),
  experience: z.array(experienceItemSchema).optional(),
});

export const sidebarSchema = z.object({
  details: detailsSchema.optional(),
  detailsEnabled: detailsEnabledSchema,
  education: z.array(educationItemSchema).optional(),
  skills: z.array(skillCategorySelectionSchema).optional(),
  certificates: z.array(certificateItemSchema).optional(),
  languages: z.array(languageItemSchema).optional(),
  hobbies: z.array(z.string()).optional(),
  hobbiesText: z.string().optional(),
});

export const cvDataSchema = z.object({
  meta: metaSchema,
  body: bodySchema,
  sidebar: sidebarSchema,
});

export type CVData = z.infer<typeof cvDataSchema>;

/** Strict schema for AI / import (no unknown keys). */
export const cvDataSchemaForAi = cvDataSchema.strict();

export const skillLibraryCategorySchema = z.object({
  label: z.string(),
  tags: z.array(z.string()),
});

export type SkillLibraryCategory = z.infer<typeof skillLibraryCategorySchema>;

export const skillLibrarySchema = z.record(
  skillCategoryIdSchema,
  skillLibraryCategorySchema,
);

export type SkillLibrary = z.infer<typeof skillLibrarySchema>;

/** Import/export may include only a subset of categories. */
export const skillLibraryImportSchema = z
  .record(z.string(), skillLibraryCategorySchema)
  .optional();

export type SkillLibraryImport = z.infer<typeof skillLibraryImportSchema>;

export const cvVersionMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  updatedAt: z.string(),
});

export type CVVersionMeta = z.infer<typeof cvVersionMetaSchema>;

export const cvExportBundleSchema = z.object({
  cv: cvDataSchema,
  skillLibrary: skillLibraryImportSchema,
});

export type CVExportBundle = z.infer<typeof cvExportBundleSchema>;

export const SKILL_CATEGORY_ORDER = [
  "frontEnd",
  "uiUx",
  "tools",
  "aiAutomation",
  "principles",
  "cms",
] as const satisfies readonly SkillCategoryId[];

export const SKILL_CATEGORY_LABELS: Record<SkillCategoryId, string> = {
  frontEnd: "Frontend Engineering",
  uiUx: "Product, UI/UX & Accessibility",
  tools: "Tools & Delivery",
  aiAutomation: "AI & Automation",
  principles: "Performance, SEO & Experimentation",
  cms: "Backend, CMS & APIs",
};

export function orderedSkillCategoryIds(
  skills: SkillCategorySelection[] | undefined,
): SkillCategoryId[] {
  const allowed = new Set<SkillCategoryId>(SKILL_CATEGORY_ORDER);
  const ordered: SkillCategoryId[] = [];
  for (const s of skills ?? []) {
    if (allowed.has(s.categoryId) && !ordered.includes(s.categoryId)) {
      ordered.push(s.categoryId);
    }
  }
  for (const id of SKILL_CATEGORY_ORDER) {
    if (!ordered.includes(id)) ordered.push(id);
  }
  return ordered;
}

export function normalizeSkillSelections(
  skills: SkillCategorySelection[] | undefined,
): SkillCategorySelection[] {
  const byId = new Map<SkillCategoryId, SkillCategorySelection>();
  for (const s of skills ?? []) {
    if ((SKILL_CATEGORY_ORDER as readonly SkillCategoryId[]).includes(s.categoryId)) {
      byId.set(s.categoryId, {
        categoryId: s.categoryId,
        visibleTags: [...(s.visibleTags ?? [])],
      });
    }
  }
  return orderedSkillCategoryIds(skills).map(
    (categoryId) => byId.get(categoryId) ?? { categoryId, visibleTags: [] },
  );
}
