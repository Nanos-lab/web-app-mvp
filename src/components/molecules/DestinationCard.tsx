"use client";

import React from "react";
import Link from "next/link";
import { OptimizedImage } from "@/components/atoms/OptimizedImage";
import { Badge } from "@/components/atoms/Badge";
import { StatBadge } from "./StatBadge";
import { FavoriteButton } from "./FavoriteButton";
import type { DestinationCardData } from "@/types/api";

type DifficultyLabelMap = Record<string, string>;
const difficultyLabels: DifficultyLabelMap = {
  easy: "轻松",
  moderate: "适中",
  difficult: "较难",
  extreme: "极限",
};

type BudgetLabelMap = Record<string, string>;
const budgetLabels: BudgetLabelMap = {
  budget: "经济",
  moderate: "适中",
  luxury: "奢华",
};

interface DestinationCardProps {
  destination: DestinationCardData;
  isFavorited?: boolean;
  onFavoriteToggle?: () => void;
  priority?: boolean;
}

export function DestinationCard({
  destination,
  isFavorited = false,
  onFavoriteToggle,
  priority = false,
}: DestinationCardProps) {
  const {
    title,
    slug,
    subtitle,
    country,
    difficulty,
    budget,
    duration,
    thumbnail_url: thumbnailUrl,
    categories,
    stats,
  } = destination;

  return (
    <article
      className="group relative flex flex-col rounded-xl bg-white border border-gray-200
                 overflow-hidden transition-all duration-200
                 hover:shadow-lg hover:scale-[1.02] hover:border-gray-300
                 active:scale-[0.99]"
    >
      {/* 图片区域 */}
      <Link
        href={`/destinations/${slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-gray-100"
        aria-label={`查看 ${title} 详情`}
      >
        <OptimizedImage
          src={thumbnailUrl}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="group-hover:scale-105 transition-transform duration-500"
        />

        {/* 难度和预算徽章 */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge variant="info" size="sm">
            {difficultyLabels[difficulty] ?? difficulty}
          </Badge>
          <Badge variant="default" size="sm">
            {budgetLabels[budget] ?? budget}
          </Badge>
        </div>
      </Link>

      {/* 信息区域 */}
      <div className="flex flex-col flex-1 p-4">
        {/* 分类 */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {categories.map((cat) => (
              <span
                key={cat.id}
                className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* 标题和副标题 */}
        <Link href={`/destinations/${slug}`} className="flex-1">
          <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-primary-700 transition-colors">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {subtitle}
            </p>
          )}
        </Link>

        {/* 元信息行 */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{country}</span>
            {duration && (
              <>
                <span className="text-gray-300">·</span>
                <span>{duration}</span>
              </>
            )}
          </div>

          {/* 收藏按钮 */}
          <FavoriteButton
            destinationSlug={slug}
            isFavorited={isFavorited}
            favoriteCount={stats.favorite_count}
            onToggle={onFavoriteToggle}
            size="sm"
            showCount={false}
          />
        </div>

        {/* 统计行 */}
        <div className="mt-2 flex items-center gap-3">
          <StatBadge
            icon="Eye"
            value={stats.view_count}
            variant="compact"
          />
          <StatBadge
            icon="Star"
            value={stats.rating}
            variant="compact"
          />
        </div>
      </div>
    </article>
  );
}
