"use client";

import {
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

/**
 * Fades/slides in when the block enters the viewport (once).
 * Respects prefers-reduced-motion and avoids a flash for blocks already on screen.
 */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      startTransition(() => setVisible(true));
      return;
    }
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.top < vh * 0.92 && r.bottom > vh * -0.08) {
      startTransition(() => setVisible(true));
    }
  }, []);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      startTransition(() => setVisible(true));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            startTransition(() => setVisible(true));
            io.disconnect();
            break;
          }
        }
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className={cn(
        visible
          ? "translate-y-0 opacity-100"
          : "motion-safe:translate-y-5 motion-safe:opacity-0",
        "motion-safe:transition-[opacity,transform] motion-safe:duration-520 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
