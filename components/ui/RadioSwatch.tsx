"use client";

import type { InputHTMLAttributes } from "react";
import {
  radioSwatchClassName,
  radioSwatchDotClassName,
} from "@/components/ui/selectable-styles";

type RadioSwatchProps = {
  selected: boolean;
  dotSize?: "sm" | "md";
  color: string;
  title: string;
  value: string;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size" | "value">;

export function RadioSwatch({
  selected,
  dotSize = "sm",
  color,
  title,
  value,
  className,
  ...inputProps
}: RadioSwatchProps) {
  return (
    <label
      className={radioSwatchClassName({ selected, className })}
      title={title}
      aria-label={title}
    >
      <input type="radio" className="sr-only" value={value} {...inputProps} />
      <span
        aria-hidden
        className={radioSwatchDotClassName({ size: dotSize })}
        style={{ backgroundColor: color }}
      />
    </label>
  );
}
