import React from "react";
import { Star } from "lucide-react";

interface RatingStarProps {
  rating: number; // 0-5, 支持小数
  count?: number;
  size?: "sm" | "md";
  showCount?: boolean;
}

export function RatingStar({
  rating,
  count,
  size = "md",
  showCount = true,
}: RatingStarProps) {
  const iconSize = size === "sm" ? 14 : 18;
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const filledWidth = Math.min(100, Math.max(0, (rating / 5) * 100));

  return (
    <div className="inline-flex items-center gap-1" title={`评分 ${rating.toFixed(1)} 分`}>
      {/* 5 颗星 — 使用 CSS 渐变实现半星效果 */}
      <div
        className="relative flex items-center"
        style={{ width: iconSize * 5 }}
        aria-label={`${rating.toFixed(1)} / 5 星`}
      >
        {/* 空心星背景 */}
        <div className="flex text-gray-200">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={iconSize} fill="currentColor" />
          ))}
        </div>
        {/* 实心星覆盖（clip 裁剪出部分） */}
        <div
          className="absolute inset-0 flex text-amber-400 overflow-hidden"
          style={{ width: `${filledWidth}%` }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={iconSize} fill="currentColor" />
          ))}
        </div>
      </div>

      {/* 评分数字 + 人数 */}
      {showCount && (
        <span className={`${textSize} text-gray-500`}>
          {rating.toFixed(1)}
          {count !== undefined && count > 0 && (
            <span className="text-gray-400"> ({count})</span>
          )}
        </span>
      )}
    </div>
  );
}
