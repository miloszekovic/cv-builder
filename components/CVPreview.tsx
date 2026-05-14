"use client";

import type { CVData } from "@/lib/cv-schema";
import { CVPrint } from "@/components/print/CVPrint";
import { getCvAccent } from "@/lib/cv-accents";
import { cn } from "@/lib/cn";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

/** A4 height in CSS px at 96dpi (browser `mm` resolution for layout). */
const PREVIEW_A4_PAGE_HEIGHT_PX = (96 / 25.4) * 297;

/** Matches `scale-[…]` breakpoints below (Tailwind default breakpoints). */
function previewScaleForViewport(): number {
  if (typeof window === "undefined") return 0.68;
  if (window.matchMedia("(min-width: 1024px)").matches) return 0.9;
  if (window.matchMedia("(min-width: 768px)").matches) return 0.85;
  if (window.matchMedia("(min-width: 640px)").matches) return 0.78;
  return 0.68;
}

export function CVPreview({ cv, className }: { cv: CVData; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const printBodyRef = useRef<HTMLDivElement>(null);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0, printH: 0 });
  const [scale, setScale] = useState(0.68);

  useLayoutEffect(() => {
    const updateScale = () => setScale(previewScaleForViewport());
    updateScale();
    const mqs = [
      window.matchMedia("(min-width: 640px)"),
      window.matchMedia("(min-width: 768px)"),
      window.matchMedia("(min-width: 1024px)"),
    ];
    mqs.forEach((mq) => mq.addEventListener("change", updateScale));
    return () => mqs.forEach((mq) => mq.removeEventListener("change", updateScale));
  }, []);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const body = printBodyRef.current;
    if (!card) return;
    const measure = () => {
      setContentSize({
        width: card.offsetWidth,
        height: card.offsetHeight,
        printH: body?.offsetHeight ?? 0,
      });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(card);
    if (body) ro.observe(body);
    measure();
    return () => ro.disconnect();
  }, [cv]);

  const { width: cw, height: ch, printH } = contentSize;
  const accentHex = getCvAccent(cv.meta.accent).accent;
  const approxPages = useMemo(
    () =>
      printH > 0 ? Math.max(1, Math.ceil(printH / PREVIEW_A4_PAGE_HEIGHT_PX)) : 1,
    [printH],
  );
  const overlapY = ch > 0 ? ch * (1 - scale) : 0;
  const overlapX = cw > 0 ? cw * (1 - scale) : 0;
  const marginBottomPx = overlapY > 0 ? -Math.round(overlapY * 100) / 100 : 0;
  /** `origin-top` is top center — split horizontal layout slack evenly. */
  const marginInlinePx =
    overlapX > 0 ? -Math.round((overlapX / 2) * 100) / 100 : 0;

  return (
    <div
      className={cn(
        "min-h-0 overflow-auto rounded-2xl border border-slate-200/90 bg-linear-to-b from-slate-200/70 to-slate-100/90 p-4 shadow-inner motion-safe:transition-shadow motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:shadow-lg dark:border-slate-700/90 dark:from-slate-900 dark:to-slate-950 sm:p-6",
        className,
      )}
    >
      <div className="mx-auto flex max-w-full justify-center">
        <div
          className="origin-top scale-[0.68] sm:scale-[0.78] md:scale-[0.85] lg:scale-[0.9]"
          style={{
            width: "210mm",
            marginBottom: marginBottomPx !== 0 ? `${marginBottomPx}px` : undefined,
            marginLeft: marginInlinePx !== 0 ? `${marginInlinePx}px` : undefined,
            marginRight: marginInlinePx !== 0 ? `${marginInlinePx}px` : undefined,
          }}
        >
          <div
            ref={cardRef}
            className="overflow-clip rounded-md border border-slate-300/90 bg-white text-slate-900 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/4 motion-safe:transition-[box-shadow,transform] motion-safe:duration-500 motion-safe:ease-out dark:border-slate-600 dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] dark:ring-white/6"
            style={{ colorScheme: "light" }}
          >
            <div ref={printBodyRef}>
              <CVPrint cv={cv} />
            </div>
            <footer
              className="bg-white px-[12mm] pt-2 pb-2.5 text-right text-[8px] italic leading-tight text-slate-400"
              style={{
                borderTop: "2px solid",
                borderTopColor: accentHex,
              }}
              title="Approximate page count from preview height; PDF export uses exact print layout."
            >
              Page 1 / {approxPages}
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
