import { z } from "zod";
import { CV_ACCENT_IDS } from "./cv-accents";

export const skillCategoryIdSchema = z.enum([
  "frontEnd",
  "uiUx",
  "tools",
  "aiAutomation",
  "principles",
  "cms",
  "os",
]);

export type SkillCategoryId = z.infer<typeof skillCategoryIdSchema>;

export const endYearSchema = z.union([z.number().int(), z.literal("present")]);

export type EndYear = z.infer<typeof endYearSchema>;

export const detailsSchema = z.object({
  location: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  linkedIn: z.string().optional(),
  gitHub: z.string().optional(),
});

export type Details = z.infer<typeof detailsSchema>;

export const experienceItemSchema = z.object({
  role: z.string().optional(),
  company: z.string().optional(),
  startYear: z.number().int().optional(),
  endYear: endYearSchema.optional(),
  intro: z.string().optional(),
  bullets: z.array(z.string()).optional(),
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

export const metaSchema = z.object({
  versionName: z.string().optional(),
  targetRole: z.string().optional(),
  sidebarPosition: z.enum(["left", "right"]),
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

export const SKILL_CATEGORY_LABELS: Record<SkillCategoryId, string> = {
  frontEnd: "Front end",
  uiUx: "UI/UX design",
  tools: "Tools",
  aiAutomation: "AI & Automation",
  principles: "Principles",
  cms: "CMS",
  os: "OS",
};
