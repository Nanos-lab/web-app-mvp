import { MainLayout } from "@/components/templates/MainLayout";
import { FilterBar } from "@/components/organisms/FilterBar";
import { DestinationGrid } from "@/components/organisms/DestinationGrid";
import { Pagination } from "@/components/organisms/Pagination";
import { SearchBar } from "@/components/molecules/SearchBar";
import { Breadcrumb } from "@/components/molecules/Breadcrumb";
import { H1 } from "@/components/atoms/Typography";
import { getDestinations, getCategories, getTags } from "@/lib/data";
import type { DestinationFilters, SortOption } from "@/types/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "探索目的地",
  description: "按分类、难度、预算等维度筛选 100 个不可思议的旅行目的地",
};

// 筛选选项的固定枚举值映射
const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "轻松" },
  { value: "moderate", label: "适中" },
  { value: "difficult", label: "较难" },
  { value: "extreme", label: "极限" },
];

const BUDGET_OPTIONS = [
  { value: "budget", label: "经济" },
  { value: "moderate", label: "适中" },
  { value: "luxury", label: "奢华" },
];

const CROWD_OPTIONS = [
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
];

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function DestinationListPage({ searchParams }: Props) {
  // 从 URL 参数构建筛选请求
  const filters: DestinationFilters = {
    page: Number(searchParams.page) || 1,
    page_size: Math.min(Number(searchParams.page_size) || 20, 100),
    sort: (searchParams.sort as SortOption) || "sort_order",
    tags: searchParams.tags as string | undefined,
    category: searchParams.category as string | undefined,
    continent: searchParams.continent as string | undefined,
    country: searchParams.country as string | undefined,
    difficulty: searchParams.difficulty as string | undefined,
    budget: searchParams.budget as string | undefined,
    crowd_level: searchParams.crowd_level as string | undefined,
    search: searchParams.search as string | undefined,
  };

  // 并行获取数据
  const [destRes, categoriesRes, tagsRes] = await Promise.allSettled([
    getDestinations(filters),
    getCategories(),
    getTags("count"),
  ]);

  const destinations =
    destRes.status === "fulfilled" ? destRes.value.data : [];
  const meta =
    destRes.status === "fulfilled"
      ? destRes.value.meta
      : { page: 1, page_size: 20, total: 0, total_pages: 0 };

  const categories =
    categoriesRes.status === "fulfilled" ? categoriesRes.value.data : [];
  const tags =
    tagsRes.status === "fulfilled" ? tagsRes.value.data : [];

  // 构建筛选选项
  const categoryOptions = categories.map((c) => ({
    value: c.slug,
    label: `${c.icon || ""} ${c.name}`,
  }));

  const tagOptions = tags.map((t) => ({
    value: t.slug,
    label: t.name,
    count: t.destination_count,
  }));

  const continentOptions = [
    { value: "亚洲", label: "亚洲" },
    { value: "欧洲", label: "欧洲" },
    { value: "北美洲", label: "北美洲" },
    { value: "南美洲", label: "南美洲" },
    { value: "非洲", label: "非洲" },
    { value: "大洋洲", label: "大洋洲" },
    { value: "南极洲", label: "南极洲" },
  ];

  const currentSearch = (searchParams.search as string) || "";

  return (
    <MainLayout categories={categories}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑 */}
        <Breadcrumb items={[{ label: "探索目的地" }]} />

        {/* 标题 */}
        <H1 className="mb-2">探索目的地</H1>
        <p className="text-gray-500 text-sm mb-6">
          发现 {meta.total} 个不可思议的旅行目的地
        </p>

        {/* 搜索栏（内置路由导航，无需传 onChange） */}
        <SearchBar
          value={currentSearch}
          placeholder="输入目的地名称搜索..."
          className="mb-6 max-w-md"
        />

        {/* 筛选栏 */}
        <div className="mb-8">
          <FilterBar
            categoryOptions={categoryOptions}
            tagOptions={tagOptions}
            continentOptions={continentOptions}
            difficultyOptions={DIFFICULTY_OPTIONS}
            budgetOptions={BUDGET_OPTIONS}
            crowdLevelOptions={CROWD_OPTIONS}
          />
        </div>

        {/* 目的地网格 */}
        <DestinationGrid destinations={destinations} meta={meta} />

        {/* 分页（内置路由导航，无需传 onPageChange） */}
        {meta.total_pages > 1 && (
          <Pagination
            currentPage={meta.page}
            totalPages={meta.total_pages}
          />
        )}
      </div>
    </MainLayout>
  );
}
