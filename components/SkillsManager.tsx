"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { CVData, SkillCategoryId, SkillLibrary } from "@/lib/cv-schema";
import { SKILL_CATEGORY_LABELS } from "@/lib/cv-schema";
import { formFieldClass, formLabelClass } from "@/lib/form-styles";
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
    <div className="space-y-10">
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
    <section className="motion-safe:transition-shadow motion-safe:duration-300 space-y-5 rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_2px_20px_-10px_rgb(0_0_0_/0.06)] ring-1 ring-zinc-950/4 motion-safe:hover:shadow-[0_8px_28px_-12px_rgb(0_0_0_/0.1)] dark:border-zinc-700/75 dark:bg-zinc-900/45 dark:ring-white/5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{label}</h3>
      </div>
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
              className={cn(
                motionInteractive,
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium",
                on
                  ? "border-violet-300/90 bg-violet-50 text-violet-900 dark:border-violet-700/80 dark:bg-violet-950/50 dark:text-violet-100"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:border-zinc-500",
              )}
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
      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-5 dark:border-zinc-700/80">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add tag to library"
          aria-label="New skill tag name"
          className={cn(formFieldClass, "min-w-44 flex-1")}
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
          className={cn(
            motionInteractive,
            "inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-violet-600 dark:hover:bg-violet-500",
          )}
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
            className={cn(
              motionInteractive,
              "inline-flex items-center gap-1 rounded-lg border border-zinc-200/90 px-2.5 py-1.5 text-sm hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-zinc-600 dark:hover:border-red-800 dark:hover:bg-red-950/40 dark:hover:text-red-300",
            )}
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
