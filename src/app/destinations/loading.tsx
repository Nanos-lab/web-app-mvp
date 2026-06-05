import { Skeleton } from "@/components/atoms/Skeleton";
import { SkeletonCard } from "@/components/molecules/SkeletonCard";

export default function DestinationsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton variant="text" width="160px" height={24} className="mb-4" />
      <Skeleton variant="text" width="240px" height={36} className="mb-2" />
      <Skeleton variant="text" width="300px" height={16} className="mb-6" />

      {/* 搜索栏骨架 */}
      <Skeleton variant="rectangular" width="100%" height={44} className="max-w-md mb-6" />

      {/* 筛选栏骨架 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4 rounded-xl bg-gray-50">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" width={60} height={12} />
            <div className="flex gap-1.5">
              <Skeleton variant="text" width={50} height={28} className="!rounded-full" />
              <Skeleton variant="text" width={50} height={28} className="!rounded-full" />
              <Skeleton variant="text" width={50} height={28} className="!rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
