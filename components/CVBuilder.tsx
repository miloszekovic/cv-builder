"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
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
import { blankCvData, exampleCvData } from "@/lib/default-cv-data";
import { localCvStorage } from "@/lib/storage";
import type { GenerateCvInput } from "@/lib/openai";
import { cn } from "@/lib/cn";
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
      if (cv) form.reset(cv);
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
        form.reset(data.cv);
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
      <div className="flex min-h-[50vh] items-center justify-center text-base text-slate-500 dark:text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="print:hidden mx-auto w-full px-4 py-8 sm:px-8 md:px-10 lg:px-14 lg:py-10 xl:px-16 2xl:px-20">
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
            form.reset(parsed.cv);
            localCvStorage.saveCv(activeId, parsed.cv);
            setVersions(localCvStorage.listVersions());
          }}
          sidebarPosition={cvSnapshot.meta.sidebarPosition}
          onToggleSidebar={() => {
            const next =
              cvSnapshot.meta.sidebarPosition === "right" ? "left" : "right";
            form.setValue("meta.sidebarPosition", next, { shouldDirty: true });
          }}
          themeSelect={<ThemeSelect />}
          onLoadExample={() => {
            if (
              !window.confirm(
                "Replace current CV with the full demo (all fields filled for showcase)? Duplicate the version first if you want to keep what you have.",
              )
            ) {
              return;
            }
            const ex = exampleCvData();
            form.reset(ex);
          }}
        />

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
          <div className="min-w-0 space-y-8">
            <CVForm
              mode={mode}
              setMode={setMode}
              skillLibrary={skillLibraryResolved}
              onSkillLibraryChange={onSkillLibraryChange}
              onGenerate={handleGenerate}
              aiBusy={aiBusy}
              aiError={aiError}
            />
          </div>
          <div className="lg:sticky lg:top-8 lg:self-start space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Live preview · A4 (same fonts as PDF)
            </p>
            <CVPreview cv={cvSnapshot} className="max-h-[calc(100vh-8rem)]" />
          </div>
        </div>
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
  return (
    <div className="mb-8 flex flex-col flex-wrap gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-950/[0.03] dark:border-slate-700/90 dark:bg-slate-900/80 dark:ring-white/[0.04] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="sr-only text-xs font-medium text-slate-600 dark:text-slate-400">
          CV version
        </label>
        <select
          className={cn(
            "min-w-[10rem] rounded-lg border border-slate-200/90 bg-slate-50/80 px-3 py-2 text-base font-medium text-slate-900",
            "dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100",
            "focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25",
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
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-xs hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <Plus className="size-4" aria-hidden />
          New
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-xs hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <Copy className="size-4" aria-hidden />
          Duplicate
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200/90 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-xs hover:bg-red-50 dark:border-red-900/60 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <Trash2 className="size-4" aria-hidden />
          Delete
        </button>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Save className="size-4" aria-hidden />
          Save
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {themeSelect}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-xs hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          title="Sidebar position"
        >
          {sidebarPosition === "right" ? (
            <PanelRight className="size-4" aria-hidden />
          ) : (
            <PanelLeft className="size-4" aria-hidden />
          )}
          Sidebar: {sidebarPosition}
        </button>
        <button
          type="button"
          onClick={onExportJson}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-xs hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <FileJson className="size-4" aria-hidden />
          Export JSON
        </button>
        <button
          type="button"
          onClick={onImportJsonClick}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-xs hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <Upload className="size-4" aria-hidden />
          Import JSON
        </button>
        <input
          ref={importRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImportFile(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={onLoadExample}
          className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Load demo
        </button>
      </div>
    </div>
  );
}
