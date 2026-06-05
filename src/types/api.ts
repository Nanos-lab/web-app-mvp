// ============================================================================
// API 类型定义 — 「100种不可思议旅行」MVP
// 严格匹配 docs/api_spec.md 中的响应结构
// ============================================================================

// ─── 枚举 ───────────────────────────────────────────────────────────────────

export type DestinationStatus = "published" | "draft" | "archived";
export type Difficulty = "easy" | "moderate" | "difficult" | "extreme";
export type BudgetLevel = "budget" | "moderate" | "luxury";
export type CrowdLevel = "low" | "medium" | "high";
export type SortOption =
  | "sort_order"
  | "newest"
  | "popular"
  | "favorites"
  | "rating";

// ─── 请求参数 ────────────────────────────────────────────────────────────────

export interface DestinationFilters {
  page?: number;
  page_size?: number;
  sort?: SortOption;
  tags?: string; // comma-separated slugs
  category?: string;
  continent?: string;
  country?: string;
  difficulty?: string;
  budget?: string;
  crowd_level?: string;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ─── 目的地列表卡片 (GET /destinations) ──────────────────────────────────────

export interface DestinationCardData {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  country: string;
  continent: string;
  difficulty: Difficulty;
  budget: BudgetLevel;
  duration: string;
  thumbnail_url: string;
  categories: CategoryBrief[];
  tags: TagBrief[];
  stats: DestinationStatsBrief;
  created_at: string;
}

export interface CategoryBrief {
  id: number;
  name: string;
  slug: string;
}

export interface TagBrief {
  id: number;
  name: string;
  slug: string;
}

export interface DestinationStatsBrief {
  view_count: number;
  favorite_count: number;
  rating: number;
}

// ─── 目的地详情 (GET /destinations/{slug}) ───────────────────────────────────

export interface DestinationDetail {
  id: number;
  title: string;
  title_en: string | null;
  slug: string;
  subtitle: string;
  summary: string;
  description: string; // HTML string (Markdown → HTML)

  location: LocationInfo;
  travel_info: TravelInfo;
  practical: PracticalInfo;

  fun_facts: string[];
  travel_tips: string[];
  safety_notes: string | null;
  getting_there: GettingThere;

  media: MediaInfo;
  categories: CategoryBrief[];
  tags: TagBrief[];

  stats: DestinationStatsFull;
  user_context: UserContext | null;

  created_at: string;
  updated_at: string;
}

export interface LocationInfo {
  country: string;
  region: string;
  continent: string;
  coordinates: { lat: number; lng: number };
  elevation: number;
}

export interface TravelInfo {
  best_season: string;
  difficulty: Difficulty;
  duration: string;
  budget: BudgetLevel;
  crowd_level: CrowdLevel;
  temperature: string;
}

export interface PracticalInfo {
  visa_info: string;
  language: string;
  currency: string;
  timezone: string;
}

export interface GettingThere {
  nearest_airport: string;
  routes: string[];
  local_transport: string;
}

export interface MediaInfo {
  cover_image_url: string;
  thumbnail_url: string;
  images: DestinationImage[];
}

export interface DestinationImage {
  id: number;
  url: string;
  thumbnail_url: string | null;
  alt_text: string;
  width: number;
  height: number;
  photographer: string;
  source: string;
  license: string;
}

export interface DestinationStatsFull {
  view_count: number;
  favorite_count: number;
  rating: number;
  rating_count: number;
}

export interface UserContext {
  is_favorited: boolean;
}

// ─── 分类 ────────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  cover_image_url: string;
  destination_count: number;
}

// ─── 标签 ────────────────────────────────────────────────────────────────────

export interface Tag {
  id: number;
  name: string;
  slug: string;
  destination_count: number;
}

// ─── 用户收藏 ────────────────────────────────────────────────────────────────

export interface FavoriteItem {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  country: string;
  continent: string;
  thumbnail_url: string;
  categories: CategoryBrief[];
  favorited_at: string;
}

// ─── 用户交互响应 ─────────────────────────────────────────────────────────────

export interface FavoriteToggleResponse {
  slug: string;
  is_favorited: boolean;
  favorite_count: number;
}

export interface ViewRecordResponse {
  slug: string;
  view_count: number;
}
