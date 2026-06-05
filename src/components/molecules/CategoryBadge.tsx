import React from "react";
import Link from "next/link";
import type { Category } from "@/types/api";

interface CategoryBadgeProps {
  category: Category;
  href?: string;
  size?: "sm" | "md" | "lg";
  variant?: "card" | "hero";
  className?: string;
}

const sizeClasses = {
  sm: "px-3 py-2 gap-2",
  md: "px-4 py-3 gap-3",
  lg: "px-6 py-5 gap-4",
};

const iconSizes = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-4xl",
};

export function CategoryBadge({
  category,
  href,
  size = "md",
  variant = "card",
  className = "",
}: CategoryBadgeProps) {
  const { name, icon, description, destination_count: count } = category;

  const content = (
    <div
      className={`
        flex items-center ${sizeClasses[size]}
        rounded-xl transition-all duration-200
        ${href ? "cursor-pointer hover:shadow-md hover:scale-[1.02]" : ""}
        ${variant === "card"
          ? "bg-white border border-gray-200 hover:border-primary-300"
          : "bg-gradient-to-br from-primary-50 to-accent-50 hover:from-primary-100 hover:to-accent-100"
        }
        ${className}
      `}
    >
      {/* 图标 */}
      <span className={`${iconSizes[size]} shrink-0`} aria-hidden="true">
        {icon}
      </span>

      {/* 文字 */}
      <div className="min-w-0">
        <h4
          className={`font-semibold text-gray-900 ${
            size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base"
          }`}
        >
          {name}
        </h4>
        {variant !== "card" && description && (
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
            {description}
          </p>
        )}
        {count > 0 && (
          <span className="text-xs text-gray-400 mt-0.5 block">
            {count} 个目的地
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
