"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  Copy,
  FileJson,
  PanelLeft,
  PanelRight,
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
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { CVForm } from "@/components/CVForm";
import { CVPreview } from "@/components/CVPreview";
import { CVPrint } from "@/components/print/CVPrint";
import { ExportButton } from "@/components/ExportButton";
import { cvDataSchema, type CVData, type SkillLibrary } from "@/lib/cv-schema";
import { blankCvData, exampleCvData, withDefaultMetaAccent } from "@/lib/default-cv-data";
import { localCvStorage } from "@/lib/storage";
import type { GenerateCvInput } from "@/lib/openai";
import { cn } from "@/lib/cn";
import { formSelectClass } from "@/lib/form-styles";
import { motionInteractive } from "@/lib/motion-styles";
import { ThemeSelect } from "@/components/ThemeSelect";

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
      if (cv) form.reset(withDefaultMetaAccent(cv));
      else form.reset(blankCvData());
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
        className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-base text-slate-500 dark:text-slate-400"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="loading-dots font-medium tracking-tight">Loading</span>
        <span className="text-sm opacity-70">Preparing your workspace…</span>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="print:hidden app-shell-enter mx-auto w-full px-4 py-8 sm:px-8 md:px-10 lg:px-14 lg:py-10 xl:px-16 2xl:px-20">
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
            sidebarPosition={cvSnapshot.meta.sidebarPosition}
            onToggleSidebar={() => {
              const next =
                cvSnapshot.meta.sidebarPosition === "right" ? "left" : "right";
              form.setValue("meta.sidebarPosition", next, { shouldDirty: true });
            }}
            themeSelect={<ThemeSelect embedded />}
            onLoadExample={() => {
              if (
                !window.confirm(
                  "Replace current CV with the full demo (all fields filled for showcase)? Duplicate the version first if you want to keep what you have.",
                )
              ) {
                return;
              }
              const ex = exampleCvData();
              form.reset(withDefaultMetaAccent(ex));
            }}
          />
        </nav>

        <main
          id="main-content"
          tabIndex={-1}
          className="outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950"
        >
          <header className="mb-8 flex flex-col gap-5 border-b border-slate-200/90 pb-8 dark:border-slate-700/80 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              CV Builder
            </h1>
            <p className="mt-2 text-base leading-relaxed text-slate-600 dark:text-slate-400">
              Edit, preview, and export a concise two-page CV. All fields are optional.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ExportButton getCv={() => form.getValues()} />
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(640px,1fr)_minmax(560px,720px)] lg:gap-14 xl:grid-cols-[minmax(720px,1fr)_minmax(600px,800px)]">
          <section aria-label="CV fields" className="min-w-0 space-y-8">
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
            className="min-h-0 min-w-0 space-y-4 lg:sticky lg:top-8 lg:self-start"
          >
            <h2
              id="live-preview-heading"
              className="text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-300"
            >
              Live preview
            </h2>
            <CVPreview cv={cvSnapshot} className="max-h-[calc(100vh-8rem)]" />
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
  sidebarPosition,
  onToggleSidebar,
  themeSelect,
  onLoadExample,
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
  sidebarPosition: CVData["meta"]["sidebarPosition"];
  onToggleSidebar: () => void;
  themeSelect: ReactNode;
  onLoadExample: () => void;
}) {
  const jsonIoBtnClass = cn(
    motionInteractive,
    "inline-flex items-center gap-1.5 rounded-lg border border-amber-200/90 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950 shadow-xs hover:bg-amber-100/90 dark:border-amber-800/60 dark:bg-amber-950/35 dark:text-amber-100 dark:hover:bg-amber-900/40",
  );

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-950/3 dark:border-slate-700/90 dark:bg-slate-900/80 dark:ring-white/4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
        <div
          className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/95 p-1.5 dark:border-slate-600/90 dark:bg-slate-800/75"
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
          <button
            type="button"
            onClick={onNewVersion}
            className={cn(
              motionInteractive,
              "inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/90 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 shadow-xs hover:bg-emerald-100/90 dark:border-emerald-800/70 dark:bg-emerald-950/45 dark:text-emerald-100 dark:hover:bg-emerald-900/50",
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
              "inline-flex items-center gap-1.5 rounded-lg border border-violet-200/90 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-900 shadow-xs hover:bg-violet-100/90 dark:border-violet-800/70 dark:bg-violet-950/45 dark:text-violet-100 dark:hover:bg-violet-900/50",
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
              "inline-flex items-center gap-1.5 rounded-lg border border-red-200/90 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 shadow-xs hover:bg-red-100/80 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950/55",
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
              "inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500",
            )}
            title="Save now to local storage"
            aria-label="Save now to local storage"
          >
            <Save className="size-4 shrink-0" aria-hidden />
            Save
          </button>
        </div>

        <div
          className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-1.5 dark:border-slate-600/90 dark:bg-slate-800/50"
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
              "inline-flex items-center gap-1.5 rounded-lg border border-dashed border-orange-300/90 bg-orange-50/90 px-3 py-2 text-sm font-medium text-orange-900 hover:bg-orange-100/80 dark:border-orange-700/70 dark:bg-orange-950/30 dark:text-orange-100 dark:hover:bg-orange-950/45",
            )}
            title="Load the built-in demo CV (overwrites current fields)"
            aria-label="Load the built-in demo CV (overwrites current fields)"
          >
            <BookOpen className="size-4 shrink-0" aria-hidden />
            Load demo
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <div
            className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-1.5 dark:border-slate-600/90 dark:bg-slate-800/50"
            role="group"
            aria-label="Theme"
          >
            {themeSelect}
          </div>
          <div
            className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-1.5 dark:border-slate-600/90 dark:bg-slate-800/50"
            role="group"
            aria-label="Sidebar column"
          >
            <button
              type="button"
              onClick={onToggleSidebar}
              className={cn(
                motionInteractive,
                "inline-flex items-center gap-1.5 rounded-lg border border-indigo-200/90 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-900 shadow-xs hover:bg-indigo-100/90 dark:border-indigo-800/70 dark:bg-indigo-950/40 dark:text-indigo-100 dark:hover:bg-indigo-900/45",
              )}
              title="Toggle sidebar column (left or right)"
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
              Sidebar: {sidebarPosition}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
