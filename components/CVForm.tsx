"use client";

import {
  Github,
  Globe,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  PanelLeft,
  PanelRight,
  PenLine,
  Phone,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  useFieldArray,
  useFormContext,
  useWatch,
  type UseFormRegister,
} from "react-hook-form";
import type { CVData, PhotoMode, SkillLibrary } from "@/lib/cv-schema";
import type { CvAccentId } from "@/lib/cv-accents";
import { CV_ACCENTS, CV_ACCENT_IDS } from "@/lib/cv-accents";
import { cvTemplateUsesSingleColumn } from "@/lib/cv-templates";
import { TemplatePicker } from "@/components/TemplatePicker";
import { effectivePhotoMode } from "@/lib/cv-photo";
import {
  formFieldSectionClass,
  formFieldSoftClass,
  formFieldsStackClass,
  formLabelClass,
  formLabelControlStack,
  formSelectSectionClass,
  editorSectionClass,
  editorSectionTitleClass,
  formNestedGroupClass,
  formDeleteButtonClass,
} from "@/lib/form-styles";
import { motionInteractive, motionTextButton } from "@/lib/motion-styles";
import { cn } from "@/lib/cn";
import { ExperienceEditor } from "@/components/ExperienceEditor";
import { Reveal } from "@/components/Reveal";
import { SkillsManager } from "@/components/SkillsManager";
import type { GenerateCvInput } from "@/lib/openai";

const addFieldTriggerClass = cn(
  motionTextButton,
  "text-[0.9375rem] font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300",
);

export function CVFormModeTabs({
  mode,
  setMode,
  className,
  variant = "workspace",
}: {
  mode: "manual" | "ai";
  setMode: (m: "manual" | "ai") => void;
  className?: string;
  variant?: "workspace" | "standalone";
}) {
  return (
    <div
      className={cn("grid w-full grid-cols-2 gap-2 sm:gap-2.5", className)}
      role="tablist"
      aria-label="Editor mode"
    >
      <ModeTab
        id="manual"
        tabId="tab-editor-manual"
        panelId="panel-editor-manual"
        current={mode}
        setMode={setMode}
        label="Manual"
        description="Fill every field yourself"
        icon={<PenLine className="size-4 shrink-0" aria-hidden />}
        variant={variant}
      />
      <ModeTab
        id="ai"
        tabId="tab-editor-ai"
        panelId="panel-editor-ai"
        current={mode}
        setMode={setMode}
        label="AI-assisted"
        description="Describe yourself, get a draft"
        icon={<Sparkles className="size-4 shrink-0" aria-hidden />}
        variant={variant}
      />
    </div>
  );
}

export function CVForm({
  mode,
  skillLibrary,
  onSkillLibraryChange,
  onGenerate,
  aiBusy,
  aiError,
}: {
  mode: "manual" | "ai";
  skillLibrary: SkillLibrary;
  onSkillLibraryChange: (lib: SkillLibrary) => void;
  onGenerate: (input: GenerateCvInput) => Promise<void>;
  aiBusy: boolean;
  aiError: string | null;
}) {
  const { register, watch, setValue } = useFormContext<CVData>();
  const sidebarPosition = watch("meta.sidebarPosition");
  const templateId = watch("meta.template") ?? "classic";
  const singleColumnTemplate = cvTemplateUsesSingleColumn(templateId);

  return (
    <div className="space-y-8">
      <div
        id="panel-editor-manual"
        role="tabpanel"
        aria-labelledby="tab-editor-manual"
        hidden={mode !== "manual"}
        className="space-y-10"
      >
        <Section title="Design" description="Template, sidebar placement, and accent color for the PDF.">
          <div className="space-y-7">
            <div>
              <p className={cn(formLabelClass, "mb-3.5")}>Template</p>
              <TemplatePicker currentId={templateId} register={register} />
            </div>
            {!singleColumnTemplate ? (
              <div className="flex flex-col gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:gap-5 dark:border-zinc-800/80">
                <span className={cn(formLabelClass, "shrink-0 sm:min-w-30")}>Sidebar</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = sidebarPosition === "right" ? "left" : "right";
                    setValue("meta.sidebarPosition", next, { shouldDirty: true });
                  }}
                  className={cn(
                    motionInteractive,
                    "inline-flex w-fit max-w-full items-center gap-2 rounded-xl border border-violet-200/70 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-900 hover:bg-violet-100/90 dark:border-violet-800/50 dark:bg-violet-950/40 dark:text-violet-100 dark:hover:bg-violet-950/55",
                  )}
                  title="Place the sidebar on the left or right of the main column"
                  aria-label={
                    sidebarPosition === "right"
                      ? "Sidebar is on the right. Activate to move it to the left."
                      : "Sidebar is on the left. Activate to move it to the right."
                  }
                >
                  {sidebarPosition === "right" ? (
                    <PanelRight className="size-4 shrink-0" aria-hidden />
                  ) : (
                    <PanelLeft className="size-4 shrink-0" aria-hidden />
                  )}
                  Sidebar on the {sidebarPosition}
                </button>
              </div>
            ) : (
              <p className="border-t border-zinc-100 pt-6 text-sm text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                Mono stacks everything in one column — sidebar placement does not apply.
              </p>
            )}
            <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800/80">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                <span className={cn(formLabelClass, "shrink-0 sm:min-w-30")}>Accent</span>
                <fieldset className="m-0 min-w-0 flex-1 border-0 p-0">
                  <legend className="sr-only">Accent color</legend>
                  <AccentSwatches register={register} currentId={watch("meta.accent") ?? "teal"} />
                </fieldset>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Title & role">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className={formLabelControlStack}>
              <span className={formLabelClass}>Name</span>
              <input className={formFieldSectionClass} {...register("body.name")} />
            </label>
            <label className={formLabelControlStack}>
              <span className={formLabelClass}>Main role</span>
              <input className={formFieldSectionClass} {...register("body.mainRole")} />
            </label>
          </div>
          <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800/80">
            <p className={cn(formLabelClass, "mb-3.5")}>Photo & initials</p>
            <PhotoField />
          </div>
        </Section>

        <Section
          title="Profile / intro"
          headingId="profile-intro-heading"
        >
          <textarea
            rows={5}
            className={formFieldSectionClass}
            aria-labelledby="profile-intro-heading"
            placeholder=""
            {...register("body.profile")}
          />
        </Section>

        <Section title="Experience">
          <ExperienceEditor />
        </Section>

        <Section title="Sidebar — details">
          <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                { key: "location" as const, lab: "Location", Icon: MapPin },
                { key: "email" as const, lab: "Email", Icon: Mail },
                { key: "phone" as const, lab: "Phone", Icon: Phone },
                { key: "website" as const, lab: "Website", Icon: Globe },
                { key: "linkedIn" as const, lab: "LinkedIn", Icon: Linkedin },
                { key: "gitHub" as const, lab: "GitHub", Icon: Github },
              ] as const
            ).map(({ key, lab, Icon }) => (
              <label key={key} className={cn("min-w-0", formLabelControlStack)}>
                <span
                  className={cn(
                    formLabelClass,
                    "inline-flex items-center gap-1.5",
                  )}
                >
                  <Icon
                    className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400"
                    aria-hidden
                  />
                  {lab}
                </span>
                <input
                  className={formFieldSectionClass}
                  {...register(`sidebar.details.${key}`)}
                />
              </label>
            ))}
          </div>
        </Section>

        <Section title="Education">
          <EducationList />
        </Section>

        <SkillsLibrarySection
          skillLibrary={skillLibrary}
          onSkillLibraryChange={onSkillLibraryChange}
        />

        <Section title="Certificates">
          <CertificatesList />
        </Section>

        <Section title="Languages">
          <LanguagesList />
        </Section>

        <Section title="Hobbies & interests">
          <label className={formLabelControlStack}>
            <span className={formLabelClass}>Interests</span>
            <textarea
              rows={3}
              className={formFieldSectionClass}
              placeholder=""
              {...register("sidebar.hobbiesText")}
            />
          </label>
        </Section>
      </div>

      <div
        id="panel-editor-ai"
        role="tabpanel"
        aria-labelledby="tab-editor-ai"
        hidden={mode !== "ai"}
        className="space-y-10"
      >
        <Reveal>
          <AiPanel onGenerate={onGenerate} aiBusy={aiBusy} aiError={aiError} />
        </Reveal>
        <SkillsLibrarySection
          skillLibrary={skillLibrary}
          onSkillLibraryChange={onSkillLibraryChange}
        />
      </div>
    </div>
  );
}

function SkillsLibrarySection({
  skillLibrary,
  onSkillLibraryChange,
}: {
  skillLibrary: SkillLibrary;
  onSkillLibraryChange: (lib: SkillLibrary) => void;
}) {
  return (
    <Section title="Skills library & visibility">
      <SkillsManager
        skillLibrary={skillLibrary}
        onSkillLibraryChange={onSkillLibraryChange}
      />
    </Section>
  );
}

function ModeTab({
  id,
  tabId,
  panelId,
  current,
  setMode,
  label,
  description,
  icon,
  variant = "workspace",
}: {
  id: "manual" | "ai";
  tabId: string;
  panelId: string;
  current: "manual" | "ai";
  setMode: (m: "manual" | "ai") => void;
  label: string;
  description?: string;
  icon: ReactNode;
  variant?: "workspace" | "standalone";
}) {
  const on = current === id;
  const inWorkspace = variant === "workspace";
  return (
    <button
      id={tabId}
      type="button"
      role="tab"
      aria-selected={on}
      aria-controls={panelId}
      className={cn(
        motionInteractive,
        "flex w-full min-h-11 flex-col items-center justify-center gap-px rounded-xl border-0 px-2 py-2 text-center shadow-none sm:min-h-13 sm:px-4 sm:py-2.5",
        "outline-hidden focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-500/55 focus-visible:ring-offset-0",
        on
          ? "bg-violet-600 text-white shadow-[0_2px_12px_-2px_rgb(124_58_237_/0.4)] hover:bg-violet-500 dark:bg-violet-600 dark:hover:bg-violet-500"
          : inWorkspace
            ? cn(
                "bg-white/90 text-zinc-900 ring-1 ring-zinc-200/80",
                "hover:bg-white dark:bg-zinc-800/70 dark:text-zinc-50 dark:ring-zinc-600/70 dark:hover:bg-zinc-800",
              )
            : cn(
                "bg-zinc-100/90 text-zinc-900",
                "hover:bg-zinc-200/75",
                "dark:bg-zinc-800/50 dark:text-zinc-50 dark:hover:bg-zinc-700/65",
              ),
      )}
      onClick={() => setMode(id)}
    >
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-tight sm:text-[0.9375rem]">
        <span className={cn(on ? "text-white" : "text-violet-600 dark:text-violet-400")}>{icon}</span>
        {label}
      </span>
      {description ? (
        <span
          className={cn(
            "max-w-full text-[0.6875rem] font-medium leading-snug text-balance sm:text-xs",
            on ? "text-violet-100" : "text-zinc-500 dark:text-zinc-400",
          )}
        >
          {description}
        </span>
      ) : null}
    </button>
  );
}

function AccentSwatches({
  register,
  currentId,
  size = "default",
}: {
  register: UseFormRegister<CVData>;
  currentId: CvAccentId;
  size?: "default" | "lg";
}) {
  const lg = size === "lg";
  return (
    <div
      className={cn("flex flex-wrap items-center", lg ? "gap-2.5" : "gap-2")}
      role="radiogroup"
      aria-label="CV accent color"
    >
      {CV_ACCENT_IDS.map((id) => {
        const selected = currentId === id;
        return (
          <label
            key={id}
            className={cn(
              motionInteractive,
              "relative flex cursor-pointer items-center justify-center rounded-full outline-hidden focus-within:ring-2 focus-within:ring-violet-500/70 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-violet-400 dark:focus-within:ring-offset-zinc-950",
              "p-0.5",
              selected
                ? "ring-2 ring-zinc-900 ring-offset-2 ring-offset-white dark:ring-zinc-100 dark:ring-offset-zinc-950"
                : "ring-1 ring-zinc-300/90 hover:ring-zinc-400 dark:ring-zinc-600",
            )}
            title={CV_ACCENTS[id].label}
            aria-label={CV_ACCENTS[id].label}
          >
            <input type="radio" value={id} className="sr-only" {...register("meta.accent")} />
            <span
              aria-hidden
              className={cn(
                "rounded-full border border-zinc-900/10 shadow-inner dark:border-white/15",
                lg ? "size-7" : "size-6",
              )}
              style={{ backgroundColor: CV_ACCENTS[id].accent }}
            />
          </label>
        );
      })}
    </div>
  );
}

function Section({
  title,
  description,
  headingId,
  children,
}: {
  title: string;
  description?: string;
  /** When set, the main `h2` receives this `id` (e.g. for `aria-labelledby` on fields). */
  headingId?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section className={editorSectionClass}>
        <h2
          id={headingId}
          className={editorSectionTitleClass}
        >
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
        ) : null}
        {children}
      </section>
    </Reveal>
  );
}

function PhotoField() {
  const { setValue } = useFormContext<CVData>();
  const body = useWatch({ name: "body" }) as CVData["body"] | undefined;
  const b = body ?? { experience: [] };
  const mode = effectivePhotoMode(b);

  const setMode = (next: PhotoMode) => {
    setValue("body.photoMode", next, { shouldDirty: true });
  };

  const radioRow =
    "motion-safe:transition-colors motion-safe:duration-200 flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3.5 py-2.5 text-[0.9375rem] text-zinc-800 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800/70";

  return (
    <fieldset className="space-y-4">
      <legend className="sr-only">Photo, initials, or no header graphic</legend>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <label className={radioRow}>
          <input
            type="radio"
            className="size-4 shrink-0 accent-violet-600 dark:accent-violet-500"
            checked={mode === "image"}
            onChange={() => setMode("image")}
          />
          Photo (upload)
        </label>
        <label className={radioRow}>
          <input
            type="radio"
            className="size-4 shrink-0 accent-violet-600 dark:accent-violet-500"
            checked={mode === "initials"}
            onChange={() => setMode("initials")}
          />
          Initials (from name)
        </label>
        <label className={radioRow}>
          <input
            type="radio"
            className="size-4 shrink-0 accent-violet-600 dark:accent-violet-500"
            checked={mode === "none"}
            onChange={() => setMode("none")}
          />
          None
        </label>
      </div>
      {mode === "image" && (
        <>
          <p className="sr-only">Image is stored in the browser for this CV version.</p>
          <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-4">
            <label htmlFor="cv-photo-upload" className={cn(formLabelClass, "shrink-0 cursor-pointer")}>
              Image file
            </label>
            <input
              id="cv-photo-upload"
              type="file"
              accept="image/*"
              className="min-w-0 flex-1 max-w-full py-2 text-[0.9375rem] leading-normal text-zinc-600 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-zinc-900 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white file:transition-[filter,background-color] file:duration-200 file:hover:brightness-110 dark:text-zinc-400 dark:file:bg-violet-600 dark:file:hover:brightness-110"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => {
                  setValue("body.image", String(reader.result), { shouldDirty: true });
                  setValue("body.photoMode", "image", { shouldDirty: true });
                };
                reader.readAsDataURL(f);
              }}
            />
          </div>
        </>
      )}
      {mode === "initials" && (
        <p className="sr-only">
          Uses two letters from your name (first and second word, or first two letters if one name).
        </p>
      )}
    </fieldset>
  );
}

function AiPanel({
  onGenerate,
  aiBusy,
  aiError,
}: {
  onGenerate: (input: GenerateCvInput) => Promise<void>;
  aiBusy: boolean;
  aiError: string | null;
}) {
  const { register, getValues } = useFormContext<CVData>();
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState<GenerateCvInput["tone"]>("professional");
  const [maxCvLength, setMaxCvLength] =
    useState<NonNullable<GenerateCvInput["maxCvLength"]>>("medium");

  return (
    <section className="space-y-5 rounded-3xl border border-violet-200/70 bg-linear-to-b from-violet-50/95 via-white to-white p-7 shadow-[0_2px_24px_-12px_rgb(124_58_237_/0.12)] ring-1 ring-violet-950/6 dark:border-violet-900/40 dark:from-violet-950/35 dark:via-zinc-900/80 dark:to-zinc-900 dark:ring-white/6 sm:p-8">
      <div className="flex items-center gap-2.5 text-violet-900 dark:text-violet-100">
        <Sparkles className="size-5 shrink-0" aria-hidden />
        <h2 className="text-xl font-semibold tracking-tight">AI-assisted draft</h2>
      </div>
      <p className="sr-only">
        The model fills the same fields as manual mode. Review before exporting.
      </p>
      <div className={formFieldsStackClass}>
        <label className={formLabelControlStack}>
        <span className={formLabelClass}>Target role</span>
        <input
          className={formFieldSectionClass}
          placeholder=""
          {...register("meta.targetRole")}
        />
      </label>
        <label className={formLabelControlStack}>
        <span className={formLabelClass}>Your description</span>
        <textarea
          rows={8}
          className={formFieldSectionClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className={formLabelControlStack}>
          <span className={formLabelClass}>Tone</span>
          <select
            className={formSelectSectionClass}
            value={tone}
            onChange={(e) => setTone(e.target.value as GenerateCvInput["tone"])}
          >
            <option value="professional">Professional</option>
            <option value="direct">Direct</option>
            <option value="friendly">Friendly</option>
          </select>
        </label>
        <label className={formLabelControlStack}>
          <span className={formLabelClass}>Length hint</span>
          <select
            className={formSelectSectionClass}
            value={maxCvLength}
            onChange={(e) =>
              setMaxCvLength(e.target.value as NonNullable<GenerateCvInput["maxCvLength"]>)
            }
          >
            <option value="short">Short (2 pages)</option>
            <option value="medium">Medium (2 pages)</option>
          </select>
        </label>
      </div>
      </div>
      <button
        type="button"
        disabled={aiBusy}
        onClick={() =>
          onGenerate({
            description,
            targetRole: String(getValues("meta.targetRole") ?? "").trim(),
            tone,
            maxCvLength,
          })
        }
        className={cn(
          motionInteractive,
          "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-[0.9375rem] font-semibold text-white shadow-[0_2px_12px_-2px_rgb(124_58_237_/0.45)] hover:bg-violet-500 disabled:opacity-60 dark:bg-violet-600 dark:hover:bg-violet-500",
        )}
        aria-busy={aiBusy}
      >
        {aiBusy ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="size-4" aria-hidden />
            Generate CV
          </>
        )}
      </button>
      <div className="min-h-5" aria-live="polite" aria-relevant="additions text">
        {aiError && (
          <p className="text-base text-red-600 dark:text-red-400" role="alert">
            {aiError}
          </p>
        )}
      </div>
    </section>
  );
}

function EducationList() {
  const { control, register } = useFormContext<CVData>();
  const { fields, append, remove } = useFieldArray({ control, name: "sidebar.education" });
  if (fields.length === 0) {
    return (
      <button
        type="button"
        className={addFieldTriggerClass}
        onClick={() => append({ university: "", title: "" })}
      >
        + Add education
      </button>
    );
  }
  return (
    <div className="space-y-5">
      {fields.map((f, i) => (
        <div key={f.id} className={cn(formNestedGroupClass, "grid gap-5 sm:grid-cols-2")}>
          <input
            className={formFieldSoftClass}
            placeholder="University"
            {...register(`sidebar.education.${i}.university`)}
          />
          <div className="flex gap-2">
            <input
              className={cn(formFieldSoftClass, "min-w-0 flex-1")}
              placeholder="Title / degree"
              {...register(`sidebar.education.${i}.title`)}
            />
            <button
              type="button"
              className={formDeleteButtonClass}
              onClick={() => remove(i)}
              aria-label={`Remove education entry ${i + 1}`}
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className={addFieldTriggerClass}
        onClick={() => append({ university: "", title: "" })}
      >
        + Add education
      </button>
    </div>
  );
}

function CertificatesList() {
  const { control, register } = useFormContext<CVData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sidebar.certificates",
  });
  if (fields.length === 0) {
    return (
      <button
        type="button"
        className={addFieldTriggerClass}
        onClick={() => append({ year: undefined, name: "" })}
      >
        + Add certificate
      </button>
    );
  }
  return (
    <div className="space-y-5">
      {fields.map((f, i) => (
        <div key={f.id} className={cn(formNestedGroupClass, "flex flex-wrap items-end gap-3")}>
          <label className={formLabelControlStack}>
            <span className={formLabelClass}>Year</span>
            <input
              type="number"
              className={cn(formFieldSoftClass, "w-24")}
              {...register(`sidebar.certificates.${i}.year`, {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
            />
          </label>
          <input
            className={cn(formFieldSoftClass, "min-w-48 flex-1")}
            placeholder="Certificate name"
            {...register(`sidebar.certificates.${i}.name`)}
          />
          <button
            type="button"
            className={formDeleteButtonClass}
            onClick={() => remove(i)}
            aria-label={`Remove certificate row ${i + 1}`}
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        className={addFieldTriggerClass}
        onClick={() => append({ year: undefined, name: "" })}
      >
        + Add certificate
      </button>
    </div>
  );
}

function LanguagesList() {
  const { control, register } = useFormContext<CVData>();
  const { fields, append, remove } = useFieldArray({ control, name: "sidebar.languages" });
  if (fields.length === 0) {
    return (
      <button
        type="button"
        className={addFieldTriggerClass}
        onClick={() => append({ name: "", level: "" })}
      >
        + Add language
      </button>
    );
  }
  return (
    <div className="space-y-5">
      {fields.map((f, i) => (
        <div key={f.id} className={formNestedGroupClass}>
          <div className="flex items-start gap-3">
            <div className="grid min-w-0 flex-1 gap-5 sm:grid-cols-2">
            <label className={formLabelControlStack}>
              <span className={formLabelClass}>Language</span>
              <input
                className={formFieldSoftClass}
                placeholder="e.g. English"
                {...register(`sidebar.languages.${i}.name`)}
              />
            </label>
            <label className={formLabelControlStack}>
              <span className={formLabelClass}>Level</span>
              <input
                className={formFieldSoftClass}
                placeholder="e.g. Native, B2"
                {...register(`sidebar.languages.${i}.level`)}
              />
            </label>
            </div>
            <button
              type="button"
              className={formDeleteButtonClass}
              onClick={() => remove(i)}
              aria-label={`Remove language entry ${i + 1}`}
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className={addFieldTriggerClass}
        onClick={() => append({ name: "", level: "" })}
      >
        + Add language
      </button>
    </div>
  );
}

