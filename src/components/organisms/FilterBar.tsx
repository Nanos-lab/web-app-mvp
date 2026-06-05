"use client";

import React, { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { FilterGroup } from "@/components/molecules/FilterGroup";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import type { SortOption } from "@/types/api";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterBarProps {
  categoryOptions: FilterOption[];
  tagOptions: FilterOption[];
  continentOptions: FilterOption[];
  difficultyOptions: FilterOption[];
  budgetOptions: FilterOption[];
  crowdLevelOptions: FilterOption[];
}

const SORT_OPTIONS: Array<{ value: SortOption | ""; label: string }> = [
  { value: "sort_order", label: "推荐排序" },
  { value: "newest", label: "最新发布" },
  { value: "popular", label: "最热门" },
  { value: "favorites", label: "最多收藏" },
  { value: "rating", label: "最高评分" },
];

export function FilterBar({
  categoryOptions,
  tagOptions,
  continentOptions,
  difficultyOptions,
  budgetOptions,
  crowdLevelOptions,
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  // 从 URL 读取当前筛选值
  const getParam = (key: string): string[] => {
    const val = searchParams.get(key);
    if (!val) return [];
    return val.split(",").filter(Boolean);
  };

  const currentSort = (searchParams.get("sort") as SortOption) || "sort_order";
  const selectedCategories = getParam("category");
  const selectedTags = getParam("tags");
  const selectedContinents = getParam("continent");
  const selectedDifficulties = getParam("difficulty");
  const selectedBudgets = getParam("budget");
  const selectedCrowdLevels = getParam("crowd_level");

  // 计算当前活跃筛选数量
  const activeFilterCount = [
    selectedCategories, selectedTags, selectedContinents,
    selectedDifficulties, selectedBudgets, selectedCrowdLevels,
  ].filter((arr) => arr.length > 0).length;

  const updateParams = useCallback(
    (key: string, values: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (values.length > 0) {
        params.set(key, values.join(","));
      } else {
        params.delete(key);
      }
      // 筛选变化时重置页码
      if (key !== "page" && key !== "sort") {
        params.delete("page");
      }
      router.push(`/destinations?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const updateSort = useCallback(
    (sort: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (sort && sort !== "sort_order") {
        params.set("sort", sort);
      } else {
        params.delete("sort");
      }
      params.delete("page");
      router.push(`/destinations?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push("/destinations", { scroll: false });
  }, [router]);

  return (
    <div className="space-y-4">
      {/* 顶部栏：排序 + 筛选切换 */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select<SortOption | "">
          value={currentSort}
          onChange={(v) => updateSort(v)}
          options={SORT_OPTIONS}
          placeholder="排序方式"
          className="w-40"
          aria-label="排序方式"
        />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            md:hidden inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium
            transition-colors touch-target
            ${isExpanded
              ? "bg-primary-50 border-primary-300 text-primary-700"
              : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
            }
          `}
        >
          <Filter size={16} />
          筛选
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-600 text-white text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <X size={15} />
            清除筛选
          </button>
        )}
      </div>

      {/* 筛选面板 — 移动端可折叠 */}
      <div
        className={`
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
          p-4 rounded-xl bg-gray-50 border border-gray-200
          ${isExpanded ? "block" : "hidden md:grid"}
        `}
      >
        <FilterGroup
          label="分类"
          options={categoryOptions}
          selectedValues={selectedCategories}
          onChange={(v) => updateParams("category", v)}
          multiSelect={false}
        />
        <FilterGroup
          label="标签"
          options={tagOptions}
          selectedValues={selectedTags}
          onChange={(v) => updateParams("tags", v)}
        />
        <FilterGroup
          label="大洲"
          options={continentOptions}
          selectedValues={selectedContinents}
          onChange={(v) => updateParams("continent", v)}
          multiSelect={false}
        />
        <FilterGroup
          label="难度"
          options={difficultyOptions}
          selectedValues={selectedDifficulties}
          onChange={(v) => updateParams("difficulty", v)}
        />
        <FilterGroup
          label="预算"
          options={budgetOptions}
          selectedValues={selectedBudgets}
          onChange={(v) => updateParams("budget", v)}
        />
        <FilterGroup
          label="拥挤程度"
          options={crowdLevelOptions}
          selectedValues={selectedCrowdLevels}
          onChange={(v) => updateParams("crowd_level", v)}
        />
      </div>
    </div>
  );
}
