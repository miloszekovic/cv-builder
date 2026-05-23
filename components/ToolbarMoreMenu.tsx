"use client";

import {
  BookOpen,
  ChevronDown,
  FileJson,
  Loader2,
  MoreHorizontal,
  Printer,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { CVData } from "@/lib/cv-schema";
import { printCvFromPreview } from "@/lib/print-cv-from-preview";
import { cn } from "@/lib/cn";
import { motionInteractive } from "@/lib/motion-styles";

const MENU_WIDTH = 208;

export function ToolbarMoreMenu({
  getCv,
  getPdfBlob,
  getPdfBlobUrl,
  previewIframeRef,
  previewBusy,
  onExportJson,
  onImportJsonClick,
  importRef,
  onImportFile,
  onLoadExample,
}: {
  getCv: () => CVData;
  getPdfBlob: () => Blob | null;
  getPdfBlobUrl: () => string | null;
  previewIframeRef: RefObject<HTMLIFrameElement | null>;
  previewBusy: boolean;
  onExportJson: () => void;
  onImportJsonClick: () => void;
  importRef: RefObject<HTMLInputElement | null>;
  onImportFile: (f: File) => void;
  onLoadExample: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [printBusy, setPrintBusy] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updateMenuPos = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8,
      left: Math.max(8, rect.right - MENU_WIDTH),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updateMenuPos();
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if ((t as Element).closest?.("[data-toolbar-more-menu]")) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", updateMenuPos);
    window.addEventListener("scroll", updateMenuPos, true);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", updateMenuPos);
      window.removeEventListener("scroll", updateMenuPos, true);
    };
  }, [open, updateMenuPos]);

  const itemClass = cn(
    motionInteractive,
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-100/90 disabled:opacity-60 dark:text-zinc-100 dark:hover:bg-zinc-800/80",
  );

  async function handlePrint() {
    setPrintBusy(true);
    try {
      await printCvFromPreview({
        getCv,
        getPdfBlob,
        getPdfBlobUrl,
        previewIframeRef,
        previewBusy,
      });
      setOpen(false);
    } catch {
      // Browser print dialog or fetch errors — no inline toolbar slot for print errors.
    } finally {
      setPrintBusy(false);
    }
  }

  const menu =
    open && menuPos && typeof document !== "undefined"
      ? createPortal(
          <div
            data-toolbar-more-menu
            role="menu"
            style={{ top: menuPos.top, left: menuPos.left, width: MENU_WIDTH }}
            className="fixed z-50 rounded-2xl border border-zinc-200/90 bg-white p-1.5 shadow-[0_16px_48px_-12px_rgb(0_0_0_/0.18)] ring-1 ring-zinc-950/5 dark:border-zinc-600 dark:bg-zinc-900 dark:ring-white/10"
          >
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              disabled={printBusy || previewBusy}
              onClick={() => void handlePrint()}
            >
              {printBusy ? (
                <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              ) : (
                <Printer className="size-4 shrink-0 text-zinc-600 dark:text-zinc-300" aria-hidden />
              )}
              Print
            </button>
            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" role="separator" />
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => {
                onExportJson();
                setOpen(false);
              }}
            >
              <FileJson className="size-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
              Export JSON
            </button>
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => {
                onImportJsonClick();
                setOpen(false);
              }}
            >
              <Upload className="size-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
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
            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" role="separator" />
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => {
                onLoadExample();
                setOpen(false);
              }}
            >
              <BookOpen className="size-4 shrink-0 text-orange-600 dark:text-orange-400" aria-hidden />
              Load demo CV
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          motionInteractive,
          "inline-flex items-center gap-2 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-800 shadow-[0_1px_2px_rgb(0_0_0_/0.04)] hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:bg-zinc-700/80",
          open && "ring-2 ring-violet-500/40",
        )}
      >
        <MoreHorizontal className="size-4 shrink-0" aria-hidden />
        More
        <ChevronDown
          className={cn("size-3.5 shrink-0 opacity-60 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {menu}
    </div>
  );
}
