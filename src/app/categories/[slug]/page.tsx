import { MainLayout } from "@/components/templates/MainLayout";
import { DestinationGrid } from "@/components/organisms/DestinationGrid";
import { Pagination } from "@/components/organisms/Pagination";
import { Breadcrumb } from "@/components/molecules/Breadcrumb";
import { CategoryBadge } from "@/components/molecules/CategoryBadge";
import { H1, Body } from "@/components/atoms/Typography";
import { getDestinations, getCategories } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await getCategories();
    const cat = res.data.find((c) => c.slug === params.slug);
    if (cat) {
      return {
        title: `${cat.icon || ""} ${cat.name}`,
        description: cat.description,
      };
    }
  } catch {
    // fall through
  }
  return { title: "分类" };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const page = Number(searchParams.page) || 1;

  const [destRes, categoriesRes] = await Promise.allSettled([
    getDestinations({ category: params.slug, sort: "popular", page }),
    getCategories(),
  ]);

  const categories =
    categoriesRes.status === "fulfilled" ? categoriesRes.value.data : [];

  const category = categories.find((c) => c.slug === params.slug);

  if (categoriesRes.status === "fulfilled" && !category) {
    notFound();
  }

  const destinations =
    destRes.status === "fulfilled" ? destRes.value.data : [];
  const meta =
    destRes.status === "fulfilled"
      ? destRes.value.meta
      : { page: 1, page_size: 20, total: 0, total_pages: 0 };

  return (
    <MainLayout categories={categories}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: "分类", href: "/categories" },
            ...(category ? [{ label: `${category.icon || ""} ${category.name}` }] : []),
          ]}
        />

        {category ? (
          <div className="mb-8">
            <CategoryBadge
              category={category}
              variant="hero"
              size="lg"
            />
          </div>
        ) : (
          <H1 className="mb-2">{params.slug}</H1>
        )}

        <Body className="text-gray-500 mb-6">
          {meta.total > 0
            ? `共 ${meta.total} 个目的地`
            : "该分类下暂无目的地"}
        </Body>

        <DestinationGrid destinations={destinations} meta={meta} />

        {meta.total_pages > 1 && (
          <Pagination
            currentPage={meta.page}
            totalPages={meta.total_pages}
            onPageChange={() => {
              // Client Component handles navigation
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
