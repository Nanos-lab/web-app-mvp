"use client";

import React, { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  siblingsCount?: number;
}

function generatePageNumbers(
  current: number,
  total: number,
  siblings: number
): Array<number | "ellipsis-start" | "ellipsis-end"> {
  const result: Array<number | "ellipsis-start" | "ellipsis-end"> = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) result.push(i);
    return result;
  }

  result.push(1);

  const leftSibling = Math.max(current - siblings, 2);
  const rightSibling = Math.min(current + siblings, total - 1);

  if (leftSibling > 2) {
    result.push("ellipsis-start");
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    result.push(i);
  }

  if (rightSibling < total - 1) {
    result.push("ellipsis-end");
  }

  result.push(total);
  return result;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingsCount = 1,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = useCallback(
    (page: number) => {
      if (onPageChange) {
        onPageChange(page);
      } else {
        // 内置路由导航：通过 URL page 参数驱动分页
        const params = new URLSearchParams(searchParams.toString());
        if (page > 1) {
          params.set("page", String(page));
        } else {
          params.delete("page");
        }
        router.push(`/destinations?${params.toString()}`, { scroll: false });
      }
    },
    [onPageChange, router, searchParams]
  );

  if (totalPages <= 1) return null;

  const pages = generatePageNumbers(currentPage, totalPages, siblingsCount);

  return (
    <nav aria-label="分页导航" className="flex justify-center mt-10">
      {/* 移动端简化版 */}
      <div className="flex sm:hidden items-center gap-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300
                     text-sm font-medium text-gray-700 hover:bg-gray-50
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white
                     touch-target"
        >
          <ChevronLeft size={16} />
          上一页
        </button>
        <span className="text-sm text-gray-500">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300
                     text-sm font-medium text-gray-700 hover:bg-gray-50
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white
                     touch-target"
        >
          下一页
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 桌面端完整版 */}
      <div className="hidden sm:flex items-center gap-1">
        {/* 上一页 */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent
                     transition-colors"
          aria-label="上一页"
        >
          <ChevronLeft size={18} />
        </button>

        {pages.map((page, index) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-gray-400 select-none"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`
                min-w-[40px] h-10 rounded-lg text-sm font-medium
                transition-colors
                ${
                  isActive
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
              aria-label={`第 ${page} 页`}
              aria-current={isActive ? "page" : undefined}
            >
              {page}
            </button>
          );
        })}

        {/* 下一页 */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent
                     transition-colors"
          aria-label="下一页"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}
