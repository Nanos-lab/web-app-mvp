"use client";

import React, { useId } from "react";
import { X } from "lucide-react";

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "search" | "email";
  icon?: React.ReactNode;
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  "aria-label"?: string;
}

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  clearable = false,
  disabled = false,
  error,
  className = "",
  "aria-label": ariaLabel,
}: InputProps) {
  const id = useId();

  return (
    <div className={`relative ${className}`}>
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>
      )}

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel || placeholder}
        aria-invalid={!!error}
        className={`
          w-full rounded-lg border bg-white py-2 text-sm
          transition-colors duration-150
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
          ${icon ? "pl-10" : "pl-3"}
          ${clearable && value ? "pr-10" : "pr-3"}
          ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}
        `}
      />

      {clearable && value && !disabled && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-target"
          aria-label="清除输入"
        >
          <X size={16} />
        </button>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
