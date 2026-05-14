"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  Copy,
  FileJson,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode, RefObject } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { CVForm } from "@/components/CVForm";
import { CVPreview } from "@/components/CVPreview";
import { CVPrint } from "@/components/print/CVPrint";
import { ExportButton } from "@/components/ExportButton";
import { cvDataSchema, type CVData, type SkillLibrary } from "@/lib/cv-schema";
import { blankCvData, exampleCvData, withDefaultMetaAccent } from "@/lib/default-cv-data";
import { localCvStorage } from "@/lib/storage";
import type { GenerateCvInput } from "@/lib/openai";
import { cn } from "@/lib/cn";
import { formFieldClass, formSelectClass } from "@/lib/form-styles";
import { motionInteractive } from "@/lib/motion-styles";
import { ThemeSelect } from "@/components/ThemeSelect";
import { CVBuilderMark, CVBuilderWordmark } from "@/components/CVBuilderLogo";

export function CVBuilder() {
  const [hydrated, setHydrated] = useState(false);
  const [versions, setVersions] = useState(() =>
    typeof window !== "undefined" ? localCvStorage.listVersions() : [],
  );
  const [activeId, setActiveId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localCvStorage.getActiveVersionId() : null,
  );
  const [skillLibraryState, setSkillLibraryState] = useState<SkillLibrary | null>(
    null,
  );
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const form = useForm<CVData>({
    resolver: zodResolver(cvDataSchema),
    defaultValues: blankCvData(),
    mode: "onChange",
  });

  const skillLibraryResolved = skillLibraryState ?? undefined;

  const loadVersionIntoForm = useCallback(
    (id: string) => {
      const cv = localCvStorage.getCv(id);
      const listName = localCvStorage.listVersions().find((v) => v.id === id)?.name;
      if (cv) {
        const displayName = cv.meta.versionName?.trim() || listName;
        form.reset(
          withDefaultMetaAccent({
            ...cv,
            meta: {
              ...cv.meta,
              ...(displayName ? { versionName: displayName } : {}),
            },
          }),
        );
      } else form.reset(blankCvData());
      const lib = localCvStorage.getSkillLibrary();
      setSkillLibraryState(lib);
    },
    [form],
  );

  useEffect(() => {
    queueMicrotask(() => {
      localCvStorage.listVersions();
      const id = localCvStorage.getActiveVersionId();
      const list = localCvStorage.listVersions();
      setVersions(list);
      const resolved = id && list.some((v) => v.id === id) ? id : list[0]?.id ?? null;
      setActiveId(resolved);
      if (resolved) {
        localCvStorage.setActiveVersionId(resolved);
        loadVersionIntoForm(resolved);
      }
      setHydrated(true);
    });
  }, [loadVersionIntoForm]);

  const cvSnapshot = useWatch({ control: form.control }) as CVData;

  useEffect(() => {
    if (!hydrated || !activeId) return;
    const t = window.setTimeout(() => {
      const v = form.getValues();
      localCvStorage.saveCv(activeId, v);
      setVersions(localCvStorage.listVersions());
      if (skillLibraryState) localCvStorage.setSkillLibrary(skillLibraryState);
    }, 450);
    return () => window.clearTimeout(t);
  }, [cvSnapshot, hydrated, activeId, form, skillLibraryState]);

  const onSkillLibraryChange = useCallback((lib: SkillLibrary) => {
    setSkillLibraryState(lib);
    localCvStorage.setSkillLibrary(lib);
  }, []);

  const handleGenerate = async (input: GenerateCvInput) => {
    setAiBusy(true);
    setAiError(null);
    try {
      const res = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as {
        cv?: CVData;
        error?: string;
        code?: string;
      };
      if (!res.ok) {
        setAiError(data.error || "Generation failed");
        return;
      }
      if (data.cv) {
        form.reset(withDefaultMetaAccent(data.cv));
        setMode("manual");
      }
    } catch {
      setAiError("Network error while generating CV.");
    } finally {
      setAiBusy(false);
    }
  };

  if (!hydrated || !activeId || !skillLibraryResolved) {
    return (
      <div
        className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-base text-zinc-500 dark:text-zinc-400"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="loading-dots font-medium tracking-tight text-zinc-700 dark:text-zinc-300">
          Loading
        </span>
        <span className="text-sm text-zinc-500/90 dark:text-zinc-500">Preparing your workspace…</span>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="print:hidden app-shell-enter mx-auto w-full max-w-[1920px] px-4 py-10 sm:px-8 sm:py-12 md:px-12 lg:px-16 lg:py-14 xl:px-20 2xl:px-24">
        <nav aria-label="Workspace" className="contents">
          <Toolbar
            activeId={activeId}
            versions={versions}
            onSelectVersion={(id) => {
              setActiveId(id);
              localCvStorage.setActiveVersionId(id);
              loadVersionIntoForm(id);
            }}
            onNewVersion={() => {
              const m = localCvStorage.createVersion("Untitled");
              setVersions(localCvStorage.listVersions());
              setActiveId(m.id);
              loadVersionIntoForm(m.id);
            }}
            onDuplicate={() => {
              const m = localCvStorage.duplicateVersion(activeId);
              if (m) {
                setVersions(localCvStorage.listVersions());
                setActiveId(m.id);
                loadVersionIntoForm(m.id);
              }
            }}
            onDelete={() => {
              if (!window.confirm("Delete this CV version? This cannot be undone.")) return;
              localCvStorage.deleteVersion(activeId);
              const list = localCvStorage.listVersions();
              setVersions(list);
              const next = list[0]?.id ?? null;
              setActiveId(next);
              if (next) {
                localCvStorage.setActiveVersionId(next);
                loadVersionIntoForm(next);
              }
            }}
            onSave={() => {
              const v = form.getValues();
              localCvStorage.saveCv(activeId, v);
              if (skillLibraryState) localCvStorage.setSkillLibrary(skillLibraryState);
              setVersions(localCvStorage.listVersions());
            }}
            onExportJson={() => {
              const blob = new Blob([localCvStorage.exportJson(activeId)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "cv-export.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
            onImportJsonClick={() => importRef.current?.click()}
            importRef={importRef}
            onImportFile={async (file) => {
              const text = await file.text();
              const parsed = localCvStorage.importJson(text);
              if (!parsed) {
                window.alert("Invalid JSON file.");
                return;
              }
              if (parsed.skillLibrary) {
                localCvStorage.setSkillLibrary(parsed.skillLibrary);
                setSkillLibraryState(parsed.skillLibrary);
              }
              form.reset(withDefaultMetaAccent(parsed.cv));
              localCvStorage.saveCv(activeId, parsed.cv);
              setVersions(localCvStorage.listVersions());
            }}
            themeSelect={<ThemeSelect embedded />}
            onLoadExample={() => {
              if (
                !                window.confirm("Replace this CV with the demo? Duplicate the version first to keep it.")
              ) {
                return;
              }
              const ex = exampleCvData();
              form.reset(withDefaultMetaAccent(ex));
            }}
            tagline="Edit, preview, and export a concise CV. All fields are optional."
            getCv={() => form.getValues()}
          />
        </nav>

        <main
          id="main-content"
          tabIndex={-1}
          className="outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
        <div className="grid gap-12 lg:grid-cols-[minmax(640px,1fr)_minmax(560px,720px)] lg:gap-16 xl:grid-cols-[minmax(720px,1fr)_minmax(600px,800px)] xl:gap-20">
          <section aria-label="CV fields" className="min-w-0 space-y-10">
            <form onSubmit={(e) => e.preventDefault()} noValidate>
              <CVForm
                mode={mode}
                setMode={setMode}
                skillLibrary={skillLibraryResolved}
                onSkillLibraryChange={onSkillLibraryChange}
                onGenerate={handleGenerate}
                aiBusy={aiBusy}
                aiError={aiError}
              />
            </form>
          </section>
          <aside
            aria-labelledby="live-preview-heading"
            className="flex min-h-0 min-w-0 flex-col gap-5 lg:sticky lg:top-10 lg:self-start"
          >
            <h2
              id="live-preview-heading"
              className="m-0 shrink-0 border-b border-zinc-100 pb-3 text-xl font-semibold tracking-tight text-zinc-900 dark:border-zinc-800/90 dark:text-zinc-50"
            >
              Live preview
            </h2>
            <CVPreview
              cv={cvSnapshot}
              className="min-h-0 w-full max-h-[calc(100vh-5.5rem)]"
            />
          </aside>
        </div>
        </main>
      </div>

      <div className="hidden print:block bg-white">
        <CVPrint cv={cvSnapshot} />
      </div>
    </FormProvider>
  );
}

function Toolbar({
  activeId,
  versions,
  onSelectVersion,
  onNewVersion,
  onDuplicate,
  onDelete,
  onSave,
  onExportJson,
  onImportJsonClick,
  importRef,
  onImportFile,
  themeSelect,
  onLoadExample,
  tagline,
  getCv,
}: {
  activeId: string;
  versions: { id: string; name: string; updatedAt: string }[];
  onSelectVersion: (id: string) => void;
  onNewVersion: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSave: () => void;
  onExportJson: () => void;
  onImportJsonClick: () => void;
  importRef: RefObject<HTMLInputElement | null>;
  onImportFile: (f: File) => void;
  themeSelect: ReactNode;
  onLoadExample: () => void;
  tagline: string;
  getCv: () => CVData;
}) {
  const { register } = useFormContext<CVData>();
  const jsonIoBtnClass = cn(
    motionInteractive,
    "inline-flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-2.5 text-sm font-medium text-amber-950 shadow-[0_1px_2px_rgb(0_0_0_/0.04)] hover:bg-amber-100/90 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-950/50",
  );

  return (
    <div className="mb-10 flex flex-col rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_2px_32px_-8px_rgb(0_0_0_/0.08),0_0_0_1px_rgb(255_255_255_/0.6)_inset] backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:shadow-[0_2px_40px_-10px_rgb(0_0_0_/0.55),inset_0_1px_0_rgb(255_255_255_/0.04)] sm:p-6">
      <div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-x-6"
        role="group"
        aria-label="About this app"
      >
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="m-0 flex shrink-0 items-center gap-1.5 sm:gap-2">
            <CVBuilderMark />
            <CVBuilderWordmark />
          </h1>
          <p className="m-0 min-w-0 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {tagline}
          </p>
        </div>
        <div
          className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-2 dark:border-zinc-700/80 dark:bg-zinc-800/40 sm:self-start"
          role="group"
          aria-label="Theme"
        >
          {themeSelect}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-zinc-200/70 pt-5 dark:border-zinc-700/70 lg:flex-row lg:items-center lg:justify-between lg:gap-x-6">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-1 lg:flex-row lg:flex-wrap lg:items-center">
          <div
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200/70 bg-zinc-50/90 p-2 dark:border-zinc-700/80 dark:bg-zinc-800/50"
            role="group"
            aria-label="CV versions"
          >
          <label
            htmlFor="cv-version-select"
            className="sr-only text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            CV version
          </label>
          <select
            id="cv-version-select"
            className={cn(
              formSelectClass,
              "w-auto min-w-42 py-2 text-sm font-medium sm:text-base",
            )}
            value={activeId}
            onChange={(e) => onSelectVersion(e.target.value)}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <label
            htmlFor="cv-version-name"
            className="flex min-w-0 flex-col gap-0.5 sm:max-w-[min(100%,15rem)] sm:flex-1 sm:flex-row sm:items-center sm:gap-2"
          >
            <span className="shrink-0 text-[0.6875rem] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              CV name
            </span>
            <input
              id="cv-version-name"
              {...register("meta.versionName")}
              type="text"
              autoComplete="off"
              placeholder="Untitled"
              className={cn(
                formFieldClass,
                "min-h-10 w-full min-w-0 py-2 text-sm sm:max-w-56",
              )}
            />
          </label>
          <button
            type="button"
            onClick={onNewVersion}
            className={cn(
              motionInteractive,
              "inline-flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/95 px-3.5 py-2.5 text-sm font-medium text-emerald-900 shadow-[0_1px_2px_rgb(0_0_0_/0.04)] hover:bg-emerald-100/90 dark:border-emerald-900/45 dark:bg-emerald-950/35 dark:text-emerald-100 dark:hover:bg-emerald-950/55",
            )}
            title="Create a new blank CV version"
            aria-label="Create a new blank CV version"
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            New
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className={cn(
              motionInteractive,
              "inline-flex items-center gap-2 rounded-xl border border-violet-200/80 bg-violet-50/95 px-3.5 py-2.5 text-sm font-medium text-violet-900 shadow-[0_1px_2px_rgb(0_0_0_/0.04)] hover:bg-violet-100/90 dark:border-violet-800/50 dark:bg-violet-950/40 dark:text-violet-100 dark:hover:bg-violet-950/55",
            )}
            title="Duplicate the current version"
            aria-label="Duplicate the current version"
          >
            <Copy className="size-4 shrink-0" aria-hidden />
            Duplicate
          </button>
          <button
            type="button"
            onClick={onDelete}
            className={cn(
              motionInteractive,
              "inline-flex items-center gap-2 rounded-xl border border-red-200/80 bg-red-50/95 px-3.5 py-2.5 text-sm font-medium text-red-800 shadow-[0_1px_2px_rgb(0_0_0_/0.04)] hover:bg-red-100/85 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-200 dark:hover:bg-red-950/50",
            )}
            title="Delete this CV version"
            aria-label="Delete this CV version"
          >
            <Trash2 className="size-4 shrink-0" aria-hidden />
            Delete
          </button>
          <button
            type="button"
            onClick={onSave}
            className={cn(
              motionInteractive,
              "inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_12px_-2px_rgb(124_58_237_/0.45)] hover:bg-violet-500 motion-safe:active:scale-[0.99] dark:bg-violet-600 dark:hover:bg-violet-500",
            )}
            title="Save now to local storage"
            aria-label="Save now to local storage"
          >
            <Save className="size-4 shrink-0" aria-hidden />
            Save
          </button>
          </div>

        <div
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-2 dark:border-zinc-700/80 dark:bg-zinc-800/40"
          role="group"
          aria-label="Import and export"
        >
          <button
            type="button"
            onClick={onExportJson}
            className={jsonIoBtnClass}
            title="Download this CV as JSON"
            aria-label="Download this CV as JSON"
          >
            <FileJson className="size-4 shrink-0" aria-hidden />
            Export JSON
          </button>
          <button
            type="button"
            onClick={onImportJsonClick}
            className={jsonIoBtnClass}
            title="Replace fields from a JSON file"
            aria-label="Replace fields from a JSON file"
          >
            <Upload className="size-4 shrink-0" aria-hidden />
            Import JSON
          </button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label="Choose JSON file to import into this CV"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportFile(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={onLoadExample}
            className={cn(
              motionInteractive,
              "inline-flex items-center gap-2 rounded-xl border border-dashed border-orange-300/90 bg-orange-50/95 px-3.5 py-2.5 text-sm font-medium text-orange-900 hover:bg-orange-100/85 dark:border-orange-800/55 dark:bg-orange-950/25 dark:text-orange-100 dark:hover:bg-orange-950/45",
            )}
            title="Load the built-in demo CV (overwrites current fields)"
            aria-label="Load the built-in demo CV (overwrites current fields)"
          >
            <BookOpen className="size-4 shrink-0" aria-hidden />
            Load demo
          </button>
        </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 lg:justify-end">
          <ExportButton getCv={getCv} compact />
        </div>
      </div>
    </div>
  );
}
