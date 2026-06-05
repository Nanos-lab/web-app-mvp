import React, { Suspense } from "react";
import { icons, type LucideIcon } from "lucide-react";

// 项目中使用的图标名称
export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  "aria-label"?: string;
}

/**
 * 基于 lucide-react 的图标组件。
 * 使用动态导入以支持 tree-shaking。
 */
export function Icon({
  name,
  size = 20,
  className = "",
  "aria-label": ariaLabel,
}: IconProps) {
  const LucideIconComponent = icons[name] as LucideIcon | undefined;

  if (!LucideIconComponent) {
    return null;
  }

  return (
    <LucideIconComponent
      size={size}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    />
  );
}
