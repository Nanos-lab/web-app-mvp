import React from "react";
import { DestinationCard } from "@/components/molecules/DestinationCard";
import { SkeletonCard } from "@/components/molecules/SkeletonCard";
import { Button } from "@/components/atoms/Button";
import { SearchX, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { DestinationCardData, PaginationMeta } from "@/types/api";

interface DestinationGridProps {
  destinations: DestinationCardData[];
  meta?: PaginationMeta;
  favoritedSlugs?: Set<string>;
  isLoading?: boolean;
}

export function DestinationGrid({
  destinations,
  meta,
  favoritedSlugs = new Set(),
  isLoading = false,
}: DestinationGridProps) {
  // Loading 状态
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Empty 状态
  if (destinations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <SearchX size={64} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          没有找到匹配的目的地
        </h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md">
          试试调整筛选条件，或者清除所有筛选重新探索
        </p>
        <Link href="/destinations">
          <Button variant="secondary" size="md">
            清除筛选
          </Button>
        </Link>
      </div>
    );
  }

  // 结果统计
  const resultInfo = meta ? `共 ${meta.total} 个目的地` : null;

  return (
    <div>
      {resultInfo && (
        <p className="text-sm text-gray-500 mb-4">
          {resultInfo}
          {meta && meta.total_pages > 1 && (
            <span> · 第 {meta.page}/{meta.total_pages} 页</span>
          )}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {destinations.map((dest) => (
          <DestinationCard
            key={dest.id}
            destination={dest}
            isFavorited={favoritedSlugs.has(dest.slug)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Error 状态组件 ──────────────────────────────────────────────────────────

interface GridErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function DestinationGridError({
  message = "数据加载失败，请稍后重试",
  onRetry,
}: GridErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle size={64} className="text-red-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        加载失败
      </h3>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="md" onClick={onRetry}>
          重新加载
        </Button>
      )}
    </div>
  );
}
