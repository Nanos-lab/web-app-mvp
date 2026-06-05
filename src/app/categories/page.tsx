import { MainLayout } from "@/components/templates/MainLayout";
import { CategoryBadge } from "@/components/molecules/CategoryBadge";
import { Breadcrumb } from "@/components/molecules/Breadcrumb";
import { H1, Body } from "@/components/atoms/Typography";
import { getCategories } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "旅行分类",
  description: "按主题分类探索 100 个不可思议的旅行目的地",
};

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getCategories>>["data"] = [];

  try {
    const res = await getCategories();
    categories = res.data;
  } catch {
    // 加载失败 — 展示空状态
  }

  return (
    <MainLayout categories={categories}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "分类" }]} />

        <H1 className="mb-2">探索分类</H1>
        <Body className="mb-8 text-gray-500">
          按你的旅行偏好，找到最匹配的不可思议目的地
        </Body>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <CategoryBadge
                key={cat.id}
                category={cat}
                href={`/categories/${cat.slug}`}
                variant="hero"
                size="lg"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">分类加载失败，请刷新页面后重试</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
