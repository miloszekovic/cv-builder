"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { selectableCardClassName } from "@/components/ui/selectable-styles";

export function SelectableCard({
  selected,
  className,
  children,
  ...props
}: {
  selected: boolean;
  children: ReactNode;
} & ComponentPropsWithoutRef<"label">) {
  return (
    <label
      className={selectableCardClassName({ selected, className })}
      {...props}
    >
      {children}
    </label>
  );
}
