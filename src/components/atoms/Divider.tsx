import React from "react";

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  label?: string;
  className?: string;
}

export function Divider({
  orientation = "horizontal",
  label,
  className = "",
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        className={`w-px bg-gray-200 self-stretch ${className}`}
        role="separator"
        aria-hidden={!label}
        aria-label={label || undefined}
      />
    );
  }

  if (label) {
    return (
      <div className={`flex items-center gap-4 ${className}`} role="separator">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-500 shrink-0">{label}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    );
  }

  return (
    <hr
      className={`border-0 h-px bg-gray-200 ${className}`}
      role="separator"
    />
  );
}
