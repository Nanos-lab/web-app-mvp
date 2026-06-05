import { Skeleton } from "@/components/atoms/Skeleton";
import { SkeletonCard } from "@/components/molecules/SkeletonCard";

export default function GlobalLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* 标题骨架 */}
      <Skeleton variant="text" width="200px" height={32} className="mb-2" />
      <Skeleton variant="text" width="300px" height={16} className="mb-8" />

      {/* 卡片网格骨架 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
