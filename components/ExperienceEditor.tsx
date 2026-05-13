"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import type { CVData, ExperienceItem } from "@/lib/cv-schema";
import { formFieldClass, formLabelClass } from "@/lib/form-styles";
import { cn } from "@/lib/cn";

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
      <div className="rounded-xl border border-dashed border-slate-200/90 bg-slate-50/80 px-6 py-12 text-center dark:border-slate-600 dark:bg-slate-900/50">
        <p className="text-base text-slate-600 dark:text-slate-400">No experience entries yet.</p>
        <button
          type="button"
          onClick={() => append(emptyExp())}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-base font-medium text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="size-4" aria-hidden />
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
          className="space-y-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-950/[0.03] dark:border-slate-700 dark:bg-slate-900 dark:ring-white/[0.04]"
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
                  <select className={formFieldClass}
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-base font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800"
      >
        <Plus className="size-4" aria-hidden />
        Add experience
      </button>
    </div>
  );
}

function BulletsEditor({ index }: { index: number }) {
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
          className="text-base font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          onClick={() => append("" as never)}
        >
          + Add bullet
        </button>
      </div>
    </fieldset>
  );
}
