"use client";

import { useCallback, useState } from "react";
import {
  readEditorAccordionPref,
  writeEditorAccordionPref,
  type EditorAccordionPrefKey,
} from "@/lib/editor-accordion-prefs";

export function useEditorAccordionPref(key: EditorAccordionPrefKey, defaultOpen = false) {
  const [open, setOpen] = useState(() => readEditorAccordionPref(key, defaultOpen));

  const onOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      writeEditorAccordionPref(key, next);
    },
    [key],
  );

  return { open, onOpenChange };
}
