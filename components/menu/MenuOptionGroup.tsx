"use client";

import type { MenuOptionGroup as MenuOptionGroupType } from "@/lib/gokwon-menu";
import { formatUsd } from "@/lib/gokwon-menu";

type MenuOptionGroupProps = {
  group: MenuOptionGroupType;
  value: string | string[];
  onChange: (groupId: string, value: string | string[]) => void;
};

export default function MenuOptionGroup({
  group,
  value,
  onChange,
}: MenuOptionGroupProps) {
  function handleRadioChange(optionId: string) {
    onChange(group.id, optionId);
  }

  function handleCheckboxChange(optionId: string, checked: boolean) {
    const current = Array.isArray(value) ? value : [];
    const next = checked
      ? [...current, optionId]
      : current.filter((entry) => entry !== optionId);
    onChange(group.id, next);
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-black text-slate-900">{group.label}</legend>
      <div className="space-y-2">
        {group.options.map((option) => {
          const inputId = `${group.id}-${option.id}`;

          if (group.type === "radio") {
            const checked = value === option.id;

            return (
              <label
                key={option.id}
                htmlFor={inputId}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition ${
                  checked
                    ? "border-red-500 bg-red-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={group.id}
                  checked={checked}
                  onChange={() => handleRadioChange(option.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-red-600"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-900">
                    {option.label}
                  </span>
                  {option.description ? (
                    <span className="mt-0.5 block text-xs font-medium text-slate-500">
                      {option.description}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          }

          const selected = Array.isArray(value) ? value : [];
          const checked = selected.includes(option.id);

          return (
            <label
              key={option.id}
              htmlFor={inputId}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition ${
                checked
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                id={inputId}
                type="checkbox"
                checked={checked}
                onChange={(event) =>
                  handleCheckboxChange(option.id, event.target.checked)
                }
                className="mt-1 h-4 w-4 shrink-0 rounded accent-red-600"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-slate-900">
                  {option.label}
                </span>
                {option.price ? (
                  <span className="mt-0.5 block text-xs font-black text-red-600">
                    +{formatUsd(option.price)}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
