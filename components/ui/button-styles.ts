import { cn } from "@/lib/cn";
import { motionInteractive, motionTextButton } from "@/lib/motion-styles";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "soft-violet"
  | "soft-emerald"
  | "soft-red"
  | "destructive"
  | "ghost"
  | "text"
  | "icon"
  | "icon-danger"
  | "menu-item"
  | "nav"
  | "tab"
  | "segment"
  | "tag"
  | "tag-remove";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-lg";
export type ButtonTabContext = "workspace" | "standalone";
export type ButtonSegmentTone = "dark" | "light";

const focusRing =
  "focus-visible:ring-2 focus-visible:ring-violet-500/55 focus-visible:ring-offset-0";

const base = cn(
  motionInteractive,
  "inline-flex items-center justify-center gap-2 rounded-xl outline-hidden",
  focusRing,
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
);

const variants: Record<Exclude<ButtonVariant, "tab" | "segment" | "tag">, string> = {
  primary: cn(
    "bg-violet-600 font-semibold text-white shadow-[0_2px_12px_-2px_rgb(124_58_237_/0.45)]",
    "hover:bg-violet-500 motion-safe:active:scale-[0.99]",
    "dark:bg-violet-600 dark:hover:bg-violet-500",
  ),
  secondary: cn(
    "border border-zinc-300/80 bg-white font-semibold text-zinc-800",
    "shadow-[0_1px_2px_rgb(0_0_0_/0.05)] hover:bg-zinc-50 hover:border-zinc-400/70",
    "dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:bg-zinc-700/90",
  ),
  outline: cn(
    "border border-zinc-300/80 bg-white font-medium text-zinc-800",
    "shadow-[0_1px_2px_rgb(0_0_0_/0.05)] hover:bg-zinc-50 hover:border-zinc-400/70",
    "dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-100 dark:hover:bg-zinc-700/80",
  ),
  "soft-violet": cn(
    "border border-violet-300/70 bg-violet-50 font-medium text-violet-900",
    "shadow-[0_1px_2px_rgb(124_58_237_/0.1)] hover:border-violet-400/70 hover:bg-violet-100",
    "dark:border-violet-800/50 dark:bg-violet-950/40 dark:text-violet-100 dark:shadow-[0_1px_2px_rgb(0_0_0_/0.04)] dark:hover:bg-violet-950/55",
  ),
  "soft-emerald": cn(
    "border border-emerald-300/70 bg-emerald-50 font-medium text-emerald-900",
    "shadow-[0_1px_2px_rgb(16_185_129_/0.1)] hover:border-emerald-400/70 hover:bg-emerald-100",
    "dark:border-emerald-900/45 dark:bg-emerald-950/35 dark:text-emerald-100 dark:shadow-[0_1px_2px_rgb(0_0_0_/0.04)] dark:hover:bg-emerald-950/55",
  ),
  "soft-red": cn(
    "border border-red-300/70 bg-red-50 font-medium text-red-800",
    "shadow-[0_1px_2px_rgb(239_68_68_/0.1)] hover:border-red-400/70 hover:bg-red-100",
    "dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-200 dark:shadow-[0_1px_2px_rgb(0_0_0_/0.04)] dark:hover:bg-red-950/50",
  ),
  destructive: cn(
    "bg-red-600 font-semibold text-white shadow-[0_4px_14px_-3px_rgb(220_38_38_/0.45)]",
    "hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500",
  ),
  ghost: cn(
    "rounded-lg border border-zinc-300/80 bg-white font-medium text-zinc-700",
    "shadow-[0_1px_2px_rgb(0_0_0_/0.04)] hover:bg-zinc-50",
    "dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:shadow-none dark:hover:bg-zinc-800",
  ),
  text: cn(
    motionTextButton,
    "rounded-none bg-transparent px-0 py-0 text-[0.9375rem] font-medium text-violet-600",
    "hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300",
  ),
  icon: cn(
    "rounded-lg bg-transparent font-normal text-zinc-600",
    "hover:bg-white hover:text-zinc-900 shadow-sm hover:shadow-[0_1px_2px_rgb(0_0_0_/0.06)]",
    "disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100 dark:shadow-none",
  ),
  "icon-danger": cn(
    "shrink-0 rounded-lg bg-transparent font-normal text-red-600",
    "hover:bg-red-50 hover:text-red-700",
    "dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-400",
  ),
  "menu-item": cn(
    "w-full justify-start rounded-lg bg-transparent font-medium text-zinc-800",
    "hover:bg-zinc-100/90 dark:text-zinc-100 dark:hover:bg-zinc-800/80",
  ),
  nav: cn(
    "z-10 size-9 shrink-0 rounded-full border border-zinc-300/80 bg-white p-0 text-zinc-700 shadow-md backdrop-blur-sm",
    "hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900/95 dark:text-zinc-200 dark:hover:bg-zinc-800",
  ),
  "tag-remove": cn(
    "rounded-lg bg-transparent px-2.5 py-1.5 text-sm font-normal text-zinc-500",
    "hover:bg-red-50 hover:text-red-700",
    "dark:text-zinc-400 dark:hover:bg-red-950/40 dark:hover:text-red-300",
  ),
};

const tabBase = cn(
  motionInteractive,
  "flex w-full min-h-11 flex-col items-center justify-center gap-px rounded-xl border-0 px-2 py-2 text-center shadow-none",
  "outline-hidden focus-visible:outline-hidden",
  focusRing,
  "sm:min-h-13 sm:px-4 sm:py-2.5",
);

function tabVariant(selected: boolean, tabContext: ButtonTabContext) {
  if (selected) {
    return cn(
      tabBase,
      "bg-violet-600 text-white shadow-[0_2px_12px_-2px_rgb(124_58_237_/0.4)] hover:bg-violet-500",
      "dark:bg-violet-600 dark:hover:bg-violet-500",
    );
  }
  if (tabContext === "workspace") {
    return cn(
      tabBase,
      "bg-white text-zinc-900 ring-1 ring-zinc-300/80 shadow-[0_1px_2px_rgb(0_0_0_/0.04)] hover:bg-zinc-50",
      "dark:bg-zinc-800/70 dark:text-zinc-50 dark:ring-zinc-600/70 dark:shadow-none dark:hover:bg-zinc-800",
    );
  }
  return cn(
    tabBase,
    "bg-zinc-100 text-zinc-900 ring-1 ring-zinc-300/60 hover:bg-zinc-200/80",
    "dark:bg-zinc-800/50 dark:text-zinc-50 dark:ring-zinc-700/60 dark:hover:bg-zinc-700/65",
  );
}

function segmentVariant(tone: ButtonSegmentTone, selected: boolean) {
  const segmentBase = cn(motionInteractive, "rounded-xl p-2.5 outline-hidden", focusRing);
  if (tone === "dark") {
    return cn(
      segmentBase,
      selected
        ? "bg-violet-600 text-white shadow-[0_2px_8px_-2px_rgb(0_0_0_/0.25)] dark:bg-violet-500"
        : "text-violet-800 hover:bg-violet-100 hover:ring-1 hover:ring-violet-200/70 dark:text-violet-200 dark:hover:bg-violet-950/50 dark:hover:ring-violet-800/40",
    );
  }
  return cn(
    segmentBase,
    selected
      ? "bg-amber-500 text-white shadow-sm dark:bg-amber-500"
      : "text-amber-800 hover:bg-amber-100 hover:ring-1 hover:ring-amber-200/70 dark:text-amber-100 dark:hover:bg-amber-950/50 dark:hover:ring-amber-800/40",
  );
}

function tagVariant(selected: boolean) {
  return cn(
    motionInteractive,
    focusRing,
    "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium",
    selected
      ? "border border-violet-400/80 bg-violet-100 text-violet-900 shadow-[0_1px_2px_rgb(124_58_237_/0.12)] dark:border-violet-700/80 dark:bg-violet-950/50 dark:text-violet-100 dark:shadow-none"
      : "border border-zinc-300/90 bg-white text-zinc-700 shadow-[0_1px_2px_rgb(0_0_0_/0.04)] hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300 dark:shadow-none dark:hover:border-zinc-500",
  );
}

const sizes: Record<ButtonSize, string> = {
  xs: "gap-1 px-2 py-1 text-[0.6875rem]",
  sm: "px-3.5 py-2.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-[0.9375rem]",
  icon: "p-2",
  "icon-lg": "size-10 shrink-0 p-0",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  selected = false,
  tabContext = "workspace",
  segmentTone = "dark",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  selected?: boolean;
  tabContext?: ButtonTabContext;
  segmentTone?: ButtonSegmentTone;
  className?: string;
}) {
  if (variant === "tab") {
    return cn(tabVariant(selected, tabContext), className);
  }
  if (variant === "segment") {
    return cn(segmentVariant(segmentTone, selected), className);
  }
  if (variant === "tag") {
    return cn(tagVariant(selected), className);
  }

  const isText = variant === "text";
  const isIcon = variant === "icon" || variant === "icon-danger";
  const isMenu = variant === "menu-item";
  const isNav = variant === "nav";
  const isTagRemove = variant === "tag-remove";

  let resolvedSize = sizes[size];
  if (isText || isNav || isTagRemove) resolvedSize = "";
  else if (isIcon) resolvedSize = size === "icon-lg" ? sizes["icon-lg"] : sizes.icon;
  else if (isMenu) resolvedSize = "gap-2.5 px-3 py-2.5 text-left text-sm";

  return cn(
    base,
    variants[variant as Exclude<ButtonVariant, "tab" | "segment" | "tag">],
    resolvedSize,
    fullWidth && "w-full sm:w-auto",
    className,
  );
}
