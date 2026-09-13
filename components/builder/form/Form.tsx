"use client";

import {
  BadgeCheck,
  Cake,
  CalendarClock,
  Car,
  Github,
  Laptop,
  Globe,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  PanelLeft,
  PanelRight,
  Palette,
  PenLine,
  Phone,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import type { CVData, DetailFieldKey, PhotoMode, SkillLibrary } from "@/lib/cv-schema";
import { VisibilityToggle } from "@/components/ui/VisibilityToggle";
import type { CvAccentId } from "@/lib/cv-accents";
import { CV_ACCENTS, CV_ACCENT_IDS } from "@/lib/cv-accents";
import { cvTemplateUsesSingleColumn } from "@/lib/cv-templates";
import { TemplatePicker } from "@/components/builder/form/TemplatePicker";
import { Button } from "@/components/ui/Button";
import { RadioSwatch } from "@/components/ui/RadioSwatch";
import { AccordionGroup, AccordionItem, AccordionSection } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { effectivePhotoMode } from "@/lib/cv-photo";
import {
  composeGitHubValue,
  composeLinkedInValue,
  GITHUB_HANDLE_PREFIX,
  LINKEDIN_HANDLE_PREFIX,
  parseGitHubHandle,
  parseLinkedInHandle,
} from "@/lib/profile-links";
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
} from "@/lib/form-styles";
import { cn } from "@/lib/cn";
import { ExperienceEditor } from "@/components/builder/form/ExperienceEditor";
import { SkillsManager } from "@/components/builder/form/SkillsManager";
import { useEditorAccordionPref } from "@/hooks/use-editor-accordion-pref";
import type { GenerateCvInput } from "@/lib/openai";

export function FormModeTabs({
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

export function Form({
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
  const { control, register, watch, setValue } = useFormContext<CVData>();
  const sidebarPosition = watch("meta.sidebarPosition");
  const templateId = watch("meta.template") ?? "classic";
  const singleColumnTemplate = cvTemplateUsesSingleColumn(templateId);
  const detailsAccordion = useEditorAccordionPref("sidebar.details", false);
  const educationAccordion = useEditorAccordionPref("sidebar.education", false);
  const skillsAccordion = useEditorAccordionPref("sidebar.skills", false);
  const certificatesAccordion = useEditorAccordionPref("sidebar.certificates", false);
  const languagesAccordion = useEditorAccordionPref("sidebar.languages", false);
  const hobbiesAccordion = useEditorAccordionPref("sidebar.hobbies", false);

  return (
    <div className="space-y-8">
      <div
        id="panel-editor-manual"
        role="tabpanel"
        aria-labelledby="tab-editor-manual"
        hidden={mode !== "manual"}
        className="space-y-8"
      >
        <Section title="Design" description="Template, sidebar placement, and accent color for the PDF.">
          <div className="space-y-7">
            <div>
              <p className={cn(formLabelClass, "mb-3.5")}>Template</p>
              <TemplatePicker currentId={templateId} register={register} />
            </div>
            {!singleColumnTemplate ? (
              <div className="flex flex-col gap-3 border-t border-zinc-200/70 pt-6 sm:flex-row sm:items-center sm:gap-5 dark:border-zinc-800/80">
                <span className={cn(formLabelClass, "shrink-0 sm:min-w-30")}>Sidebar</span>
                <Button
                  variant="soft-violet"
                  className="w-fit max-w-full font-semibold"
                  onClick={() => {
                    const next = sidebarPosition === "right" ? "left" : "right";
                    setValue("meta.sidebarPosition", next, { shouldDirty: true });
                  }}
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
                </Button>
              </div>
            ) : (
              <p className="border-t border-zinc-200/70 pt-6 text-sm text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                Mono stacks everything in one column — sidebar placement does not apply.
              </p>
            )}
            <div className="border-t border-zinc-200/70 pt-6 dark:border-zinc-800/80">
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
          <div className="mt-6 border-t border-zinc-200/70 pt-6 dark:border-zinc-800/80">
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

        <Section title="Sidebar">
          <AccordionGroup className="space-y-3">
            <AccordionItem
              title="Details"
              variant="nested"
              open={detailsAccordion.open}
              onOpenChange={detailsAccordion.onOpenChange}
            >
              <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    { key: "location" as const, lab: "Location", Icon: MapPin },
                    { key: "email" as const, lab: "Email", Icon: Mail },
                    { key: "phone" as const, lab: "Phone", Icon: Phone },
                    { key: "website" as const, lab: "Website", Icon: Globe },
                  ] as const
                ).map(({ key, lab, Icon }) => (
                  <DetailFieldWithVisibility key={key} detailKey={key} label={lab} icon={Icon}>
                    <input
                      className={formFieldSectionClass}
                      {...register(`sidebar.details.${key}`)}
                    />
                  </DetailFieldWithVisibility>
                ))}
                <PrefixedHandleField
                  detailKey="linkedIn"
                  name="sidebar.details.linkedIn"
                  label="LinkedIn"
                  icon={Linkedin}
                  prefix={LINKEDIN_HANDLE_PREFIX}
                  parse={parseLinkedInHandle}
                  compose={composeLinkedInValue}
                  control={control}
                />
                <PrefixedHandleField
                  detailKey="gitHub"
                  name="sidebar.details.gitHub"
                  label="GitHub"
                  icon={Github}
                  prefix={GITHUB_HANDLE_PREFIX}
                  parse={parseGitHubHandle}
                  compose={composeGitHubValue}
                  control={control}
                />
                {(
                  [
                    { key: "portfolio" as const, lab: "Portfolio", Icon: Palette },
                    {
                      key: "workAuthorization" as const,
                      lab: "Work authorization",
                      Icon: BadgeCheck,
                    },
                    {
                      key: "availability" as const,
                      lab: "Availability",
                      Icon: CalendarClock,
                    },
                    {
                      key: "workMode" as const,
                      lab: "Work mode",
                      Icon: Laptop,
                    },
                    {
                      key: "drivingLicense" as const,
                      lab: "Driving license",
                      Icon: Car,
                    },
                    { key: "birthDate" as const, lab: "Birth date", Icon: Cake },
                  ] as const
                ).map(({ key, lab, Icon }) => (
                  <DetailFieldWithVisibility key={key} detailKey={key} label={lab} icon={Icon}>
                    <input
                      className={formFieldSectionClass}
                      {...register(`sidebar.details.${key}`)}
                    />
                  </DetailFieldWithVisibility>
                ))}
              </div>
            </AccordionItem>

            <AccordionItem
              title="Education"
              variant="nested"
              open={educationAccordion.open}
              onOpenChange={educationAccordion.onOpenChange}
            >
              <EducationList />
            </AccordionItem>

            <AccordionItem
              title="Skills library & visibility"
              variant="nested"
              open={skillsAccordion.open}
              onOpenChange={skillsAccordion.onOpenChange}
            >
              <SkillsManager
                skillLibrary={skillLibrary}
                onSkillLibraryChange={onSkillLibraryChange}
              />
            </AccordionItem>

            <AccordionItem
              title="Certificates"
              variant="nested"
              open={certificatesAccordion.open}
              onOpenChange={certificatesAccordion.onOpenChange}
            >
              <CertificatesList />
            </AccordionItem>

            <AccordionItem
              title="Languages"
              variant="nested"
              open={languagesAccordion.open}
              onOpenChange={languagesAccordion.onOpenChange}
            >
              <LanguagesList />
            </AccordionItem>

            <AccordionItem
              title="Hobbies & interests"
              variant="nested"
              open={hobbiesAccordion.open}
              onOpenChange={hobbiesAccordion.onOpenChange}
            >
              <label className={formLabelControlStack}>
                <span className={formLabelClass}>Interests</span>
                <textarea
                  rows={3}
                  className={formFieldSectionClass}
                  placeholder=""
                  {...register("sidebar.hobbiesText")}
                />
              </label>
            </AccordionItem>
          </AccordionGroup>
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
    <AccordionSection title="Skills library & visibility">
      <SkillsManager
        skillLibrary={skillLibrary}
        onSkillLibraryChange={onSkillLibraryChange}
      />
    </AccordionSection>
  );
}

function DetailFieldWithVisibility({
  detailKey,
  label,
  icon: Icon,
  children,
}: {
  detailKey: DetailFieldKey;
  label: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  const { control, setValue } = useFormContext<CVData>();
  const enabled = useWatch({
    control,
    name: `sidebar.detailsEnabled.${detailKey}`,
  });
  const visibleOnCv = enabled !== false;

  return (
    <div
      className={cn(
        "min-w-0",
        formLabelControlStack,
        !visibleOnCv && "opacity-70",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            formLabelClass,
            "inline-flex min-w-0 items-center gap-1.5",
          )}
        >
          <Icon
            className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400"
            aria-hidden
          />
          {label}
        </span>
        <VisibilityToggle
          visible={visibleOnCv}
          label={label}
          onToggle={() =>
            setValue(`sidebar.detailsEnabled.${detailKey}`, !visibleOnCv, {
              shouldDirty: true,
            })
          }
        />
      </div>
      {children}
    </div>
  );
}

function PrefixedHandleField({
  detailKey,
  name,
  label,
  icon: Icon,
  prefix,
  parse,
  compose,
  control,
}: {
  detailKey: DetailFieldKey;
  name: "sidebar.details.linkedIn" | "sidebar.details.gitHub";
  label: string;
  icon: LucideIcon;
  prefix: string;
  parse: (raw?: string) => string;
  compose: (handle: string) => string;
  control: Control<CVData>;
}) {
  const { setValue } = useFormContext<CVData>();
  const enabled = useWatch({
    control,
    name: `sidebar.detailsEnabled.${detailKey}`,
  });
  const visibleOnCv = enabled !== false;

  return (
    <div
      className={cn(
        "min-w-0",
        formLabelControlStack,
        !visibleOnCv && "opacity-70",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn(formLabelClass, "inline-flex items-center gap-1.5")}>
          <Icon className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden />
          {label}
        </span>
        <VisibilityToggle
          visible={visibleOnCv}
          label={label}
          onToggle={() =>
            setValue(`sidebar.detailsEnabled.${detailKey}`, !visibleOnCv, {
              shouldDirty: true,
            })
          }
        />
      </div>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div
            className={cn(
              formFieldSectionClass,
              "flex items-center px-0 py-0",
              "focus-within:border-violet-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgb(139_92_246_/0.16)]",
              "dark:focus-within:border-violet-400 dark:focus-within:bg-zinc-950 dark:focus-within:shadow-[0_0_0_3px_rgb(167_139_250_/0.2)]",
            )}
          >
            <span
              className="shrink-0 select-none pl-3.5 py-2.5 text-[0.9375rem] leading-snug text-zinc-400 dark:text-zinc-500"
              aria-hidden
            >
              {prefix}
            </span>
            <input
              className="min-w-0 flex-1 border-0 bg-transparent py-2.5 pr-3.5 text-[0.9375rem] font-medium leading-snug text-zinc-900 outline-hidden caret-violet-600 placeholder:font-normal placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:caret-violet-400"
              placeholder="username"
              value={parse(field.value)}
              onChange={(e) => field.onChange(compose(e.target.value))}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              aria-label={`${label} username`}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}
      />
    </div>
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
    <Button
      id={tabId}
      variant="tab"
      selected={on}
      tabContext={inWorkspace ? "workspace" : "standalone"}
      role="tab"
      aria-selected={on}
      aria-controls={panelId}
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
    </Button>
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
          <RadioSwatch
            key={id}
            selected={selected}
            dotSize={lg ? "md" : "sm"}
            color={CV_ACCENTS[id].accent}
            title={CV_ACCENTS[id].label}
            value={id}
            {...register("meta.accent")}
          />
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
    "motion-safe:transition-colors motion-safe:duration-200 flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3.5 py-2.5 text-[0.9375rem] text-zinc-800 hover:bg-zinc-100/80 has-[:checked]:border-violet-300/80 has-[:checked]:bg-violet-50 dark:text-zinc-200 dark:hover:bg-zinc-800/70 dark:has-[:checked]:border-violet-800/50 dark:has-[:checked]:bg-violet-950/30";

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
              className="min-w-0 flex-1 max-w-full py-2 text-[0.9375rem] leading-normal text-zinc-600 file:mr-4 file:cursor-pointer file:rounded-md file:border file:border-blue-700 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white file:shadow-sm file:transition-[background-color,border-color] file:duration-200 file:hover:border-blue-800 file:hover:bg-blue-700 dark:text-zinc-400 dark:file:border-blue-500 dark:file:bg-blue-600 dark:file:hover:border-blue-400 dark:file:hover:bg-blue-500"
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
    <section className="space-y-5 rounded-3xl border border-violet-300/60 bg-linear-to-b from-violet-50/95 via-white to-white p-7 shadow-[0_2px_24px_-12px_rgb(124_58_237_/0.14)] ring-1 ring-violet-200/50 dark:border-violet-900/40 dark:from-violet-950/35 dark:via-zinc-900/80 dark:to-zinc-900 dark:ring-white/6 sm:p-8">
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
      <Button
        variant="primary"
        size="lg"
        disabled={aiBusy}
        onClick={() =>
          onGenerate({
            description,
            targetRole: String(getValues("meta.targetRole") ?? "").trim(),
            tone,
            maxCvLength,
          })
        }
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
      </Button>
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
      <Button variant="text" onClick={() => append({ university: "", title: "" })}>
        + Add education
      </Button>
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
            <Button
              variant="icon-danger"
              size="icon"
              onClick={() => remove(i)}
              aria-label={`Remove education entry ${i + 1}`}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      ))}
      <Button variant="text" onClick={() => append({ university: "", title: "" })}>
        + Add education
      </Button>
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
      <Button variant="text" onClick={() => append({ year: undefined, name: "" })}>
        + Add certificate
      </Button>
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
          <Button
            variant="icon-danger"
            size="icon"
            onClick={() => remove(i)}
            aria-label={`Remove certificate row ${i + 1}`}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      ))}
      <Button variant="text" onClick={() => append({ year: undefined, name: "" })}>
        + Add certificate
      </Button>
    </div>
  );
}

function LanguagesList() {
  const { control, register } = useFormContext<CVData>();
  const { fields, append, remove } = useFieldArray({ control, name: "sidebar.languages" });
  if (fields.length === 0) {
    return (
      <Button variant="text" onClick={() => append({ name: "", level: "" })}>
        + Add language
      </Button>
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
            <Button
              variant="icon-danger"
              size="icon"
              onClick={() => remove(i)}
              aria-label={`Remove language entry ${i + 1}`}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      ))}
      <Button variant="text" onClick={() => append({ name: "", level: "" })}>
        + Add language
      </Button>
    </div>
  );
}

