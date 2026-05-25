"use client";

import { Preview } from "@/components/builder/preview/Preview";
import { Button } from "@/components/ui/Button";
import { ModalFadeShell } from "@/components/ui/ModalFadeShell";
import { ModalScrim } from "@/components/ui/ModalScrim";
import { X } from "lucide-react";

export function PreviewModal({
  open,
  onDismiss,
  blobUrl,
  busy,
  err,
}: {
  open: boolean;
  onDismiss: () => void;
  blobUrl: string | null;
  busy: boolean;
  err: string | null;
}) {
  return (
    <ModalFadeShell open={open}>
      <ModalScrim onDismiss={onDismiss} label="Close preview" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
        className="absolute inset-0 z-10 flex min-h-0 flex-col bg-zinc-100 dark:bg-zinc-950"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-200/80 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90 sm:px-5">
          <div className="min-w-0">
            <h2
              id="preview-modal-title"
              className="m-0 truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Live preview
            </h2>
            <p className="m-0 text-xs text-zinc-500 dark:text-zinc-400">
              Updates as you edit
            </p>
          </div>
          <Button
            variant="secondary"
            size="icon-lg"
            onClick={onDismiss}
            aria-label="Close"
            className="text-zinc-700 dark:text-zinc-200"
          >
            <X className="size-5" aria-hidden />
          </Button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
          <Preview
            blobUrl={blobUrl}
            busy={busy}
            err={err}
            embedded
            fillHeight
            className="min-h-0 flex-1"
          />
        </div>
      </div>
    </ModalFadeShell>
  );
}
