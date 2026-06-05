"use client";

import React from "react";
import { Tag } from "@/components/atoms/Tag";
import { Label } from "@/components/atoms/Typography";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroupProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  multiSelect?: boolean;
  variant?: "chip" | "dropdown";
}

export function FilterGroup({
  label,
  options,
  selectedValues,
  onChange,
  multiSelect = true,
  variant = "chip",
}: FilterGroupProps) {
  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      // 取消选中
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      // 选中
      if (multiSelect) {
        onChange([...selectedValues, value]);
      } else {
        onChange([value]);
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider text-gray-400">
        {label}
      </Label>

      {variant === "chip" ? (
        <div className="flex flex-wrap gap-1.5">
          {options.map((opt) => (
            <Tag
              key={opt.value}
              label={
                opt.count !== undefined
                  ? `${opt.label} (${opt.count})`
                  : opt.label
              }
              active={selectedValues.includes(opt.value)}
              onClick={() => handleToggle(opt.value)}
              size="sm"
            />
          ))}
        </div>
      ) : (
        /* dropdown variant 使用 select 样式 */
        <select
          multiple={multiSelect}
          value={multiSelect ? selectedValues : selectedValues[0] ?? ""}
          onChange={(e) => {
            if (multiSelect) {
              const values = Array.from(
                e.target.selectedOptions,
                (opt) => opt.value
              );
              onChange(values);
            } else {
              onChange([e.target.value]);
            }
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="" disabled>
            请选择
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
              {opt.count !== undefined ? ` (${opt.count})` : ""}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
