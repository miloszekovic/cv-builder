"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import {
  buttonClassName,
  type ButtonSegmentTone,
  type ButtonSize,
  type ButtonTabContext,
  type ButtonVariant,
} from "@/components/ui/button-styles";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Selected state for tab, segment, and tag variants. */
  selected?: boolean;
  /** Surface style for unselected tab buttons. */
  tabContext?: ButtonTabContext;
  /** Tone for segment variant (theme toggle). */
  segmentTone?: ButtonSegmentTone;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    fullWidth = false,
    selected = false,
    tabContext = "workspace",
    segmentTone = "dark",
    className,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClassName({
        variant,
        size,
        fullWidth,
        selected,
        tabContext,
        segmentTone,
        className,
      })}
      {...props}
    />
  );
});
