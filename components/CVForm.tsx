"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { CVData, PhotoMode, SkillLibrary } from "@/lib/cv-schema";
import { effectivePhotoMode } from "@/lib/cv-photo";
import { formFieldClass, formLabelClass } from "@/lib/form-styles";
import { cn } from "@/lib/cn";
import { ExperienceEditor } from "@/components/ExperienceEditor";
import { SkillsManager } from "@/components/SkillsManager";
import type { GenerateCvInput } from "@/lib/openai";

export function CVForm({
  mode,
  setMode,
  skillLibrary,
  onSkillLibraryChange,
  onGenerate,
  aiBusy,
  aiError,
}: {
  mode: "manual" | "ai";
  setMode: (m: "manual" | "ai") => void;
  skillLibrary: SkillLibrary;
  onSkillLibraryChange: (lib: SkillLibrary) => void;
  onGenerate: (input: GenerateCvInput) => Promise<void>;
  aiBusy: boolean;
  aiError: string | null;
}) {
  const { register } = useFormContext<CVData>();

  return (
    <div className="space-y-8">
      <div
        className="flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-slate-100/90 p-1.5 dark:border-slate-700/80 dark:bg-slate-800/80"
        role="tablist"
        aria-label="Editor mode"
      >
        <ModeTab id="manual" current={mode} setMode={setMode} label="Manual" />
        <ModeTab id="ai" current={mode} setMode={setMode} label="AI-assisted" />
      </div>

      {mode === "ai" && (
        <AiPanel onGenerate={onGenerate} aiBusy={aiBusy} aiError={aiError} />
      )}

      {mode === "manual" && (
        <>
          <Section title="Profile & header">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className={formLabelClass}>Name</span>
                <input className={formFieldClass} {...register("body.name")} />
              </label>
              <label className="block space-y-1.5">
                <span className={formLabelClass}>Main role</span>
                <input className={formFieldClass} {...register("body.mainRole")} />
              </label>
            </div>
            <PhotoField />
            <label className="block space-y-1.5">
              <span className={formLabelClass}>Profile / intro</span>
              <textarea rows={5} className={formFieldClass} {...register("body.profile")} />
            </label>
          </Section>

          <Section title="Experience">
            <ExperienceEditor />
          </Section>

          <Section title="Sidebar — details">
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["location", "Location"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["website", "Website"],
                  ["linkedIn", "LinkedIn"],
                  ["gitHub", "GitHub"],
                ] as const
              ).map(([key, lab]) => (
                <label key={key} className="block space-y-1.5">
                  <span className={formLabelClass}>{lab}</span>
                  <input
                    className={formFieldClass}
                    {...register(`sidebar.details.${key}`)}
                  />
                </label>
              ))}
            </div>
          </Section>

          <Section title="Education">
            <EducationList />
          </Section>

          <Section title="Certificates">
            <CertificatesList />
          </Section>

          <Section title="Languages">
            <LanguagesList />
          </Section>

          <Section title="Hobbies & interests">
            <label className="block space-y-1.5">
              <span className={formLabelClass}>Free text (optional)</span>
              <textarea
                rows={2}
                className={formFieldClass}
                {...register("sidebar.hobbiesText")}
              />
            </label>
            <HobbiesTags />
          </Section>
        </>
      )}

      <Section title="Skills library & visibility">
        <SkillsManager
          skillLibrary={skillLibrary}
          onSkillLibraryChange={onSkillLibraryChange}
        />
      </Section>
    </div>
  );
}

function ModeTab({
  id,
  current,
  setMode,
  label,
}: {
  id: "manual" | "ai";
  current: "manual" | "ai";
  setMode: (m: "manual" | "ai") => void;
  label: string;
}) {
  const on = current === id;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={on}
      className={cn(
        "rounded-lg px-4 py-2 text-base font-medium transition-colors",
        on
          ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:text-slate-50 dark:ring-white/10"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
      )}
      onClick={() => setMode(id)}
    >
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-950/[0.04] dark:border-slate-700/90 dark:bg-slate-900 dark:ring-white/[0.05]">
      <h3 className="border-b border-slate-100 pb-3 text-lg font-semibold tracking-tight text-slate-900 dark:border-slate-800 dark:text-slate-50">
        {title}
      </h3>
      {children}
    </section>
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
    "flex cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-base text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80";

  return (
    <div className="space-y-4">
      <span className={formLabelClass}>Header appearance</span>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <label className={radioRow}>
          <input
            type="radio"
            className="size-4 shrink-0 accent-slate-900 dark:accent-blue-500"
            checked={mode === "image"}
            onChange={() => setMode("image")}
          />
          Photo (upload)
        </label>
        <label className={radioRow}>
          <input
            type="radio"
            className="size-4 shrink-0 accent-slate-900 dark:accent-blue-500"
            checked={mode === "initials"}
            onChange={() => setMode("initials")}
          />
          Initials (from name)
        </label>
        <label className={radioRow}>
          <input
            type="radio"
            className="size-4 shrink-0 accent-slate-900 dark:accent-blue-500"
            checked={mode === "none"}
            onChange={() => setMode("none")}
          />
          None
        </label>
      </div>
      {mode === "image" && (
        <label className="block space-y-1.5">
          <span className={formLabelClass}>Image file</span>
          <input
            type="file"
            accept="image/*"
            className="text-base text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white dark:text-slate-400 dark:file:bg-blue-600"
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
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Stored as a data URL in your browser for this CV version.
          </p>
        </label>
      )}
      {mode === "initials" && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Shows two letters from your name (first word + second word, or first two letters of a single
          name).
        </p>
      )}
    </div>
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
    <section className="space-y-4 rounded-2xl border border-blue-100/90 bg-linear-to-b from-blue-50/90 to-white p-6 shadow-sm ring-1 ring-blue-900/[0.04] dark:border-blue-900/50 dark:from-blue-950/50 dark:to-slate-900 dark:ring-white/[0.05]">
      <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
        <Sparkles className="size-5 shrink-0" aria-hidden />
        <h3 className="text-lg font-semibold">AI-assisted draft</h3>
      </div>
      <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
        Describe your background, strengths, and goals. The model fills the same fields as
        manual mode — review everything before exporting.
      </p>
      <label className="block space-y-1.5">
        <span className={formLabelClass}>Target role</span>
        <input
          className={formFieldClass}
          placeholder="e.g. Front-End Developer, UI Engineer"
          {...register("meta.targetRole")}
        />
      </label>
      <label className="block space-y-1.5">
        <span className={formLabelClass}>Your description</span>
        <textarea
          rows={8}
          className={formFieldClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className={formLabelClass}>Tone</span>
          <select
            className={formFieldClass}
            value={tone}
            onChange={(e) => setTone(e.target.value as GenerateCvInput["tone"])}
          >
            <option value="professional">Professional</option>
            <option value="direct">Direct</option>
            <option value="friendly">Friendly</option>
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className={formLabelClass}>Length hint</span>
          <select
            className={formFieldClass}
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
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-base font-medium text-white hover:bg-blue-700 disabled:opacity-60"
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
      <div className="min-h-5" aria-live="polite">
        {aiError && (
          <p className="text-base text-red-600 dark:text-red-400">{aiError}</p>
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
        className="text-base font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        onClick={() => append({ university: "", title: "" })}
      >
        + Add education
      </button>
    );
  }
  return (
    <div className="space-y-3">
      {fields.map((f, i) => (
        <div key={f.id} className="grid gap-3 rounded-xl border border-slate-100/90 bg-slate-50/40 p-4 dark:border-slate-700 dark:bg-slate-800/30 sm:grid-cols-2">
          <input
            className={formFieldClass}
            placeholder="University"
            {...register(`sidebar.education.${i}.university`)}
          />
          <div className="flex gap-2">
            <input
              className={cn(formFieldClass, "min-w-0 flex-1")}
              placeholder="Title / degree"
              {...register(`sidebar.education.${i}.title`)}
            />
            <button
              type="button"
              className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-slate-600 dark:text-red-400 dark:hover:bg-red-950/40"
              onClick={() => remove(i)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="text-base font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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
        className="text-base font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        onClick={() => append({ year: undefined, name: "" })}
      >
        + Add certificate
      </button>
    );
  }
  return (
    <div className="space-y-3">
      {fields.map((f, i) => (
        <div key={f.id} className="flex flex-wrap gap-2 items-end">
          <label className="space-y-1">
            <span className={formLabelClass}>Year</span>
            <input
              type="number"
              className={cn(formFieldClass, "w-24")}
              {...register(`sidebar.certificates.${i}.year`, {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
            />
          </label>
          <input
            className={cn(formFieldClass, "min-w-48 flex-1")}
            placeholder="Certificate name"
            {...register(`sidebar.certificates.${i}.name`)}
          />
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-slate-600 dark:text-red-400 dark:hover:bg-red-950/40"
            onClick={() => remove(i)}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-base font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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
        className="text-base font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        onClick={() => append({ name: "", level: "" })}
      >
        + Add language
      </button>
    );
  }
  return (
    <div className="space-y-3">
      {fields.map((f, i) => (
        <div key={f.id} className="flex flex-wrap gap-2">
          <input
            className={cn(formFieldClass, "min-w-32 flex-1")}
            placeholder="Language"
            {...register(`sidebar.languages.${i}.name`)}
          />
          <input
            className={cn(formFieldClass, "min-w-32 flex-1")}
            placeholder="Level"
            {...register(`sidebar.languages.${i}.level`)}
          />
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-slate-600 dark:text-red-400 dark:hover:bg-red-950/40"
            onClick={() => remove(i)}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-base font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        onClick={() => append({ name: "", level: "" })}
      >
        + Add language
      </button>
    </div>
  );
}

function HobbiesTags() {
  const { control, register } = useFormContext<CVData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sidebar.hobbies" as never,
  });
  return (
    <fieldset className="space-y-2">
      <legend className={formLabelClass}>Tags</legend>
      <div className="flex flex-wrap gap-2">
        {fields.map((f, i) => (
          <div key={f.id} className="flex gap-1">
            <input
              className={cn(formFieldClass, "w-32")}
              {...register(`sidebar.hobbies.${i}`)}
            />
            <button
              type="button"
              className="rounded-md px-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              onClick={() => remove(i)}
              aria-label="Remove hobby tag"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="text-base font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        onClick={() => append("" as never)}
      >
        + Add hobby tag
      </button>
    </fieldset>
  );
}
