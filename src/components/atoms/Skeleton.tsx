import React from "react";

type SkeletonVariant = "text" | "circular" | "rectangular" | "card";

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: "h-4 rounded",
  circular: "rounded-full",
  rectangular: "rounded-lg",
  card: "rounded-xl",
};

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width !== undefined) style.width = typeof width === "number" ? `${width}px` : width;
  if (height !== undefined) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`
        animate-pulse bg-gray-200
        ${variantClasses[variant]}
        ${className}
      `}
      style={style}
      aria-hidden="true"
    />
  );
}
