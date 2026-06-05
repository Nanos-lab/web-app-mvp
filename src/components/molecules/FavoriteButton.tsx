"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "@/providers/FavoritesProvider";
import { useToast } from "@/providers/ToastProvider";
import { useDeviceId } from "@/providers/DeviceProvider";

interface FavoriteButtonProps {
  destinationSlug: string;
  isFavorited?: boolean;
  favoriteCount?: number;
  onToggle?: () => void;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

const sizeMap: Record<string, { icon: number; text: string }> = {
  sm: { icon: 18, text: "text-xs" },
  md: { icon: 22, text: "text-sm" },
  lg: { icon: 26, text: "text-base" },
};

const formatCount = (n: number): string => {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

export function FavoriteButton({
  destinationSlug,
  isFavorited: isFavProp,
  favoriteCount,
  onToggle,
  size = "md",
  showCount = true,
}: FavoriteButtonProps) {
  const { isFavorited: contextIsFav, toggleFavorite } = useFavorites();
  const { deviceId } = useDeviceId();
  const { showToast } = useToast();

  // 优先使用外部 props（如详情页 server 初始值），回退到 context
  const isFav = isFavProp !== undefined ? isFavProp : contextIsFav(destinationSlug);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!deviceId) {
      showToast("收藏功能使用设备标识，无需登录", "info");
      return;
    }

    if (onToggle) {
      onToggle();
    } else {
      await toggleFavorite(destinationSlug);
    }
  };

  const { icon: iconSize, text: textSize } = sizeMap[size];

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-1.5 touch-target rounded-lg
        transition-all duration-200
        hover:scale-110 active:scale-95
        ${isFav ? "text-red-500" : "text-gray-400 hover:text-red-400"}
      `}
      aria-label={isFav ? "取消收藏" : "添加收藏"}
      title={isFav ? "取消收藏" : "添加收藏"}
    >
      <Heart
        size={iconSize}
        fill={isFav ? "currentColor" : "none"}
        className={`transition-all duration-300 ${isFav ? "animate-heart-beat" : ""}`}
      />
      {showCount && favoriteCount !== undefined && favoriteCount > 0 && (
        <span className={`${textSize} text-gray-500`}>
          {formatCount(favoriteCount)}
        </span>
      )}
    </button>
  );
}
