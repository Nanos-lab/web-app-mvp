import { MainLayout } from "@/components/templates/MainLayout";
import { HeroSection } from "@/components/organisms/HeroSection";
import { DestinationGrid } from "@/components/organisms/DestinationGrid";
import { CategoryBadge } from "@/components/molecules/CategoryBadge";
import { H2, Body } from "@/components/atoms/Typography";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getDestinations, getCategories } from "@/lib/data";

export default async function HomePage() {
  // 并行获取首页所需数据
  const [popularRes, newestRes, categoriesRes] = await Promise.allSettled([
    getDestinations({ sort: "popular", page_size: 8 }),
    getDestinations({ sort: "newest", page_size: 4 }),
    getCategories(),
  ]);

  const popularDestinations =
    popularRes.status === "fulfilled" ? popularRes.value.data : [];
  const newestDestinations =
    newestRes.status === "fulfilled" ? newestRes.value.data : [];
  const categories =
    categoriesRes.status === "fulfilled" ? categoriesRes.value.data : [];

  return (
    <MainLayout categories={categories}>
      {/* Hero */}
      <HeroSection />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 分类导航 */}
        <section className="py-12 sm:py-16">
          <div className="text-center mb-8">
            <H2>探索分类</H2>
            <Body className="mt-2 text-gray-500">
              按你的旅行偏好找到最匹配的目的地
            </Body>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <CategoryBadge
                  key={cat.id}
                  category={cat}
                  href={`/categories/${cat.slug}`}
                  variant="card"
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-sm">分类加载中...</p>
          )}
        </section>

        {/* 热门目的地 */}
        <section className="py-8" id="destination-grid">
          <div className="flex items-center justify-between mb-6">
            <div>
              <H2>热门目的地</H2>
              <Body className="mt-1 text-gray-500">
                最多人浏览和收藏的精选目的地
              </Body>
            </div>
            <Link
              href="/destinations?sort=popular"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              查看全部
              <ArrowRight size={16} />
            </Link>
          </div>

          <DestinationGrid destinations={popularDestinations} />

          <Link
            href="/destinations?sort=popular"
            className="sm:hidden mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-primary-600"
          >
            查看全部
            <ArrowRight size={16} />
          </Link>
        </section>

        {/* 最新加入 */}
        {newestDestinations.length > 0 && (
          <section className="py-8 sm:py-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <H2>最新加入</H2>
                <Body className="mt-1 text-gray-500">
                  最近收录的目的地
                </Body>
              </div>
              <Link
                href="/destinations?sort=newest"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                查看全部 <ArrowRight size={16} />
              </Link>
            </div>

            <DestinationGrid destinations={newestDestinations} />
          </section>
        )}

        {/* 底部 CTA */}
        <section className="py-16 text-center">
          <H2>准备好开始探索了吗？</H2>
          <Body className="mt-3 text-gray-500 max-w-lg mx-auto">
            100 个精选目的地正等待着你 — 从天空之镜到地下萤火虫星河，找到属于你的下一个不可思议之旅。
          </Body>
          <Link
            href="/destinations"
            className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl
                       bg-primary-600 text-white font-bold text-base
                       hover:bg-primary-700 active:bg-primary-800
                       transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            浏览全部目的地
            <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </MainLayout>
  );
}
