"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
}: SelectProps<T>) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`
          w-full appearance-none rounded-lg border border-gray-300 bg-white
          py-2 pl-3 pr-9 text-sm
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
