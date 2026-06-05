// ============================================================================
// API Client — 「100种不可思议旅行」
// 统一 fetch 封装 + 按领域分组的请求函数
// ============================================================================

import { ApiRequestError } from "./api-errors";
import type {
  PaginatedResponse,
  DestinationCardData,
  DestinationDetail,
  DestinationFilters,
  Category,
  Tag,
  FavoriteItem,
  FavoriteToggleResponse,
  ViewRecordResponse,
} from "@/types/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ─── 通用 fetch 包装 ────────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  next?: NextFetchRequestConfig;
}

async function apiFetch<T>(
  path: string,
  options?: FetchOptions
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const { next, ...init } = options ?? {};

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init?.headers,
    },
    next,
  });

  if (!res.ok) {
    let errorBody: { error?: { code?: string; message?: string; details?: Record<string, unknown> } } = {};
    try {
      errorBody = await res.json();
    } catch {
      // ignore parse errors on error responses
    }
    throw new ApiRequestError(
      res.status,
      errorBody.error?.code ?? "UNKNOWN",
      errorBody.error?.message ?? `HTTP ${res.status}`,
      errorBody.error?.details
    );
  }

  return res.json();
}

// ─── 目的地 ──────────────────────────────────────────────────────────────────

export const destinations = {
  /** 获取目的地列表（支持筛选/排序/分页） */
  list: (filters: DestinationFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });
    const qs = params.toString();
    return apiFetch<PaginatedResponse<DestinationCardData>>(
      `/destinations${qs ? `?${qs}` : ""}`
    );
  },

  /** 获取目的地详情 */
  detail: (slug: string, raw?: boolean) =>
    apiFetch<{ data: DestinationDetail }>(
      `/destinations/${slug}${raw ? "?raw=true" : ""}`
    ),

  /** 记录浏览 */
  recordView: (
    slug: string,
    deviceId: string,
    durationSeconds?: number
  ) =>
    apiFetch<{ data: ViewRecordResponse }>(`/destinations/${slug}/view`, {
      method: "POST",
      headers: { "X-Device-Id": deviceId },
      body:
        durationSeconds !== undefined
          ? JSON.stringify({ duration_seconds: durationSeconds })
          : undefined,
    }),

  /** 切换收藏 (幂等 POST) */
  toggleFavorite: (slug: string, deviceId: string) =>
    apiFetch<{ data: FavoriteToggleResponse }>(
      `/destinations/${slug}/favorite`,
      {
        method: "POST",
        headers: { "X-Device-Id": deviceId },
      }
    ),

  /** 取消收藏 */
  removeFavorite: (slug: string, deviceId: string) =>
    apiFetch<{ data: FavoriteToggleResponse }>(
      `/destinations/${slug}/favorite`,
      {
        method: "DELETE",
        headers: { "X-Device-Id": deviceId },
      }
    ),
};

// ─── 分类 ────────────────────────────────────────────────────────────────────

export const categories = {
  list: () => apiFetch<{ data: Category[] }>("/categories"),
};

// ─── 标签 ────────────────────────────────────────────────────────────────────

export const tags = {
  list: (sort?: "name" | "count") =>
    apiFetch<{ data: Tag[] }>(`/tags${sort ? `?sort=${sort}` : ""}`),
};

// ─── 用户 ────────────────────────────────────────────────────────────────────

export const user = {
  favorites: (deviceId: string, page = 1, pageSize = 20) =>
    apiFetch<PaginatedResponse<FavoriteItem>>(
      `/user/favorites?page=${page}&page_size=${pageSize}`,
      {
        headers: { "X-Device-Id": deviceId },
      }
    ),
};
