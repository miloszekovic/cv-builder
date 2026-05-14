"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import type { CVData, ExperienceItem } from "@/lib/cv-schema";
import { formFieldClass, formLabelClass, formLabelControlStack, formSelectClass } from "@/lib/form-styles";
import { motionInteractive, motionTextButton } from "@/lib/motion-styles";
import { cn } from "@/lib/cn";

const addExperienceButtonClass = cn(
  motionInteractive,
  "inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_12px_-2px_rgb(124_58_237_/0.45)] hover:bg-violet-500 dark:bg-violet-600 dark:hover:bg-violet-500",
);

const emptyExp = (): ExperienceItem => ({
  role: "",
  company: "",
  startYear: undefined,
  endYear: undefined,
  intro: "",
  bullets: [""],
  outro: "",
});

export function ExperienceEditor() {
  const { control, register } = useFormContext<CVData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "body.experience",
  });

  if (fields.length === 0) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => append(emptyExp())}
          className={addExperienceButtonClass}
        >
          <Plus className="size-4 shrink-0 opacity-90" aria-hidden />
          Add experience
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="motion-safe:transition-[box-shadow,transform] motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:-translate-y-px space-y-5 rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_2px_20px_-10px_rgb(0_0_0_/0.08)] ring-1 ring-zinc-950/4 motion-safe:hover:shadow-[0_12px_36px_-14px_rgb(0_0_0_/0.12)] dark:border-zinc-700/75 dark:bg-zinc-900/45 dark:ring-white/5 dark:motion-safe:hover:shadow-[0_12px_36px_-12px_rgb(0_0_0_/0.4)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={formLabelClass}>Role {index + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                aria-label="Move experience up"
              >
                <ChevronUp className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
                aria-label="Move experience down"
              >
                <ChevronDown className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                onClick={() => remove(index)}
                aria-label="Remove experience"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className={formLabelControlStack}>
              <span className={formLabelClass}>Role</span>
              <input className={formFieldClass} {...register(`body.experience.${index}.role`)} />
            </label>
            <label className={formLabelControlStack}>
              <span className={formLabelClass}>Company</span>
              <input className={formFieldClass} {...register(`body.experience.${index}.company`)} />
            </label>
            <label className={formLabelControlStack}>
              <span className={formLabelClass}>Start year</span>
              <input
                type="number"
                className={formFieldClass}
                {...register(`body.experience.${index}.startYear`, {
                  setValueAs: (v) =>
                    v === "" || v === undefined ? undefined : Number(v),
                })}
              />
            </label>
            <label className={formLabelControlStack}>
              <span className={formLabelClass}>End year</span>
              <Controller
                control={control}
                name={`body.experience.${index}.endYear`}
                render={({ field }) => (
                  <select className={formSelectClass}
                    value={
                      field.value === "present"
                        ? "present"
                        : field.value != null
                          ? String(field.value)
                          : ""
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") field.onChange(undefined);
                      else if (v === "present") field.onChange("present");
                      else field.onChange(Number(v));
                    }}
                  >
                    <option value="">—</option>
                    <option value="present">Present</option>
                    {Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i).map(
                      (y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ),
                    )}
                  </select>
                )}
              />
            </label>
          </div>
          <label className={formLabelControlStack}>
            <span className={formLabelClass}>Company / role intro</span>
            <textarea rows={2} className={formFieldClass} {...register(`body.experience.${index}.intro`)} />
          </label>
          <BulletsEditor index={index} />
          <label className={formLabelControlStack}>
            <span className={formLabelClass}>Outro (learned / growth)</span>
            <textarea rows={2} className={formFieldClass} {...register(`body.experience.${index}.outro`)} />
          </label>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append(emptyExp())}
        className={cn(
          addExperienceButtonClass,
          "w-full rounded-xl py-3 text-base",
        )}
      >
        <Plus className="size-4" aria-hidden />
        Add experience
      </button>
    </div>
  );
}

function BulletsEditor({ index }: { index: number }) {
  const addBulletClass = cn(
    motionTextButton,
    "text-[0.9375rem] font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300",
  );
  const { control, register } = useFormContext<CVData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `body.experience.${index}.bullets` as never,
  });

  return (
    <fieldset className="space-y-3">
      <legend className={formLabelClass}>Bullets</legend>
      <div className="space-y-2.5">
        {fields.map((f, bi) => (
          <div key={f.id} className="flex gap-2">
            <input
              className={cn(formFieldClass, "min-w-0 flex-1")}
              {...register(`body.experience.${index}.bullets.${bi}`)}
            />
            <button
              type="button"
              className="shrink-0 rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              onClick={() => remove(bi)}
              aria-label="Remove bullet"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        ))}
        <button
          type="button"
          className={addBulletClass}
          onClick={() => append("" as never)}
        >
          + Add bullet
        </button>
      </div>
    </fieldset>
  );
}
