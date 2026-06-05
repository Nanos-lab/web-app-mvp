// ============================================================================
// 服务端数据获取 — 「100种不可思议旅行」
// 使用 React cache() 在同一渲染树内去重请求
// ============================================================================

import { cache } from "react";
import {
  destinations,
  categories,
  tags as tagsApi,
} from "./api-client";
import type {
  PaginatedResponse,
  DestinationCardData,
  DestinationDetail,
  DestinationFilters,
  Category,
  Tag,
} from "@/types/api";

// ─── 目的地 ──────────────────────────────────────────────────────────────────

export const getDestinations = cache(
  async (
    filters: DestinationFilters = {}
  ): Promise<PaginatedResponse<DestinationCardData>> => {
    return destinations.list(filters);
  }
);

export const getDestination = cache(
  async (slug: string): Promise<{ data: DestinationDetail }> => {
    return destinations.detail(slug);
  }
);

// ─── 分类 & 标签 ─────────────────────────────────────────────────────────────

export const getCategories = cache(
  async (): Promise<{ data: Category[] }> => {
    return categories.list();
  }
);

export const getTags = cache(
  async (sort?: "name" | "count"): Promise<{ data: Tag[] }> => {
    return tagsApi.list(sort);
  }
);
