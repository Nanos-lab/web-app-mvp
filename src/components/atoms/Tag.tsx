"use client";

import React from "react";
import Link from "next/link";

interface TagProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
  size?: "sm" | "md";
  className?: string;
}

export function Tag({
  label,
  active = false,
  onClick,
  href,
  size = "md",
  className = "",
}: TagProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  const activeClasses = active
    ? "bg-primary-600 text-white border-primary-600"
    : "bg-white text-gray-600 border-gray-300 hover:border-primary-400 hover:text-primary-600";

  const tagContent = (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        transition-colors duration-150 cursor-pointer touch-target
        ${sizeClasses}
        ${activeClasses}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {label}
    </span>
  );

  if (href) {
    return <Link href={href}>{tagContent}</Link>;
  }

  return tagContent;
}
