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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { AccordionGroup, AccordionItem } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import type { CVData, ExperienceItem } from "@/lib/cv-schema";
import { EXPERIENCE_MONTH_OPTIONS } from "@/lib/experience-dates";
import {
  formFieldSoftClass,
  formFieldsStackClass,
  formLabelClass,
  formLabelControlStack,
  formSelectSoftClass,
} from "@/lib/form-styles";
import { cn } from "@/lib/cn";

const emptyExp = (): ExperienceItem => ({
  role: "",
  company: "",
  country: "",
  startMonth: undefined,
  startYear: undefined,
  endMonth: undefined,
  endYear: undefined,
  intro: "",
  bullets: [""],
  outro: "",
});

function experienceTitle(index: number, company?: string) {
  const label = company?.trim();
  return label ? `Role ${index + 1} - ${label}` : `Role ${index + 1}`;
}

export function ExperienceEditor() {
  const { control } = useFormContext<CVData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "body.experience",
  });
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const [expandLastId, setExpandLastId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleAdd = () => {
    append(emptyExp());
    setExpandLastId("__pending__");
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    move(oldIndex, newIndex);
  };

  if (fields.length === 0) {
    return (
      <div className="space-y-4">
        <Button variant="primary" onClick={handleAdd}>
          <Plus className="size-4 shrink-0 opacity-90" aria-hidden />
          Add experience
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <AccordionGroup className="space-y-4">
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {fields.map((field, index) => {
              const isLast = index === fields.length - 1;
              const pendingExpand = expandLastId === "__pending__" && isLast;
              const open =
                openIds.has(field.id) ||
                expandLastId === field.id ||
                pendingExpand;

              return (
                <SortableExperienceItem
                  key={field.id}
                  id={field.id}
                  index={index}
                  open={open}
                  onOpenChange={(nextOpen) => {
                    if (expandLastId === field.id || pendingExpand) {
                      setExpandLastId(null);
                    }
                    setOpenIds((prev) => {
                      const next = new Set(prev);
                      if (nextOpen) next.add(field.id);
                      else next.delete(field.id);
                      return next;
                    });
                  }}
                  onRemove={() => remove(index)}
                />
              );
            })}
          </SortableContext>
        </AccordionGroup>
      </DndContext>
      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="text-base"
        onClick={handleAdd}
      >
        <Plus className="size-4" aria-hidden />
        Add experience
      </Button>
    </div>
  );
}

function SortableExperienceItem({
  id,
  index,
  open,
  onOpenChange,
  onRemove,
}: {
  id: string;
  index: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: () => void;
}) {
  const { control, register, setValue } = useFormContext<CVData>();
  const company = useWatch({ control, name: `body.experience.${index}.company` });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

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
      <AccordionItem
        id={id}
        variant="experience"
        title={experienceTitle(index, company)}
        open={open}
        onOpenChange={onOpenChange}
        leadingActions={
          <button
            type="button"
            className="flex size-9 cursor-grab items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-200/80 hover:text-zinc-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-500/70 active:cursor-grabbing dark:text-zinc-400 dark:hover:bg-zinc-700/80 dark:hover:text-zinc-200"
            aria-label={`Drag to reorder role ${index + 1}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" aria-hidden />
          </button>
        }
        trailingActions={
          <Button
            variant="icon-danger"
            size="icon"
            onClick={onRemove}
            aria-label={`Remove role ${index + 1}`}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        }
      >
        <div className={formFieldsStackClass}>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className={formLabelControlStack}>
              <span className={formLabelClass}>Company</span>
              <input className={formFieldSoftClass} {...register(`body.experience.${index}.company`)} />
            </label>
            <label className={formLabelControlStack}>
              <span className={formLabelClass}>Country</span>
              <input
                className={formFieldSoftClass}
                placeholder="e.g. Sweden"
                {...register(`body.experience.${index}.country`)}
              />
            </label>
          </div>
          <label className={formLabelControlStack}>
            <span className={formLabelClass}>Role</span>
            <input className={formFieldSoftClass} {...register(`body.experience.${index}.role`)} />
          </label>
          <div className="grid gap-6 sm:grid-cols-2">
            <fieldset className="space-y-2 sm:col-span-1">
              <legend className={formLabelClass}>Start</legend>
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  control={control}
                  name={`body.experience.${index}.startMonth`}
                  render={({ field }) => (
                    <select
                      className={formSelectSoftClass}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? undefined : Number(v));
                      }}
                    >
                      <option value="">Month</option>
                      {EXPERIENCE_MONTH_OPTIONS.map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  )}
                />
                <input
                  type="number"
                  className={formFieldSoftClass}
                  placeholder="Year"
                  {...register(`body.experience.${index}.startYear`, {
                    setValueAs: (v) =>
                      v === "" || v === undefined ? undefined : Number(v),
                  })}
                />
              </div>
            </fieldset>
            <fieldset className="space-y-2 sm:col-span-1">
              <legend className={formLabelClass}>End</legend>
              <Controller
                control={control}
                name={`body.experience.${index}.endYear`}
                render={({ field: endYearField }) => {
                  const isPresent = endYearField.value === "present";
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <Controller
                          control={control}
                          name={`body.experience.${index}.endMonth`}
                          render={({ field: monthField }) => (
                            <select
                              className={formSelectSoftClass}
                              disabled={isPresent}
                              value={isPresent ? "" : (monthField.value ?? "")}
                              onChange={(e) => {
                                const v = e.target.value;
                                monthField.onChange(v === "" ? undefined : Number(v));
                              }}
                            >
                              <option value="">Month</option>
                              {EXPERIENCE_MONTH_OPTIONS.map(({ value, label }) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        <input
                          type="number"
                          className={formFieldSoftClass}
                          placeholder="Year"
                          disabled={isPresent}
                          value={
                            isPresent || endYearField.value == null
                              ? ""
                              : endYearField.value
                          }
                          onChange={(e) => {
                            const v = e.target.value;
                            endYearField.onChange(
                              v === "" ? undefined : Number(v),
                            );
                          }}
                        />
                      </div>
                      <label className="flex cursor-pointer items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-600"
                          checked={isPresent}
                          onChange={(e) => {
                            if (e.target.checked) {
                              endYearField.onChange("present");
                              setValue(
                                `body.experience.${index}.endMonth`,
                                undefined,
                              );
                            } else {
                              endYearField.onChange(undefined);
                            }
                          }}
                        />
                        <span className={formLabelClass}>Present</span>
                      </label>
                    </>
                  );
                }}
              />
            </fieldset>
          </div>
          <label className={formLabelControlStack}>
            <span className={formLabelClass}>Company / role intro</span>
            <textarea rows={2} className={formFieldSoftClass} {...register(`body.experience.${index}.intro`)} />
          </label>
          <BulletsEditor index={index} />
          <label className={formLabelControlStack}>
            <span className={formLabelClass}>Outro (learned / growth)</span>
            <textarea rows={2} className={formFieldSoftClass} {...register(`body.experience.${index}.outro`)} />
          </label>
        </div>
      </AccordionItem>
    </div>
  );
}

function BulletsEditor({ index }: { index: number }) {
  const { control } = useFormContext<CVData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `body.experience.${index}.bullets` as never,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    move(oldIndex, newIndex);
  };

  return (
    <fieldset className="space-y-3">
      <legend className={formLabelClass}>Bullets</legend>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {fields.map((f, bi) => (
              <SortableBulletRow
                key={f.id}
                id={f.id}
                bulletIndex={bi}
                experienceIndex={index}
                onRemove={() => remove(bi)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button variant="text" onClick={() => append("" as never)}>
        + Add bullet
      </Button>
    </fieldset>
  );
}

function SortableBulletRow({
  id,
  bulletIndex,
  experienceIndex,
  onRemove,
}: {
  id: string;
  bulletIndex: number;
  experienceIndex: number;
  onRemove: () => void;
}) {
  const { register } = useFormContext<CVData>();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("flex items-center gap-2", isDragging && "relative z-10 opacity-90")}
    >
      <button
        type="button"
        className="flex size-9 shrink-0 cursor-grab items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-200/80 hover:text-zinc-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-500/70 active:cursor-grabbing dark:text-zinc-400 dark:hover:bg-zinc-700/80 dark:hover:text-zinc-200"
        aria-label={`Drag to reorder bullet ${bulletIndex + 1}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <input
        className={cn(formFieldSoftClass, "min-w-0 flex-1")}
        {...register(`body.experience.${experienceIndex}.bullets.${bulletIndex}`)}
      />
      <Button
        variant="icon-danger"
        size="icon"
        onClick={onRemove}
        aria-label={`Remove bullet ${bulletIndex + 1}`}
      >
        <Trash2 className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
