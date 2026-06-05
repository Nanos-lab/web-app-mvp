"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useDeviceId } from "./DeviceProvider";
import { useToast } from "./ToastProvider";
import { destinations } from "@/lib/api-client";

interface FavoritesContextValue {
  favoritedSlugs: Set<string>;
  isFavorited: (slug: string) => boolean;
  toggleFavorite: (slug: string) => Promise<boolean>;
  isLoading: boolean;
  /** 从 API 重新加载收藏列表 */
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favoritedSlugs: new Set(),
  isFavorited: () => false,
  toggleFavorite: async () => false,
  isLoading: false,
  refresh: async () => {},
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { deviceId, isReady } = useDeviceId();
  const { showToast } = useToast();
  const [favoritedSlugs, setFavoritedSlugs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：从 API 加载当前设备的收藏列表
  const refresh = useCallback(async () => {
    if (!deviceId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      // 获取所有收藏（假设最多 100 条，一页拿完）
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/user/favorites?page=1&page_size=100`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Device-Id": deviceId,
          },
        }
      );
      if (res.ok) {
        const json = await res.json();
        const slugs = new Set<string>(
          json.data.map((item: { slug: string }) => item.slug)
        );
        setFavoritedSlugs(slugs);
      }
    } catch {
      // 静默失败 — 收藏功能降级但不阻塞 UI
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    if (isReady) {
      refresh();
    }
  }, [isReady, refresh]);

  const isFavorited = useCallback(
    (slug: string) => favoritedSlugs.has(slug),
    [favoritedSlugs]
  );

  const toggleFavorite = useCallback(
    async (slug: string): Promise<boolean> => {
      if (!deviceId) return false;

      const wasFavorited = favoritedSlugs.has(slug);
      const newState = !wasFavorited;

      // 乐观更新
      setFavoritedSlugs((prev) => {
        const next = new Set(prev);
        if (newState) {
          next.add(slug);
        } else {
          next.delete(slug);
        }
        return next;
      });

      try {
        if (newState) {
          await destinations.toggleFavorite(slug, deviceId);
        } else {
          await destinations.removeFavorite(slug, deviceId);
        }
        showToast(
          newState ? "已添加到收藏" : "已取消收藏",
          "success"
        );
        return true;
      } catch {
        // 回滚
        setFavoritedSlugs((prev) => {
          const next = new Set(prev);
          if (wasFavorited) {
            next.add(slug);
          } else {
            next.delete(slug);
          }
          return next;
        });
        showToast("操作失败，请稍后重试", "error");
        return false;
      }
    },
    [deviceId, favoritedSlugs, showToast]
  );

  return (
    <FavoritesContext.Provider
      value={{ favoritedSlugs, isFavorited, toggleFavorite, isLoading, refresh }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  return useContext(FavoritesContext);
}
