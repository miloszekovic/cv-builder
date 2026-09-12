"use client";

import { ChevronDown } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Reveal } from "@/components/ui/Reveal";
import { editorSectionClass, editorSectionTitleClass } from "@/lib/form-styles";
import { cn } from "@/lib/cn";

type AccordionGroupContextValue = {
  registerHeader: (id: string, button: HTMLButtonElement | null) => void;
  onHeaderKeyDown: (id: string, event: KeyboardEvent<HTMLButtonElement>) => void;
};

const AccordionGroupContext = createContext<AccordionGroupContextValue | null>(null);

export function AccordionGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const headersRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  const registerHeader = useCallback((id: string, button: HTMLButtonElement | null) => {
    if (button) headersRef.current.set(id, button);
    else headersRef.current.delete(id);
  }, []);

  const onHeaderKeyDown = useCallback((id: string, event: KeyboardEvent<HTMLButtonElement>) => {
    const keys = [...headersRef.current.keys()];
    const index = keys.indexOf(id);
    if (index === -1) return;

    let nextIndex: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (index + 1) % keys.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (index - 1 + keys.length) % keys.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = keys.length - 1;
    }

    if (nextIndex == null) return;
    event.preventDefault();
    const nextId = keys[nextIndex];
    headersRef.current.get(nextId)?.focus();
  }, []);

  return (
    <AccordionGroupContext.Provider value={{ registerHeader, onHeaderKeyDown }}>
      <div className={className}>{children}</div>
    </AccordionGroupContext.Provider>
  );
}

export function AccordionSection({
  title,
  description,
  headingId,
  defaultOpen = false,
  open,
  onOpenChange,
  children,
  className,
}: {
  title: string;
  description?: string;
  headingId?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Reveal>
      <section className={cn(editorSectionClass, className)}>
        <AccordionItem
          title={title}
          description={description}
          headingId={headingId}
          defaultOpen={defaultOpen}
          open={open}
          onOpenChange={onOpenChange}
          variant="section"
        >
          {children}
        </AccordionItem>
      </section>
    </Reveal>
  );
}

export function AccordionItem({
  id: idProp,
  title,
  description,
  headingId,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  variant = "nested",
  leadingActions,
  trailingActions,
  children,
  className,
}: {
  id?: string;
  title: ReactNode;
  description?: string;
  headingId?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "section" | "nested" | "experience";
  leadingActions?: ReactNode;
  trailingActions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const autoId = useId();
  const itemId = idProp ?? autoId;
  const headerId = headingId ?? `${itemId}-header`;
  const panelId = `${itemId}-panel`;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const group = useContext(AccordionGroupContext);

  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (openProp === undefined) setUncontrolledOpen(next);
  };

  const headerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      group?.registerHeader(itemId, node);
    },
    [group, itemId],
  );

  const isSection = variant === "section";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border transition-[border-color,background-color,box-shadow] duration-200 ease-out motion-reduce:transition-none",
        variant === "nested" &&
          (open
            ? "border-violet-300/75 bg-white shadow-[0_1px_4px_rgb(139_92_246_/0.1)] dark:border-violet-700/50 dark:bg-zinc-900/75 dark:shadow-[0_1px_3px_rgb(0_0_0_/0.2)]"
            : "border-zinc-200/70 bg-zinc-50/80 dark:border-zinc-700/50 dark:bg-zinc-800/35"),
        variant === "experience" &&
          (open
            ? "border-violet-300/75 bg-zinc-50 shadow-[0_1px_4px_rgb(139_92_246_/0.1),inset_0_1px_0_rgb(255_255_255_/0.9)] dark:border-violet-700/50 dark:bg-zinc-800/60 dark:shadow-[0_1px_3px_rgb(0_0_0_/0.25)]"
            : "border-zinc-200/70 bg-zinc-50 shadow-[inset_0_1px_0_rgb(255_255_255_/0.9)] dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:shadow-none"),
        variant === "section" && "border-0 bg-transparent shadow-none",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-stretch gap-0",
          open &&
            !isSection &&
            "border-b border-violet-200/70 dark:border-violet-800/40",
        )}
      >
        {leadingActions ? (
          <div className="flex shrink-0 items-center self-center pl-2 sm:pl-3">{leadingActions}</div>
        ) : null}
        <button
          ref={headerRef}
          type="button"
          id={headerId}
          className={cn(
            "flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 py-3 text-left",
            "transition-colors duration-200 ease-out motion-reduce:transition-none",
            "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-500/70 focus-visible:ring-inset dark:focus-visible:ring-violet-400/70",
            isSection
              ? cn(
                  "rounded-lg px-1 -mx-1",
                  open
                    ? "bg-violet-50/70 dark:bg-violet-950/25"
                    : "hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60",
                )
              : cn(
                  "px-3.5 sm:px-4",
                  open
                    ? "bg-violet-50/50 dark:bg-violet-950/20"
                    : "hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60",
                ),
            variant === "experience" && "py-3.5",
          )}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          onKeyDown={(event) => group?.onHeaderKeyDown(itemId, event)}
        >
          <span className="min-w-0 flex-1">
            {isSection ? (
              <span
                className={cn(
                  editorSectionTitleClass,
                  "border-0 pb-0",
                  open && "text-violet-900 dark:text-violet-50",
                )}
              >
                {title}
              </span>
            ) : (
              <span
                className={cn(
                  "block truncate text-sm font-semibold tracking-tight",
                  open
                    ? "text-violet-900 dark:text-violet-100"
                    : "text-zinc-800 dark:text-zinc-200",
                )}
              >
                {title}
              </span>
            )}
            {description ? (
              <span className="mt-1 block text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {description}
              </span>
            ) : null}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-[transform,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              open
                ? "rotate-180 text-violet-600 dark:text-violet-400"
                : "text-zinc-500 dark:text-zinc-400",
            )}
            aria-hidden
          />
        </button>
        {trailingActions ? (
          <div className="flex shrink-0 items-center self-center pr-2 sm:pr-3">{trailingActions}</div>
        ) : null}
      </div>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className={cn(
            "grid grid-rows-[1fr] motion-safe:animate-[accordion-panel-in_300ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none",
          )}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                isSection && "pt-5",
                variant === "nested" && "px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5",
                variant === "experience" && "px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5",
              )}
            >
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
