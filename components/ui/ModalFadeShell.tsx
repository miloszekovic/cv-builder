"use client";

import { cn } from "@/lib/cn";
import { useEffect, useState, type ReactNode, type TransitionEvent } from "react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Fade in/out; parent toggles `open` — shell stays mounted until opacity exit ends. */
export function ModalFadeShell({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      if (prefersReducedMotion()) {
        setVisible(true);
        return;
      }
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }

    if (prefersReducedMotion()) {
      setVisible(false);
      setMounted(false);
      return;
    }
    setVisible(false);
  }, [open]);

  const onTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== "opacity" || e.target !== e.currentTarget) return;
    if (!open) setMounted(false);
  };

  if (!mounted) return null;

  return (
    <div
      role="presentation"
      onTransitionEnd={onTransitionEnd}
      className={cn(
        "fixed inset-0 z-200 flex items-end justify-center p-4 sm:items-center sm:p-6",
        "ease-out motion-safe:transition-opacity motion-safe:duration-200 motion-reduce:transition-none",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      {children}
    </div>
  );
}
