import React from "react";
import { Eye, Heart, Star, type LucideIcon } from "lucide-react";

type StatIconName = "Eye" | "Heart" | "Star";

interface StatBadgeProps {
  icon: StatIconName;
  value: number | string;
  label?: string;
  variant?: "default" | "compact";
}

const iconMap: Record<StatIconName, LucideIcon> = {
  Eye,
  Heart,
  Star,
};

export function StatBadge({
  icon,
  value,
  label,
  variant = "default",
}: StatBadgeProps) {
  const IconComponent = iconMap[icon];
  const formattedValue =
    typeof value === "number" && value >= 10000
      ? `${(value / 10000).toFixed(1)}万`
      : String(value);

  if (variant === "compact") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
        <IconComponent size={14} className="text-gray-400" />
        <span>{formattedValue}</span>
        {label && <span className="text-gray-400">{label}</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
      <IconComponent size={16} className="text-gray-400" />
      <span className="font-medium">{formattedValue}</span>
      {label && <span className="text-gray-400">{label}</span>}
    </span>
  );
}
