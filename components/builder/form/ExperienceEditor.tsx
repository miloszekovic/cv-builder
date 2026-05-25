"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import type { CVData, ExperienceItem } from "@/lib/cv-schema";
import { EXPERIENCE_MONTH_OPTIONS } from "@/lib/experience-dates";
import {
  formFieldSoftClass,
  formFieldsStackClass,
  formLabelClass,
  formLabelControlStack,
  formNestedGroupClass,
  formNestedGroupHeaderClass,
  formNestedGroupTitleClass,
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

export function ExperienceEditor() {
  const { control, register, setValue } = useFormContext<CVData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "body.experience",
  });

  if (fields.length === 0) {
    return (
      <div className="space-y-4">
        <Button variant="primary" onClick={() => append(emptyExp())}>
          <Plus className="size-4 shrink-0 opacity-90" aria-hidden />
          Add experience
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {fields.map((field, index) => (
        <div key={field.id} className={formNestedGroupClass}>
          <div className={formNestedGroupHeaderClass}>
            <span className={formNestedGroupTitleClass}>Role {index + 1}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="icon"
                size="icon"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                aria-label="Move experience up"
              >
                <ChevronUp className="size-4" aria-hidden />
              </Button>
              <Button
                variant="icon"
                size="icon"
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
                aria-label="Move experience down"
              >
                <ChevronDown className="size-4" aria-hidden />
              </Button>
              <Button
                variant="icon-danger"
                size="icon"
                onClick={() => remove(index)}
                aria-label="Remove experience"
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
          <div className={formFieldsStackClass}>
          <label className={formLabelControlStack}>
            <span className={formLabelClass}>Role</span>
            <input className={formFieldSoftClass} {...register(`body.experience.${index}.role`)} />
          </label>
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
        </div>
      ))}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="text-base"
        onClick={() => append(emptyExp())}
      >
        <Plus className="size-4" aria-hidden />
        Add experience
      </Button>
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
      <div className="space-y-3">
        {fields.map((f, bi) => (
          <div key={f.id} className="flex gap-2">
            <input
              className={cn(formFieldSoftClass, "min-w-0 flex-1")}
              {...register(`body.experience.${index}.bullets.${bi}`)}
            />
            <Button
              variant="icon-danger"
              size="icon"
              onClick={() => remove(bi)}
              aria-label="Remove bullet"
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        ))}
        <Button variant="text" onClick={() => append("" as never)}>
          + Add bullet
        </Button>
      </div>
    </fieldset>
  );
}
