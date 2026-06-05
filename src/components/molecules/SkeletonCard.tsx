import React from "react";
import { Skeleton } from "@/components/atoms/Skeleton";

interface SkeletonCardProps {
  className?: string;
}

/**
 * DestinationCard 的骨架占位版本
 * 布局严格匹配 DestinationCard 以保证无布局偏移
 */
export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div
      className={`flex flex-col rounded-xl border border-gray-200 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* 图片区域 */}
      <div className="relative aspect-[16/10]">
        <Skeleton variant="rectangular" className="absolute inset-0 !rounded-none" />
        {/* 徽章 */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Skeleton variant="text" width={40} height={20} className="!rounded-full" />
          <Skeleton variant="text" width={40} height={20} className="!rounded-full" />
        </div>
      </div>

      {/* 信息区域 */}
      <div className="p-4 space-y-3">
        {/* 分类 */}
        <Skeleton variant="text" width={60} height={18} className="!rounded-full" />

        {/* 标题 */}
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="60%" height={16} />

        {/* 底部行 */}
        <div className="flex justify-between items-center pt-1">
          <Skeleton variant="text" width={80} height={14} />
          <Skeleton variant="circular" width={28} height={28} />
        </div>

        {/* 统计行 */}
        <div className="flex gap-3">
          <Skeleton variant="text" width={50} height={14} />
          <Skeleton variant="text" width={50} height={14} />
        </div>
      </div>
    </div>
  );
}
