import { MainLayout } from "@/components/templates/MainLayout";
import { DetailLayout } from "@/components/templates/DetailLayout";
import { ViewTracker } from "./ViewTracker";
import { getDestination, getCategories } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await getDestination(params.slug);
    const d = res.data;
    return {
      title: d.title,
      description: d.summary || d.subtitle,
      openGraph: {
        title: d.title,
        description: d.summary || d.subtitle,
        images: d.media.cover_image_url ? [{ url: d.media.cover_image_url }] : [],
      },
    };
  } catch {
    return { title: "目的地未找到" };
  }
}

export default async function DestinationDetailPage({ params }: Props) {
  const [destRes, categoriesRes] = await Promise.allSettled([
    getDestination(params.slug),
    getCategories(),
  ]);

  if (destRes.status === "rejected") {
    notFound();
  }

  const destination = destRes.value.data;
  const categories =
    categoriesRes.status === "fulfilled" ? categoriesRes.value.data : [];

  return (
    <MainLayout categories={categories}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <DetailLayout destination={destination} />
      </div>
      {/* 浏览追踪 (Client Component) */}
      <ViewTracker slug={params.slug} />
    </MainLayout>
  );
}
