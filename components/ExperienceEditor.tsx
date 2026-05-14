"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import type { CVData, ExperienceItem } from "@/lib/cv-schema";
import { formFieldClass, formLabelClass, formSelectClass } from "@/lib/form-styles";
import { motionInteractive, motionTextButton } from "@/lib/motion-styles";
import { cn } from "@/lib/cn";

const addExperienceButtonClass = cn(
  motionInteractive,
  "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500",
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
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          List jobs in reverse-chronological order. Each entry can include years, a short intro,
          bullet achievements, and an optional closing line.
        </p>
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
    <div className="space-y-5">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="motion-safe:transition-[box-shadow,transform] motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:-translate-y-px space-y-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-950/3 motion-safe:hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:ring-white/4 dark:motion-safe:hover:shadow-black/25"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={formLabelClass}>Role {index + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                aria-label="Move experience up"
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
                aria-label="Move experience down"
              >
                <ChevronDown className="size-4" />
              </button>
              <button
                type="button"
                className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                onClick={() => remove(index)}
                aria-label="Remove experience"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className={formLabelClass}>Role</span>
              <input className={formFieldClass} {...register(`body.experience.${index}.role`)} />
            </label>
            <label className="block space-y-1.5">
              <span className={formLabelClass}>Company</span>
              <input className={formFieldClass} {...register(`body.experience.${index}.company`)} />
            </label>
            <label className="block space-y-1.5">
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
            <label className="block space-y-1.5">
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
          <label className="block space-y-1.5">
            <span className={formLabelClass}>Company / role intro</span>
            <textarea rows={2} className={formFieldClass} {...register(`body.experience.${index}.intro`)} />
          </label>
          <BulletsEditor index={index} />
          <label className="block space-y-1.5">
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
    "text-base font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
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
              className="shrink-0 rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              onClick={() => remove(bi)}
              aria-label="Remove bullet"
            >
              <Trash2 className="size-4" />
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
