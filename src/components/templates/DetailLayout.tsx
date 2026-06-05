import React from "react";
import { H1, H2 } from "@/components/atoms/Typography";
import { Badge } from "@/components/atoms/Badge";
import { Divider } from "@/components/atoms/Divider";
import { Breadcrumb } from "@/components/molecules/Breadcrumb";
import { RatingStar } from "@/components/molecules/RatingStar";
import { FavoriteButton } from "@/components/molecules/FavoriteButton";
import { ShareButton } from "@/components/molecules/ShareButton";
import { TagChip } from "@/components/molecules/TagChip";
import { StatBadge } from "@/components/molecules/StatBadge";
import { ImageGallery } from "@/components/organisms/ImageGallery";
import { MarkdownViewer } from "@/components/organisms/MarkdownViewer";
import { TravelInfoPanel } from "@/components/organisms/TravelInfoPanel";
import type { DestinationDetail } from "@/types/api";

const difficultyLabel: Record<string, string> = {
  easy: "轻松", moderate: "适中", difficult: "较难", extreme: "极限",
};

interface DetailLayoutProps {
  destination: DestinationDetail;
}

export function DetailLayout({ destination }: DetailLayoutProps) {
  const {
    title,
    title_en: titleEn,
    subtitle,
    description,
    location,
    travel_info: travelInfo,
    practical,
    getting_there: gettingThere,
    fun_facts: funFacts,
    travel_tips: travelTips,
    safety_notes: safetyNotes,
    media,
    categories,
    tags,
    stats,
    user_context: userContext,
    created_at: createdAt,
    updated_at: updatedAt,
  } = destination;

  return (
    <div>
      {/* 面包屑 */}
      <Breadcrumb
        items={[
          { label: "目的地", href: "/destinations" },
          { label: title },
        ]}
      />

      {/* 标题区 */}
      <div className="mb-6">
        <H1>{title}</H1>
        {titleEn && (
          <p className="mt-1 text-lg text-gray-400">{titleEn}</p>
        )}
        {subtitle && (
          <p className="mt-2 text-xl text-gray-500">{subtitle}</p>
        )}
      </div>

      {/* 元信息行 */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Badge variant="info">{location.country}</Badge>
        <Badge variant="default">{difficultyLabel[travelInfo.difficulty] ?? travelInfo.difficulty}</Badge>
        <RatingStar rating={stats.rating} count={stats.rating_count} />
        {categories.map((cat) => (
          <Badge key={cat.id} variant="accent">{cat.name}</Badge>
        ))}
      </div>

      {/* 两栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* 左栏：主要内容 */}
        <div className="lg:col-span-8 space-y-8">
          {/* 图片画廊 */}
          <ImageGallery
            images={media.images}
            coverImageUrl={media.cover_image_url}
            altBase={title}
          />

          {/* Markdown 正文 */}
          <MarkdownViewer htmlContent={description} />

          {/* 旅行信息面板 */}
          <TravelInfoPanel
            travelInfo={travelInfo}
            practical={practical}
            gettingThere={gettingThere}
            safetyNotes={safetyNotes}
            funFacts={funFacts}
            travelTips={travelTips}
          />
        </div>

        {/* 右栏：侧边信息 */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* 快速信息卡片 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
              <H2 className="text-lg">概览</H2>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoItem label="最佳季节" value={travelInfo.best_season} />
                <InfoItem label="难度" value={difficultyLabel[travelInfo.difficulty] ?? travelInfo.difficulty} />
                <InfoItem label="建议停留" value={travelInfo.duration} />
                <InfoItem label="温度" value={travelInfo.temperature} />
              </div>

              <Divider />

              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                <FavoriteButton
                  destinationSlug={destination.slug}
                  isFavorited={userContext?.is_favorited}
                  favoriteCount={stats.favorite_count}
                  size="lg"
                  showCount
                />
                <ShareButton title={title} text={subtitle} size="md" variant="icon-only" />
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
              <H2 className="text-lg">统计数据</H2>
              <div className="grid grid-cols-2 gap-3">
                <StatBadge icon="Eye" value={stats.view_count} label="浏览" />
                <StatBadge icon="Heart" value={stats.favorite_count} label="收藏" />
                <StatBadge icon="Star" value={`${stats.rating}`} label="评分" />
              </div>
            </div>

            {/* 标签 */}
            {tags.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
                <H2 className="text-lg">标签</H2>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <TagChip key={tag.id} tag={tag} size="sm" />
                  ))}
                </div>
              </div>
            )}

            {/* 坐标信息 */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
              <H2 className="text-lg">位置信息</H2>
              <p className="text-sm text-gray-600">
                {location.country} · {location.region} · {location.continent}
              </p>
              <p className="text-sm text-gray-500">
                海拔 {location.elevation.toLocaleString()} 米
              </p>
              <p className="text-xs text-gray-400">
                坐标: {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
              </p>
            </div>

            {/* 时效信息 */}
            <div className="text-xs text-gray-400 space-y-1 px-1">
              <p>发布: {new Date(createdAt).toLocaleDateString("zh-CN")}</p>
              <p>更新: {new Date(updatedAt).toLocaleDateString("zh-CN")}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-400">{label}</span>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}
