"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormRegister } from "react-hook-form";
import type { CVData } from "@/lib/cv-schema";
import type { CvTemplateId } from "@/lib/cv-templates";
import { CV_TEMPLATE_IDS, CV_TEMPLATES } from "@/lib/cv-templates";
import { Button } from "@/components/ui/Button";
import { SelectableCard } from "@/components/ui/SelectableCard";
import { cn } from "@/lib/cn";

const CARD_WIDTH = 148;
const SCROLL_STEP = CARD_WIDTH + 12;

export function TemplatePicker({
  register,
  currentId,
}: {
  register: UseFormRegister<CVData>;
  currentId: CvTemplateId;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(`[data-template-id="${currentId}"]`);
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [currentId]);

  const scrollBy = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: "smooth" });
  };

  const navBtnPosition = (side: "left" | "right") =>
    cn(
      "absolute top-1/2 -translate-y-1/2",
      side === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
    );

  return (
    <div className="relative">
      {canScrollLeft ? (
        <Button
          variant="nav"
          className={navBtnPosition("left")}
          aria-label="Scroll templates left"
          onClick={() => scrollBy(-1)}
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Button>
      ) : null}
      {canScrollRight ? (
        <Button
          variant="nav"
          className={navBtnPosition("right")}
          aria-label="Scroll templates right"
          onClick={() => scrollBy(1)}
        >
          <ChevronRight className="size-5" aria-hidden />
        </Button>
      ) : null}

      <div
        ref={scrollRef}
        className={cn(
          "flex gap-3 overflow-x-auto scroll-smooth px-0.5 py-1",
          "snap-x snap-mandatory",
          "[scrollbar-width:thin]",
          "[&::-webkit-scrollbar]:h-1.5",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600",
        )}
        role="radiogroup"
        aria-label="CV template"
      >
        {CV_TEMPLATE_IDS.map((id) => {
          const selected = currentId === id;
          const opt = CV_TEMPLATES[id];
          return (
            <SelectableCard
              key={id}
              selected={selected}
              data-template-id={id}
              style={{ width: CARD_WIDTH }}
              className="shrink-0 snap-start gap-2.5 rounded-2xl p-3"
            >
              <input type="radio" value={id} className="sr-only" {...register("meta.template")} />
              <TemplatePreview id={id} selected={selected} hue={opt.previewHue} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {opt.label}
                </span>
                <span className="mt-0.5 block text-[0.6875rem] leading-snug text-zinc-500 dark:text-zinc-400">
                  {opt.tagline}
                </span>
              </span>
            </SelectableCard>
          );
        })}
      </div>
    </div>
  );
}

function TemplatePreview({
  id,
  selected,
  hue,
}: {
  id: CvTemplateId;
  selected: boolean;
  hue: string;
}) {
  const accent = selected ? hue : "#a1a1aa";
  const paper = "relative overflow-hidden rounded-lg border border-zinc-200/90 bg-white dark:border-zinc-600 dark:bg-zinc-950";

  if (id === "modern") {
    return (
      <div className={cn(paper, "flex h-18 gap-1 p-2")} aria-hidden>
        <div className="w-[32%] space-y-1">
          <div className="h-1 w-full rounded-sm" style={{ backgroundColor: accent }} />
          <div className="h-2.5 w-full rounded-sm border-l-[3px] pl-0.5" style={{ borderColor: accent }} />
        </div>
        <div className="min-w-0 flex-1 space-y-1 pt-0.5">
          <div className="h-1.5 w-3/4 rounded-sm bg-zinc-800 dark:bg-zinc-200" />
          <div className="h-0.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  if (id === "minimal") {
    return (
      <div className={cn(paper, "h-18 p-3")} aria-hidden>
        <div className="space-y-2 pt-1">
          <div className="h-0.5 w-1/3 rounded-full bg-zinc-400" />
          <div className="h-0.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-0.5 w-5/6 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-0.5 w-2/3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  if (id === "executive") {
    return (
      <div className={cn(paper, "flex h-18 gap-1 p-1.5")} aria-hidden>
        <div
          className="w-[38%] space-y-1 rounded-md p-1.5"
          style={{ backgroundColor: accent }}
        >
          <div className="h-0.5 w-full rounded-full bg-white/70" />
          <div className="h-0.5 w-4/5 rounded-full bg-white/40" />
        </div>
        <div className="min-w-0 flex-1 space-y-1 pt-1">
          <div className="h-1 w-full rounded-sm bg-zinc-900 dark:bg-zinc-100" />
          <div className="h-0.5 w-full border-t border-zinc-800 dark:border-zinc-300" />
          <div className="h-0.5 w-5/6 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  if (id === "studio") {
    return (
      <div className={cn(paper, "flex h-18 gap-0 p-0")} aria-hidden>
        <div className="min-w-0 flex-1 space-y-1 p-2">
          <div className="h-1.5 w-2/3 border-b-2" style={{ borderColor: accent }} />
          <div className="h-0.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div
          className="w-[40%] rounded-l-none rounded-r-lg p-1.5"
          style={{ backgroundColor: accent }}
        >
          <div className="h-0.5 w-full rounded-full bg-white/80" />
          <div className="mt-1 h-0.5 w-4/5 rounded-full bg-white/50" />
        </div>
      </div>
    );
  }

  if (id === "mono") {
    return (
      <div className={cn(paper, "h-18 p-2.5")} aria-hidden>
        <div className="space-y-1.5">
          <div className="h-1 w-2/3 rounded-sm bg-zinc-900 dark:bg-zinc-100" />
          <div className="h-px w-full bg-zinc-300 dark:bg-zinc-600" />
          <div className="h-0.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-0.5 w-4/5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-px w-full bg-zinc-300 dark:bg-zinc-600" />
          <div className="h-0.5 w-3/4 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  if (id === "nordic") {
    return (
      <div className={cn(paper, "h-18 bg-zinc-50 p-3 dark:bg-zinc-900")} aria-hidden>
        <div className="mx-auto w-4/5 space-y-2 pt-0.5 text-center">
          <div className="mx-auto h-0.5 w-1/2 rounded-full bg-zinc-400" />
          <div className="mx-auto h-0.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex gap-2 pt-0.5">
            <div className="h-0.5 w-1/3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <div className="h-0.5 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(paper, "flex h-18 gap-1.5 p-2")} aria-hidden>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="h-1 w-2/3 rounded-sm" style={{ backgroundColor: accent }} />
        <div className="h-0.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-px w-full bg-zinc-300 dark:bg-zinc-600" />
      </div>
      <div className="w-[30%] border-l border-zinc-200 pl-1 dark:border-zinc-700">
        <div className="h-0.5 w-full rounded-full bg-zinc-300 dark:bg-zinc-600" />
      </div>
    </div>
  );
}
