import { Skeleton } from "@/components/atoms/Skeleton";

export default function DestinationDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* 面包屑骨架 */}
      <Skeleton variant="text" width={200} height={16} className="mb-6" />

      {/* 标题骨架 */}
      <Skeleton variant="text" width="60%" height={40} className="mb-2" />
      <Skeleton variant="text" width="30%" height={24} className="mb-1" />
      <Skeleton variant="text" width="40%" height={20} className="mb-6" />

      {/* 元信息 */}
      <div className="flex gap-2 mb-8">
        <Skeleton variant="text" width={60} height={24} className="!rounded-full" />
        <Skeleton variant="text" width={60} height={24} className="!rounded-full" />
        <Skeleton variant="text" width={100} height={24} className="!rounded-full" />
      </div>

      {/* 两栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左栏 */}
        <div className="lg:col-span-8 space-y-6">
          {/* 封面图骨架 */}
          <Skeleton variant="rectangular" className="w-full aspect-[16/9]" />

          {/* 正文骨架 */}
          <div className="space-y-3">
            <Skeleton variant="text" width="30%" height={28} />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="text" width={`${70 + Math.random() * 30}%`} height={16} />
            ))}
          </div>
        </div>

        {/* 右栏 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl border border-gray-200 space-y-3">
            <Skeleton variant="text" width={80} height={20} />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton variant="text" width={40} height={12} />
                  <Skeleton variant="text" width={80} height={16} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
