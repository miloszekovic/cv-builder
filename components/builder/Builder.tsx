"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Copy,
  Eye,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { RefObject } from "react";
import { createPortal, flushSync } from "react-dom";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { Form, FormModeTabs } from "@/components/builder/form/Form";
import { Preview } from "@/components/builder/preview/Preview";
import { Button } from "@/components/ui/Button";
import { ExportButton } from "@/components/builder/toolbar/ExportButton";
import { useCvPdfPreview } from "@/hooks/use-cv-pdf-preview";
import { cvDataSchema, type CVData, type SkillLibrary } from "@/lib/cv-schema";
import {
  blankCvData,
  exampleCvData,
  normalizeCvForForm,
  withDefaultMetaAccent,
} from "@/lib/default-cv-data";
import { localCvStorage } from "@/lib/storage";
import type { GenerateCvInput } from "@/lib/openai";
import { cn } from "@/lib/cn";
import { formFieldClass, formSelectClass, editorPreviewSectionClass, editorSectionClass, editorWorkspaceBodyClass, editorWorkspaceShellClass, editorWorkspaceTabBarClass } from "@/lib/form-styles";
import { ThemeSelect } from "@/components/builder/toolbar/ThemeSelect";
import { ToolbarMoreMenu } from "@/components/builder/toolbar/ToolbarMoreMenu";
import { LogoMark, LogoWordmark } from "@/components/layout/Logo";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ModalFadeShell } from "@/components/ui/ModalFadeShell";
import { ModalScrim } from "@/components/ui/ModalScrim";
import { PreviewModal } from "@/components/builder/preview/PreviewModal";

export function Builder() {
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
  const [deleteVersionOpen, setDeleteVersionOpen] = useState(false);
  const [loadDemoOpen, setLoadDemoOpen] = useState(false);
  const [saveFeedbackVisible, setSaveFeedbackVisible] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const saveFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

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
        const normalized = normalizeCvForForm(cv);
        const displayName = normalized.meta.versionName?.trim() || listName;
        form.reset(
          withDefaultMetaAccent({
            ...normalized,
            meta: {
              ...normalized.meta,
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
  const pdfPreview = useCvPdfPreview(cvSnapshot);
  const pdfBlobRef = useRef<Blob | null>(null);
  const pdfBlobUrlRef = useRef<string | null>(null);
  pdfBlobRef.current = pdfPreview.blob;
  pdfBlobUrlRef.current = pdfPreview.blobUrl;

  useEffect(() => {
    if (!hydrated || !activeId) return;
    const t = window.setTimeout(() => {
      if (localCvStorage.getActiveVersionId() !== activeId) return;
      if (!localCvStorage.getCv(activeId)) return;
      const v = form.getValues();
      localCvStorage.saveCv(activeId, v);
      setVersions(localCvStorage.listVersions());
      if (skillLibraryState) localCvStorage.setSkillLibrary(skillLibraryState);
    }, 450);
    return () => window.clearTimeout(t);
  }, [cvSnapshot, hydrated, activeId, form, skillLibraryState]);

  const dismissSaveFeedback = useCallback(() => {
    setSaveFeedbackVisible(false);
    if (saveFeedbackTimerRef.current) {
      clearTimeout(saveFeedbackTimerRef.current);
      saveFeedbackTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const modalOpen =
      deleteVersionOpen || loadDemoOpen || saveFeedbackVisible || previewOpen;
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setDeleteVersionOpen(false);
        setLoadDemoOpen(false);
        setPreviewOpen(false);
        dismissSaveFeedback();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [deleteVersionOpen, loadDemoOpen, saveFeedbackVisible, previewOpen, dismissSaveFeedback]);

  useEffect(() => {
    return () => {
      if (saveFeedbackTimerRef.current) clearTimeout(saveFeedbackTimerRef.current);
    };
  }, []);

  const handleManualSave = useCallback(() => {
    if (!activeId) return;
    const v = form.getValues();
    localCvStorage.saveCv(activeId, v);
    if (skillLibraryState) localCvStorage.setSkillLibrary(skillLibraryState);
    setVersions(localCvStorage.listVersions());
    setSaveFeedbackVisible(true);
    if (saveFeedbackTimerRef.current) clearTimeout(saveFeedbackTimerRef.current);
    saveFeedbackTimerRef.current = setTimeout(() => {
      dismissSaveFeedback();
    }, 2200);
  }, [activeId, dismissSaveFeedback, form, skillLibraryState]);

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
        form.reset(withDefaultMetaAccent(normalizeCvForForm(data.cv)));
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
      <div className="app-shell-enter mx-auto w-full max-w-[1920px] px-4 py-10 sm:px-8 sm:py-12 md:px-12 lg:px-16 lg:py-14 xl:px-20 2xl:px-24">
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
            onDeleteRequest={() => setDeleteVersionOpen(true)}
            onSave={handleManualSave}
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
              form.reset(withDefaultMetaAccent(normalizeCvForForm(parsed.cv)));
              localCvStorage.saveCv(activeId, parsed.cv);
              setVersions(localCvStorage.listVersions());
            }}
            onLoadExample={() => setLoadDemoOpen(true)}
            tagline="Edit, preview, and export a concise CV. All fields are optional."
            getCv={() => form.getValues()}
            getPdfBlob={() => pdfBlobRef.current}
            getPdfBlobUrl={() => pdfBlobUrlRef.current}
            previewIframeRef={previewIframeRef}
            previewBusy={pdfPreview.busy}
          />
        </nav>

        <main
          id="main-content"
          tabIndex={-1}
          className="outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
        <div className={editorWorkspaceShellClass}>
          <div className={editorWorkspaceTabBarClass}>
            <FormModeTabs mode={mode} setMode={setMode} />
          </div>
          <div className={editorWorkspaceBodyClass}>
            <section aria-label="CV fields" className="min-w-0 space-y-8">
              <form onSubmit={(e) => e.preventDefault()} noValidate>
                <Form
                  mode={mode}
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
              className="hidden min-h-0 min-w-0 flex-col lg:flex lg:sticky lg:top-8 lg:z-10 lg:max-h-[calc(100dvh-4rem)] lg:self-start"
            >
              <section className={cn(editorPreviewSectionClass, "motion-safe:hover:translate-y-0")}>
                <div className="border-b border-zinc-200/80 pb-2.5 dark:border-zinc-800/90">
                  <h2 id="live-preview-heading" className="m-0 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Live preview
                  </h2>
                </div>
                <Preview
                  blobUrl={pdfPreview.blobUrl}
                  busy={pdfPreview.busy}
                  err={pdfPreview.err}
                  embedded
                  className="min-h-0 w-full max-h-[min(896px,calc(100dvh-6rem))]"
                />
              </section>
            </aside>
            <div
              className="pointer-events-none fixed left-0 top-0 -z-10 h-px w-px overflow-hidden opacity-0 lg:hidden"
              aria-hidden
            >
              <Preview
                ref={previewIframeRef}
                blobUrl={pdfPreview.blobUrl}
                busy={pdfPreview.busy}
                err={pdfPreview.err}
                embedded
              />
            </div>
          </div>
        </div>
        </main>

        <SiteFooter />
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <Button
            onClick={() => setPreviewOpen(true)}
            className={cn(
              "fixed z-40 lg:hidden",
              "bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]",
              previewOpen && "pointer-events-none opacity-0",
            )}
            aria-haspopup="dialog"
            aria-expanded={previewOpen}
          >
            <Eye className="size-4 shrink-0" aria-hidden />
            Preview CV
            {pdfPreview.busy && (
              <span className="size-2 shrink-0 rounded-full bg-white/90 motion-safe:animate-pulse" aria-hidden />
            )}
          </Button>,
          document.body,
        )}

      {typeof document !== "undefined" &&
        createPortal(
          <PreviewModal
            open={previewOpen}
            onDismiss={() => setPreviewOpen(false)}
            blobUrl={pdfPreview.blobUrl}
            busy={pdfPreview.busy}
            err={pdfPreview.err}
          />,
          document.body,
        )}
      {typeof document !== "undefined" &&
        createPortal(
          <DeleteVersionModal
            open={deleteVersionOpen}
            versionName={
              versions.find((v) => v.id === activeId)?.name?.trim() || "Untitled"
            }
            onDismiss={() => setDeleteVersionOpen(false)}
            onConfirm={() => {
              if (!activeId) return;
              localCvStorage.deleteVersion(activeId);
              const list = localCvStorage.listVersions();
              const next = localCvStorage.getActiveVersionId();
              flushSync(() => {
                setVersions(list);
                setActiveId(next);
              });
              if (next) {
                loadVersionIntoForm(next);
              } else {
                form.reset(blankCvData());
                setSkillLibraryState(localCvStorage.getSkillLibrary());
              }
              setDeleteVersionOpen(false);
            }}
          />,
          document.body,
        )}
      {typeof document !== "undefined" &&
        createPortal(
          <LoadDemoModal
            open={loadDemoOpen}
            onDismiss={() => setLoadDemoOpen(false)}
            onConfirm={() => {
              form.reset(
                withDefaultMetaAccent(normalizeCvForForm(exampleCvData())),
              );
              setLoadDemoOpen(false);
            }}
          />,
          document.body,
        )}
      {typeof document !== "undefined" &&
        createPortal(
          <SaveFeedbackModal
            open={saveFeedbackVisible}
            onDismiss={dismissSaveFeedback}
          />,
          document.body,
        )}
    </FormProvider>
  );
}

function SaveFeedbackModal({
  open,
  onDismiss,
}: {
  open: boolean;
  onDismiss: () => void;
}) {
  return (
    <ModalFadeShell open={open}>
      <ModalScrim onDismiss={onDismiss} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-feedback-title"
        className={cn(
          "relative z-10 w-full max-w-md origin-bottom sm:origin-center",
          "rounded-3xl border border-zinc-200/90 bg-white/95 p-6 shadow-[0_24px_64px_-12px_rgb(0_0_0_/0.28),0_0_0_1px_rgb(255_255_255_/0.8)_inset] ring-1 ring-zinc-950/5 backdrop-blur-xl dark:border-zinc-600/80 dark:bg-zinc-900/95 dark:shadow-[0_24px_64px_-8px_rgb(0_0_0_/0.55)] dark:ring-white/10 sm:p-7",
        )}
      >
        <div className="flex flex-col gap-5">
          <div className="flex gap-4">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/22 to-emerald-600/12 text-emerald-600 dark:from-emerald-500/25 dark:to-emerald-950/40 dark:text-emerald-400"
              aria-hidden
            >
              <CheckCircle2 className="size-6" strokeWidth={2} />
            </div>
            <div className="min-w-0 space-y-2 pt-0.5">
              <h2
                id="save-feedback-title"
                className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                Saved locally
              </h2>
              <p className="text-[0.9375rem] leading-relaxed text-zinc-600 dark:text-zinc-400">
                Your CV and skill library are stored in this browser (local storage).
              </p>
            </div>
          </div>
          <div className="flex justify-end border-t border-zinc-200/70 pt-4 dark:border-zinc-800/90">
            <Button onClick={onDismiss}>OK</Button>
          </div>
        </div>
      </div>
    </ModalFadeShell>
  );
}

function LoadDemoModal({
  open,
  onDismiss,
  onConfirm,
}: {
  open: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalFadeShell open={open}>
      <ModalScrim onDismiss={onDismiss} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="load-demo-title"
        className={cn(
          "relative z-10 w-full max-w-104 origin-bottom sm:origin-center",
          "rounded-3xl border border-zinc-200/90 bg-white/95 p-6 shadow-[0_24px_64px_-12px_rgb(0_0_0_/0.28),0_0_0_1px_rgb(255_255_255_/0.8)_inset] ring-1 ring-zinc-950/5 backdrop-blur-xl dark:border-zinc-600/80 dark:bg-zinc-900/95 dark:shadow-[0_24px_64px_-8px_rgb(0_0_0_/0.55)] dark:ring-white/10 sm:p-8",
        )}
      >
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500/22 to-violet-600/12 text-violet-600 dark:from-violet-500/25 dark:to-violet-950/40 dark:text-violet-400"
              aria-hidden
            >
              <BookOpen className="size-6" strokeWidth={2} />
            </div>
            <div className="min-w-0 space-y-2 pt-0.5">
              <h2
                id="load-demo-title"
                className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                Load demo CV?
              </h2>
              <p className="text-[0.9375rem] leading-relaxed text-zinc-600 dark:text-zinc-400">
                This replaces the fields in your current version with sample content.
                Duplicate the version first if you want to keep what you have.
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2.5 border-t border-zinc-200/70 pt-5 sm:flex-row sm:justify-end dark:border-zinc-800/90">
            <Button variant="secondary" size="lg" fullWidth onClick={onDismiss}>
              Cancel
            </Button>
            <Button size="lg" fullWidth onClick={onConfirm}>
              Load demo
            </Button>
          </div>
        </div>
      </div>
    </ModalFadeShell>
  );
}

function DeleteVersionModal({
  open,
  versionName,
  onDismiss,
  onConfirm,
}: {
  open: boolean;
  versionName: string;
  onDismiss: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalFadeShell open={open}>
      <ModalScrim onDismiss={onDismiss} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-version-title"
        className={cn(
          "relative z-10 w-full max-w-104 origin-bottom sm:origin-center",
          "rounded-3xl border border-zinc-200/90 bg-white/95 p-6 shadow-[0_24px_64px_-12px_rgb(0_0_0_/0.28),0_0_0_1px_rgb(255_255_255_/0.8)_inset] ring-1 ring-zinc-950/5 backdrop-blur-xl dark:border-zinc-600/80 dark:bg-zinc-900/95 dark:shadow-[0_24px_64px_-8px_rgb(0_0_0_/0.55)] dark:ring-white/10 sm:p-8",
        )}
      >
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-red-500/22 to-red-600/12 text-red-600 dark:from-red-500/25 dark:to-red-950/40 dark:text-red-400"
              aria-hidden
            >
              <AlertTriangle className="size-6" strokeWidth={2} />
            </div>
            <div className="min-w-0 space-y-2 pt-0.5">
              <h2
                id="delete-version-title"
                className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                Delete this version?
              </h2>
              <p className="text-[0.9375rem] leading-relaxed text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  “{versionName}”
                </span>{" "}
                will be removed from this browser. You cannot undo this.
              </p>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2.5 border-t border-zinc-200/70 pt-5 sm:flex-row sm:justify-end dark:border-zinc-800/90">
            <Button variant="secondary" size="lg" fullWidth onClick={onDismiss}>
              Cancel
            </Button>
            <Button variant="destructive" size="lg" fullWidth onClick={onConfirm}>
              Delete version
            </Button>
          </div>
        </div>
      </div>
    </ModalFadeShell>
  );
}

function Toolbar({
  activeId,
  versions,
  onSelectVersion,
  onNewVersion,
  onDuplicate,
  onDeleteRequest,
  onSave,
  onExportJson,
  onImportJsonClick,
  importRef,
  onImportFile,
  onLoadExample,
  tagline,
  getCv,
  getPdfBlob,
  getPdfBlobUrl,
  previewIframeRef,
  previewBusy,
}: {
  activeId: string;
  versions: { id: string; name: string; updatedAt: string }[];
  onSelectVersion: (id: string) => void;
  onNewVersion: () => void;
  onDuplicate: () => void;
  onDeleteRequest: () => void;
  onSave: () => void;
  onExportJson: () => void;
  onImportJsonClick: () => void;
  importRef: RefObject<HTMLInputElement | null>;
  onImportFile: (f: File) => void;
  onLoadExample: () => void;
  tagline: string;
  getCv: () => CVData;
  getPdfBlob: () => Blob | null;
  getPdfBlobUrl: () => string | null;
  previewIframeRef: RefObject<HTMLIFrameElement | null>;
  previewBusy: boolean;
}) {
  const { register } = useFormContext<CVData>();

  return (
    <div className="relative z-30 mb-6 flex flex-col rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_2px_32px_-8px_rgb(0_0_0_/0.08),0_0_0_1px_rgb(255_255_255_/0.8)_inset] backdrop-blur-md dark:border-zinc-700/60 dark:bg-zinc-900/55 dark:shadow-[0_2px_40px_-10px_rgb(0_0_0_/0.55),inset_0_1px_0_rgb(255_255_255_/0.04)] sm:p-6">
      <div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-x-6"
        role="group"
        aria-label="About this app"
      >
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="m-0 flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LogoMark />
            <LogoWordmark />
          </h1>
          <p className="m-0 min-w-0 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {tagline}
          </p>
        </div>
        <div
          className="flex shrink-0 self-start rounded-2xl border border-zinc-300/60 bg-zinc-100/80 p-2 shadow-[inset_0_1px_0_rgb(255_255_255_/0.9)] dark:border-zinc-700/80 dark:bg-zinc-800/40 dark:shadow-none"
          role="group"
          aria-label="Theme"
        >
          <ThemeSelect embedded />
        </div>
      </div>

      <div className="mt-5 border-t border-zinc-200/70 pt-5 dark:border-zinc-700/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-zinc-300/60 bg-zinc-100/80 p-2 shadow-[inset_0_1px_0_rgb(255_255_255_/0.9)] dark:border-zinc-700/80 dark:bg-zinc-800/50 dark:shadow-none"
            role="group"
            aria-label="CV version"
          >
            <label htmlFor="cv-version-select" className="sr-only">
              CV version
            </label>
            <select
              id="cv-version-select"
              className={cn(
                formSelectClass,
                "min-h-10 w-52 shrink-0 py-2 text-sm font-medium sm:text-base",
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
              className="flex min-w-0 shrink-0 items-center gap-2"
            >
              <span className="shrink-0 text-[0.6875rem] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
                Name
              </span>
              <input
                id="cv-version-name"
                {...register("meta.versionName")}
                type="text"
                autoComplete="off"
                placeholder="Untitled"
                className={cn(
                  formFieldClass,
                  "min-h-10 w-52 shrink-0 py-2 text-sm",
                )}
              />
            </label>
            <Button variant="soft-emerald" size="sm" onClick={onNewVersion} title="Create a new blank CV version" aria-label="Create a new blank CV version">
              <Plus className="size-4 shrink-0" aria-hidden />
              New
            </Button>
            <Button variant="soft-violet" size="sm" onClick={onDuplicate} title="Duplicate the current version" aria-label="Duplicate the current version">
              <Copy className="size-4 shrink-0" aria-hidden />
              Duplicate
            </Button>
            <Button variant="soft-red" size="sm" onClick={onDeleteRequest} title="Delete this version" aria-label="Delete this CV version. Opens a confirmation dialog.">
              <Trash2 className="size-4 shrink-0" aria-hidden />
              Delete
            </Button>
            <Button onClick={onSave} title="Save to this browser now (local storage)" aria-label="Save CV and skill library to local storage now">
              <Save className="size-4 shrink-0" aria-hidden />
              Save
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ExportButton
              getCv={getCv}
              getPdfBlob={getPdfBlob}
              getPdfBlobUrl={getPdfBlobUrl}
              previewBusy={previewBusy}
              compact
            />
            <ToolbarMoreMenu
              getCv={getCv}
              getPdfBlob={getPdfBlob}
              getPdfBlobUrl={getPdfBlobUrl}
              previewIframeRef={previewIframeRef}
              previewBusy={previewBusy}
              onExportJson={onExportJson}
              onImportJsonClick={onImportJsonClick}
              importRef={importRef}
              onImportFile={onImportFile}
              onLoadExample={onLoadExample}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
