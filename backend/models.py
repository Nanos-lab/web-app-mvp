"""
Pydantic 请求/响应模型 — 严格匹配 docs/api_spec.md 的契约。
"""

from __future__ import annotations

import json
from typing import Any, Optional
from pydantic import BaseModel, Field

# ============================================================================
# 枚举
# ============================================================================

DIFFICULTY_OPTIONS = {"easy", "moderate", "difficult", "extreme"}
BUDGET_OPTIONS = {"budget", "moderate", "luxury"}
CROWD_LEVEL_OPTIONS = {"low", "medium", "high"}
STATUS_OPTIONS = {"published", "draft", "archived"}
SORT_OPTIONS = {"sort_order", "newest", "popular", "favorites", "rating"}

SORT_COLUMN_MAP: dict[str, str] = {
    "sort_order": "d.sort_order ASC",
    "newest": "d.created_at DESC",
    "popular": "d.view_count DESC",
    "favorites": "d.favorite_count DESC",
    "rating": "d.rating DESC",
}


# ============================================================================
# 通用
# ============================================================================

class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class ErrorResponse(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)


class ErrorBody(BaseModel):
    error: ErrorResponse


# ============================================================================
# 目的地 — 列表
# ============================================================================

class CategoryBrief(BaseModel):
    id: int
    name: str
    slug: str


class TagBrief(BaseModel):
    id: int
    name: str
    slug: str


class DestinationStatsBrief(BaseModel):
    view_count: int
    favorite_count: int
    rating: float


class DestinationCard(BaseModel):
    id: int
    title: str
    slug: str
    subtitle: str | None = None
    summary: str | None = None
    country: str
    continent: str | None = None
    difficulty: str | None = None
    budget: str | None = None
    duration: str | None = None
    thumbnail_url: str | None = None
    categories: list[CategoryBrief] = Field(default_factory=list)
    tags: list[TagBrief] = Field(default_factory=list)
    stats: DestinationStatsBrief
    created_at: str | None = None


class DestinationListResponse(BaseModel):
    data: list[DestinationCard]
    meta: PaginationMeta


# ============================================================================
# 目的地 — 详情
# ============================================================================

class Coordinates(BaseModel):
    lat: float
    lng: float


class LocationInfo(BaseModel):
    country: str
    region: str | None = None
    continent: str | None = None
    coordinates: Coordinates
    elevation: int | None = None


class TravelInfo(BaseModel):
    best_season: str | None = None
    difficulty: str | None = None
    duration: str | None = None
    budget: str | None = None
    crowd_level: str | None = None
    temperature: str | None = None


class PracticalInfo(BaseModel):
    visa_info: str | None = None
    language: str | None = None
    currency: str | None = None
    timezone: str | None = None


class GettingThere(BaseModel):
    nearest_airport: str | None = None
    routes: list[str] = Field(default_factory=list)
    local_transport: str | None = None


class DestinationImage(BaseModel):
    id: int
    url: str
    thumbnail_url: str | None = None
    alt_text: str | None = None
    width: int | None = None
    height: int | None = None
    photographer: str | None = None
    source: str | None = None
    license: str | None = None


class MediaInfo(BaseModel):
    cover_image_url: str | None = None
    thumbnail_url: str | None = None
    images: list[DestinationImage] = Field(default_factory=list)


class DestinationStatsFull(BaseModel):
    view_count: int
    favorite_count: int
    rating: float
    rating_count: int


class UserContext(BaseModel):
    is_favorited: bool


class DestinationDetail(BaseModel):
    id: int
    title: str
    title_en: str | None = None
    slug: str
    subtitle: str | None = None
    summary: str | None = None
    description: str | None = None

    location: LocationInfo
    travel_info: TravelInfo
    practical: PracticalInfo

    fun_facts: list[str] = Field(default_factory=list)
    travel_tips: list[str] = Field(default_factory=list)
    safety_notes: str | None = None
    getting_there: GettingThere

    media: MediaInfo
    categories: list[CategoryBrief] = Field(default_factory=list)
    tags: list[TagBrief] = Field(default_factory=list)

    stats: DestinationStatsFull
    user_context: UserContext | None = None

    created_at: str | None = None
    updated_at: str | None = None


class DestinationDetailResponse(BaseModel):
    data: DestinationDetail


# ============================================================================
# 分类 & 标签
# ============================================================================

class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None
    icon: str | None = None
    cover_image_url: str | None = None
    destination_count: int


class CategoryListResponse(BaseModel):
    data: list[CategoryResponse]


class TagResponse(BaseModel):
    id: int
    name: str
    slug: str
    destination_count: int


class TagListResponse(BaseModel):
    data: list[TagResponse]


# ============================================================================
# 用户交互
# ============================================================================

class FavoriteToggleResponse(BaseModel):
    data: dict[str, Any]  # { slug, is_favorited, favorite_count }


class ViewRecordRequest(BaseModel):
    duration_seconds: int | None = None


class ViewRecordResponse(BaseModel):
    data: dict[str, Any]  # { slug, view_count }


class FavoriteItemResponse(BaseModel):
    id: int
    title: str
    slug: str
    subtitle: str | None = None
    country: str
    continent: str | None = None
    thumbnail_url: str | None = None
    categories: list[CategoryBrief] = Field(default_factory=list)
    favorited_at: str | None = None


class FavoriteListResponse(BaseModel):
    data: list[FavoriteItemResponse]
    meta: PaginationMeta


# ============================================================================
# 工具函数
# ============================================================================

def _parse_json(value: str | None, default: Any = None) -> Any:
    """安全解析 JSON 字符串。"""
    if value is None:
        return default
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return default


def row_to_detail(
    row: sqlite3.Row,
    images: list[DestinationImage],
    categories: list[CategoryBrief],
    tags: list[TagBrief],
    is_favorited: bool = False,
) -> DestinationDetail:
    """将扁平查询行 + 关联数据组装为 DestinationDetail。"""
    coords = Coordinates(
        lat=row["latitude"] or 0,
        lng=row["longitude"] or 0,
    )

    getting_there_raw = _parse_json(row["getting_there"], {})
    if not isinstance(getting_there_raw, dict):
        getting_there_raw = {}

    return DestinationDetail(
        id=row["id"],
        title=row["title"],
        title_en=row["title_en"],
        slug=row["slug"],
        subtitle=row["subtitle"],
        summary=row["summary"],
        description=row["description"],
        location=LocationInfo(
            country=row["country"],
            region=row["region"],
            continent=row["continent"],
            coordinates=coords,
            elevation=row["elevation"],
        ),
        travel_info=TravelInfo(
            best_season=row["best_season"],
            difficulty=row["difficulty"],
            duration=row["duration"],
            budget=row["budget"],
            crowd_level=row["crowd_level"],
            temperature=row["temperature"],
        ),
        practical=PracticalInfo(
            visa_info=row["visa_info"],
            language=row["language"],
            currency=row["currency"],
            timezone=row["timezone"],
        ),
        fun_facts=_parse_json(row["fun_facts"], []),
        travel_tips=_parse_json(row["travel_tips"], []),
        safety_notes=row["safety_notes"],
        getting_there=GettingThere(
            nearest_airport=getting_there_raw.get("nearest_airport"),
            routes=getting_there_raw.get("routes", []),
            local_transport=getting_there_raw.get("local_transport"),
        ),
        media=MediaInfo(
            cover_image_url=row["cover_image_url"],
            thumbnail_url=row["thumbnail_url"],
            images=images,
        ),
        categories=categories,
        tags=tags,
        stats=DestinationStatsFull(
            view_count=row["view_count"] or 0,
            favorite_count=row["favorite_count"] or 0,
            rating=row["rating"] or 0,
            rating_count=row["rating_count"] or 0,
        ),
        user_context=UserContext(is_favorited=is_favorited) if is_favorited else UserContext(is_favorited=False),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )
