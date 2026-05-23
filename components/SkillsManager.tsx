"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { CVData, SkillCategoryId, SkillLibrary } from "@/lib/cv-schema";
import { SKILL_CATEGORY_LABELS } from "@/lib/cv-schema";
import {
  formFieldSoftClass,
  formFieldsStackClass,
  formLabelClass,
  formNestedGroupClass,
  formNestedGroupTitleClass,
  formSkillsPrimaryButtonClass,
  formSkillsRemoveButtonClass,
  formSkillsTagOffClass,
  formSkillsTagOnClass,
} from "@/lib/form-styles";
import { motionInteractive } from "@/lib/motion-styles";
import { cn } from "@/lib/cn";

const CATEGORY_ORDER: SkillCategoryId[] = [
  "frontEnd",
  "uiUx",
  "tools",
  "aiAutomation",
  "principles",
  "cms",
  "os",
];

export function SkillsManager({
  skillLibrary,
  onSkillLibraryChange,
}: {
  skillLibrary: SkillLibrary;
  onSkillLibraryChange: (next: SkillLibrary) => void;
}) {
  const { watch, setValue } = useFormContext<CVData>();
  const skills = watch("sidebar.skills") ?? [];
  const byId = new Map<SkillCategoryId, (typeof skills)[0]>();
  for (const s of skills) {
    byId.set(s.categoryId, s);
  }

  return (
    <div className="space-y-4">
      {CATEGORY_ORDER.map((categoryId) => (
        <CategoryBlock
          key={categoryId}
          label={skillLibrary[categoryId]?.label ?? SKILL_CATEGORY_LABELS[categoryId]}
          libraryTags={skillLibrary[categoryId]?.tags ?? []}
          visibleTags={byId.get(categoryId)?.visibleTags ?? []}
          onLibraryTagsChange={(tags) => {
            onSkillLibraryChange({
              ...skillLibrary,
              [categoryId]: {
                ...skillLibrary[categoryId],
                label: skillLibrary[categoryId]?.label ?? SKILL_CATEGORY_LABELS[categoryId],
                tags,
              },
            });
            const vis = byId.get(categoryId)?.visibleTags ?? [];
            const filtered = vis.filter((t) => tags.includes(t));
            const idx = skills.findIndex((s) => s.categoryId === categoryId);
            if (idx >= 0) {
              setValue(`sidebar.skills.${idx}.visibleTags`, filtered, {
                shouldDirty: true,
              });
            }
          }}
          onToggleVisible={(tag, on) => {
            const idx = skills.findIndex((s) => s.categoryId === categoryId);
            const current = byId.get(categoryId)?.visibleTags ?? [];
            let next: string[];
            if (on) next = [...new Set([...current, tag])];
            else next = current.filter((t) => t !== tag);
            if (idx >= 0) {
              setValue(`sidebar.skills.${idx}.visibleTags`, next, { shouldDirty: true });
            } else {
              setValue(
                "sidebar.skills",
                [...skills, { categoryId, visibleTags: next }],
                { shouldDirty: true },
              );
            }
          }}
          onAddLibraryTag={(tag) => {
            const t = tag.trim();
            if (!t) return;
            const tags = skillLibrary[categoryId]?.tags ?? [];
            if (tags.includes(t)) return;
            onSkillLibraryChange({
              ...skillLibrary,
              [categoryId]: {
                ...skillLibrary[categoryId],
                label: skillLibrary[categoryId]?.label ?? SKILL_CATEGORY_LABELS[categoryId],
                tags: [...tags, t],
              },
            });
          }}
        />
      ))}
    </div>
  );
}

function CategoryBlock({
  label,
  libraryTags,
  visibleTags,
  onLibraryTagsChange,
  onToggleVisible,
  onAddLibraryTag,
}: {
  label: string;
  libraryTags: string[];
  visibleTags: string[];
  onLibraryTagsChange: (tags: string[]) => void;
  onToggleVisible: (tag: string, on: boolean) => void;
  onAddLibraryTag: (tag: string) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <section className={cn(formNestedGroupClass, formFieldsStackClass)}>
      <h3 className={formNestedGroupTitleClass}>{label}</h3>
      <div className="flex flex-wrap gap-2.5">
        {libraryTags.length === 0 && (
          <p className="text-[0.9375rem] text-zinc-500 dark:text-zinc-400">No tags.</p>
        )}
        {libraryTags.map((tag) => {
          const on = visibleTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleVisible(tag, !on)}
              className={cn(motionInteractive, on ? formSkillsTagOnClass : formSkillsTagOffClass)}
              aria-pressed={on}
              aria-label={
                on ? `${tag}, visible on CV. Click to hide from CV.` : `${tag}, hidden on CV. Click to show on CV.`
              }
            >
              {tag}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add tag to library"
          aria-label="New skill tag name"
          className={cn(formFieldSoftClass, "min-w-44 flex-1")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddLibraryTag(draft);
              setDraft("");
            }
          }}
        />
        <button
          type="button"
          className={cn(motionInteractive, formSkillsPrimaryButtonClass)}
          onClick={() => {
            onAddLibraryTag(draft);
            setDraft("");
          }}
          aria-label="Add tag to library"
        >
          <Plus className="size-3.5" aria-hidden />
          Add
        </button>
      </div>
      <p className={formLabelClass}>Remove from library</p>
      <div className="flex flex-wrap gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        {libraryTags.map((tag) => (
          <button
            key={`rm-${tag}`}
            type="button"
            className={cn(motionInteractive, formSkillsRemoveButtonClass)}
            onClick={() =>
              onLibraryTagsChange(libraryTags.filter((t) => t !== tag))
            }
            aria-label={`Remove ${tag} from skill library`}
            title="Remove from library"
          >
            <X className="size-3" aria-hidden />
            {tag}
          </button>
        ))}
      </div>
    </section>
  );
}
