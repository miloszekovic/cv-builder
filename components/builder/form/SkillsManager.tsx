"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { CVData, SkillCategoryId, SkillLibrary } from "@/lib/cv-schema";
import {
  SKILL_CATEGORY_LABELS,
  normalizeSkillSelections,
  orderedSkillCategoryIds,
} from "@/lib/cv-schema";
import {
  formFieldSoftClass,
  formFieldsStackClass,
  formLabelClass,
  formNestedGroupClass,
  formNestedGroupTitleClass,
} from "@/lib/form-styles";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function SkillsManager({
  skillLibrary,
  onSkillLibraryChange,
}: {
  skillLibrary: SkillLibrary;
  onSkillLibraryChange: (next: SkillLibrary) => void;
}) {
  const { watch, setValue } = useFormContext<CVData>();
  const skillsRaw = watch("sidebar.skills");
  const skills = useMemo(() => skillsRaw ?? [], [skillsRaw]);
  const categoryOrder = useMemo(() => orderedSkillCategoryIds(skills), [skills]);
  const byId = useMemo(() => {
    const map = new Map<SkillCategoryId, (typeof skills)[0]>();
    for (const s of skills) {
      map.set(s.categoryId, s);
    }
    return map;
  }, [skills]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categoryOrder.indexOf(active.id as SkillCategoryId);
    const newIndex = categoryOrder.indexOf(over.id as SkillCategoryId);
    if (oldIndex === -1 || newIndex === -1) return;

    const nextOrder = [...categoryOrder];
    const [moved] = nextOrder.splice(oldIndex, 1);
    nextOrder.splice(newIndex, 0, moved);

    const reordered = nextOrder.map(
      (categoryId) =>
        byId.get(categoryId) ?? {
          categoryId,
          visibleTags: [],
        },
    );
    setValue("sidebar.skills", normalizeSkillSelections(reordered), {
      shouldDirty: true,
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={categoryOrder} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {categoryOrder.map((categoryId) => (
            <SortableCategoryBlock
              key={categoryId}
              categoryId={categoryId}
              label={SKILL_CATEGORY_LABELS[categoryId]}
              libraryTags={skillLibrary[categoryId]?.tags ?? []}
              visibleTags={byId.get(categoryId)?.visibleTags ?? []}
              onLibraryTagsChange={(tags) => {
                onSkillLibraryChange({
                  ...skillLibrary,
                  [categoryId]: {
                    ...skillLibrary[categoryId],
                    label: SKILL_CATEGORY_LABELS[categoryId],
                    tags,
                  },
                });
                const vis = byId.get(categoryId)?.visibleTags ?? [];
                const filtered = tags.filter((t) => vis.includes(t));
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
                    normalizeSkillSelections([
                      ...skills,
                      { categoryId, visibleTags: next },
                    ]),
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
                    label: SKILL_CATEGORY_LABELS[categoryId],
                    tags: [...tags, t],
                  },
                });
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableCategoryBlock({
  categoryId,
  label,
  libraryTags,
  visibleTags,
  onLibraryTagsChange,
  onToggleVisible,
  onAddLibraryTag,
}: {
  categoryId: SkillCategoryId;
  label: string;
  libraryTags: string[];
  visibleTags: string[];
  onLibraryTagsChange: (tags: string[]) => void;
  onToggleVisible: (tag: string, on: boolean) => void;
  onAddLibraryTag: (tag: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: categoryId,
  });
  const [draft, setDraft] = useState("");

  const tagSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onTagDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = libraryTags.indexOf(String(active.id));
    const newIndex = libraryTags.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const next = [...libraryTags];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onLibraryTagsChange(next);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "relative z-10 opacity-90")}
    >
      <section className={cn(formNestedGroupClass, formFieldsStackClass)}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex size-9 shrink-0 cursor-grab items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-200/80 hover:text-zinc-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-500/70 active:cursor-grabbing dark:text-zinc-400 dark:hover:bg-zinc-700/80 dark:hover:text-zinc-200"
            aria-label={`Drag to reorder ${label}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" aria-hidden />
          </button>
          <h3 className={cn(formNestedGroupTitleClass, "min-w-0 flex-1")}>{label}</h3>
        </div>
        {libraryTags.length === 0 ? (
          <p className="text-[0.9375rem] text-zinc-500 dark:text-zinc-400">No tags.</p>
        ) : (
          <DndContext
            sensors={tagSensors}
            collisionDetection={closestCenter}
            onDragEnd={onTagDragEnd}
          >
            <SortableContext items={libraryTags} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap gap-2.5">
                {libraryTags.map((tag) => (
                  <SortableSkillTag
                    key={tag}
                    tag={tag}
                    selected={visibleTags.includes(tag)}
                    onToggleVisible={onToggleVisible}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
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
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onAddLibraryTag(draft);
              setDraft("");
            }}
            aria-label="Add tag to library"
          >
            <Plus className="size-3.5" aria-hidden />
            Add
          </Button>
        </div>
        <p className={formLabelClass}>Remove from library</p>
        <div className="flex flex-wrap gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          {libraryTags.map((tag) => (
            <Button
              key={`rm-${tag}`}
              variant="tag-remove"
              onClick={() => onLibraryTagsChange(libraryTags.filter((t) => t !== tag))}
              aria-label={`Remove ${tag} from skill library`}
              title="Remove from library"
            >
              <X className="size-3" aria-hidden />
              {tag}
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}

function SortableSkillTag({
  tag,
  selected,
  onToggleVisible,
}: {
  tag: string;
  selected: boolean;
  onToggleVisible: (tag: string, on: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "inline-flex max-w-full items-center gap-0.5",
        isDragging && "relative z-10 opacity-90",
      )}
    >
      <button
        type="button"
        className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-200/80 hover:text-zinc-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-500/70 active:cursor-grabbing dark:text-zinc-500 dark:hover:bg-zinc-700/80 dark:hover:text-zinc-300"
        aria-label={`Drag to reorder ${tag}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" aria-hidden />
      </button>
      <Button
        variant="tag"
        selected={selected}
        onClick={() => onToggleVisible(tag, !selected)}
        aria-pressed={selected}
        aria-label={
          selected
            ? `${tag}, visible on CV. Click to hide from CV.`
            : `${tag}, hidden on CV. Click to show on CV.`
        }
      >
        {tag}
      </Button>
    </div>
  );
}
