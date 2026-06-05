"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { MainLayout } from "@/components/templates/MainLayout";
import { DestinationGrid } from "@/components/organisms/DestinationGrid";
import { H1, Body } from "@/components/atoms/Typography";
import { Button } from "@/components/atoms/Button";
import { useDeviceId } from "@/providers/DeviceProvider";
import { useFavorites } from "@/providers/FavoritesProvider";
import type { DestinationCardData } from "@/types/api";

export default function FavoritesPage() {
  const { deviceId, isReady } = useDeviceId();
  const { favoritedSlugs, isLoading, refresh } = useFavorites();
  const [favoriteDestinations, setFavoriteDestinations] = useState<DestinationCardData[]>([]);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const fetchFavoriteDetails = useCallback(async () => {
    if (!deviceId || favoritedSlugs.size === 0) {
      setFavoriteDestinations([]);
      return;
    }

    setIsFetchingDetails(true);
    try {
      // 从 favorites API 获取收藏列表（含卡片信息）
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${API_BASE}/user/favorites?page=1&page_size=100`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Device-Id": deviceId,
        },
      });

      if (res.ok) {
        const json = await res.json();
        // 将 FavoriteItem 转为 DestinationCardData 兼容格式
        const cards: DestinationCardData[] = json.data.map((item: {
          id: number;
          title: string;
          slug: string;
          subtitle: string;
          country: string;
          continent: string;
          thumbnail_url: string;
          categories: Array<{ id: number; name: string; slug: string }>;
        }) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          subtitle: item.subtitle,
          summary: "",
          country: item.country,
          continent: item.continent,
          difficulty: "moderate" as const,
          budget: "moderate" as const,
          duration: "",
          thumbnail_url: item.thumbnail_url,
          categories: item.categories,
          tags: [],
          stats: { view_count: 0, favorite_count: 0, rating: 0 },
          created_at: "",
        }));
        setFavoriteDestinations(cards);
      }
    } catch {
      // 静默失败
    } finally {
      setIsFetchingDetails(false);
    }
  }, [deviceId, favoritedSlugs.size]);

  useEffect(() => {
    if (isReady) {
      fetchFavoriteDetails();
    }
  }, [isReady, fetchFavoriteDetails]);

  // 未初始化状态
  if (!isReady || isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </div>
    );
  }

  // 无设备 ID 状态
  if (!deviceId) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <Heart size={64} className="text-gray-300 mb-4" />
        <H1>我的收藏</H1>
        <Body className="mt-2 text-gray-500 max-w-md">
          收藏功能使用设备标识，无需登录。您的收藏会自动保存在当前设备上。
        </Body>
        <p className="mt-4 text-sm text-gray-400">
          如果无法访问收藏，请检查浏览器设置中是否启用了本地存储。
        </p>
      </div>
    );
  }

  // Empty 状态
  if (!isFetchingDetails && favoriteDestinations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <Heart size={64} className="text-gray-300 mb-4" />
        <H1>还没有收藏</H1>
        <Body className="mt-2 text-gray-500 max-w-md">
          你还没有收藏任何目的地。去探索一下，把喜欢的目的地加入收藏吧！
        </Body>
        <Link href="/destinations" className="mt-6">
          <Button variant="primary" size="lg">
            浏览目的地
            <ArrowRight size={18} />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <H1>我的收藏</H1>
          <Body className="text-gray-500">
            已收藏 {favoritedSlugs.size} 个目的地
          </Body>
        </div>
        <Link href="/destinations">
          <Button variant="secondary" size="sm">
            探索更多
          </Button>
        </Link>
      </div>

      <DestinationGrid
        destinations={favoriteDestinations}
        favoritedSlugs={favoritedSlugs}
        isLoading={isFetchingDetails}
      />
    </div>
  );
}
