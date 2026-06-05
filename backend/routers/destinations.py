"""
目的地路由 — 列表（多维筛选+分页） & 详情。
"""

from __future__ import annotations

import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from database import get_connection
from models import (
    SORT_OPTIONS,
    SORT_COLUMN_MAP,
    DIFFICULTY_OPTIONS,
    BUDGET_OPTIONS,
    CROWD_LEVEL_OPTIONS,
    DestinationCard,
    DestinationStatsBrief,
    CategoryBrief,
    TagBrief,
    DestinationListResponse,
    DestinationDetailResponse,
    DestinationImage,
    PaginationMeta,
    ErrorBody,
    row_to_detail,
)

router = APIRouter(prefix="/destinations", tags=["destinations"])

# ─── 工具函数 ────────────────────────────────────────────────────────────────


def _fetch_categories_for_destinations(
    conn, dest_ids: list[int]
) -> dict[int, list[CategoryBrief]]:
    """批量获取目的地关联的分类。"""
    if not dest_ids:
        return {}
    placeholders = ",".join("?" * len(dest_ids))
    sql = f"""
        SELECT dc.destination_id, c.id, c.name, c.slug
        FROM destination_categories dc
        JOIN categories c ON c.id = dc.category_id
        WHERE dc.destination_id IN ({placeholders})
        ORDER BY c.sort_order
    """
    rows = conn.execute(sql, dest_ids).fetchall()
    result: dict[int, list[CategoryBrief]] = {did: [] for did in dest_ids}
    for r in rows:
        result[r["destination_id"]].append(
            CategoryBrief(id=r["id"], name=r["name"], slug=r["slug"])
        )
    return result


def _fetch_tags_for_destinations(
    conn, dest_ids: list[int]
) -> dict[int, list[TagBrief]]:
    """批量获取目的地关联的标签。"""
    if not dest_ids:
        return {}
    placeholders = ",".join("?" * len(dest_ids))
    sql = f"""
        SELECT dt.destination_id, t.id, t.name, t.slug
        FROM destination_tags dt
        JOIN tags t ON t.id = dt.tag_id
        WHERE dt.destination_id IN ({placeholders})
    """
    rows = conn.execute(sql, dest_ids).fetchall()
    result: dict[int, list[TagBrief]] = {did: [] for did in dest_ids}
    for r in rows:
        result[r["destination_id"]].append(
            TagBrief(id=r["id"], name=r["name"], slug=r["slug"])
        )
    return result


def _build_filter_clause(
    tags: Optional[str] = None,
    category: Optional[str] = None,
    continent: Optional[str] = None,
    country: Optional[str] = None,
    difficulty: Optional[str] = None,
    budget: Optional[str] = None,
    crowd_level: Optional[str] = None,
    search: Optional[str] = None,
) -> tuple[str, list]:
    """
    构建动态 WHERE 子句，返回 (clause_sql, params_list)。

    多选筛选（逗号分隔）使用 IN 子句。
    M2M 筛选（tags / category）使用 EXISTS 子查询。
    """
    clauses: list[str] = ["d.status = 'published'"]
    params: list = []

    # 枚举字段 — 单选或多选（逗号分隔）
    for col, raw in [
        ("d.difficulty", difficulty),
        ("d.budget", budget),
        ("d.crowd_level", crowd_level),
    ]:
        if raw:
            vals = [v.strip() for v in raw.split(",") if v.strip()]
            if vals:
                placeholders = ",".join("?" * len(vals))
                clauses.append(f"{col} IN ({placeholders})")
                params.extend(vals)

    # 大洲 / 国家 — 单选
    if continent:
        clauses.append("d.continent = ?")
        params.append(continent)

    if country:
        clauses.append("d.country = ?")
        params.append(country)

    # 关键词搜索 — LIKE
    if search:
        clauses.append("d.title LIKE ?")
        params.append(f"%{search}%")

    # 分类筛选（M2M — 子查询）
    if category:
        clauses.append(
            "EXISTS (SELECT 1 FROM destination_categories dci "
            "JOIN categories ci ON ci.id = dci.category_id "
            "WHERE dci.destination_id = d.id AND ci.slug = ?)"
        )
        params.append(category)

    # 标签筛选（M2M — 多个标签使用 AND 逻辑）
    if tags:
        tag_slugs = [t.strip() for t in tags.split(",") if t.strip()]
        for slug in tag_slugs:
            clauses.append(
                "EXISTS (SELECT 1 FROM destination_tags dti "
                "JOIN tags ti ON ti.id = dti.tag_id "
                "WHERE dti.destination_id = d.id AND ti.slug = ?)"
            )
            params.append(slug)

    where = " AND ".join(clauses)
    return f"WHERE {where}", params


# ─── 路由 ────────────────────────────────────────────────────────────────────


@router.get("", response_model=DestinationListResponse)
def list_destinations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort: str = Query("sort_order"),
    tags: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    continent: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    budget: Optional[str] = Query(None),
    crowd_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """获取目的地列表 — 支持多维筛选 / 排序 / 分页。"""
    conn = get_connection()

    # 参数校验
    if sort not in SORT_OPTIONS:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "INVALID_SORT", "message": f"无效的排序方式: {sort}"}},
        )

    if page_size > 100:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "PAGE_SIZE_EXCEEDED", "message": "page_size 不能超过 100"}},
        )

    order_clause = SORT_COLUMN_MAP.get(sort, "d.sort_order ASC")

    # 构建筛选条件
    where_clause, filter_params = _build_filter_clause(
        tags=tags,
        category=category,
        continent=continent,
        country=country,
        difficulty=difficulty,
        budget=budget,
        crowd_level=crowd_level,
        search=search,
    )

    # ── COUNT 总条数 ──
    count_sql = f"SELECT COUNT(*) AS cnt FROM destinations d {where_clause}"
    total = conn.execute(count_sql, filter_params).fetchone()["cnt"]

    # ── 分页查询目的地 ──
    offset = (page - 1) * page_size
    data_sql = f"""
        SELECT d.*
        FROM destinations d
        {where_clause}
        ORDER BY {order_clause}
        LIMIT ? OFFSET ?
    """
    rows = conn.execute(data_sql, filter_params + [page_size, offset]).fetchall()

    # ── 批量获取关联数据 ──
    dest_ids = [r["id"] for r in rows]
    cat_map = _fetch_categories_for_destinations(conn, dest_ids)
    tag_map = _fetch_tags_for_destinations(conn, dest_ids)

    # ── 组装响应 ──
    cards: list[DestinationCard] = []
    for r in rows:
        did = r["id"]
        cards.append(
            DestinationCard(
                id=did,
                title=r["title"],
                slug=r["slug"],
                subtitle=r["subtitle"],
                summary=r["summary"],
                country=r["country"],
                continent=r["continent"],
                difficulty=r["difficulty"],
                budget=r["budget"],
                duration=r["duration"],
                thumbnail_url=r["thumbnail_url"],
                categories=cat_map.get(did, []),
                tags=tag_map.get(did, []),
                stats=DestinationStatsBrief(
                    view_count=r["view_count"] or 0,
                    favorite_count=r["favorite_count"] or 0,
                    rating=round(r["rating"] or 0.0, 1),
                ),
                created_at=r["created_at"],
            )
        )

    total_pages = max(1, math.ceil(total / page_size))

    return DestinationListResponse(
        data=cards,
        meta=PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        ),
    )


@router.get(
    "/{slug}",
    response_model=DestinationDetailResponse,
    responses={404: {"model": ErrorBody}, 410: {"model": ErrorBody}},
)
def get_destination_detail(slug: str, request: Request):
    """通过 slug 获取目的地完整详情。"""
    conn = get_connection()

    row = conn.execute(
        "SELECT * FROM destinations WHERE slug = ?", (slug,)
    ).fetchone()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "NOT_FOUND", "message": "未找到该目的地"}},
        )

    if row["status"] == "archived":
        raise HTTPException(
            status_code=410,
            detail={"error": {"code": "GONE", "message": "该目的地已被归档"}},
        )

    did = row["id"]

    # 关联数据
    cat_map = _fetch_categories_for_destinations(conn, [did])
    tag_map = _fetch_tags_for_destinations(conn, [did])

    # 图片
    img_rows = conn.execute(
        "SELECT * FROM destination_images WHERE destination_id = ? ORDER BY sort_order",
        (did,),
    ).fetchall()
    images = [
        DestinationImage(
            id=ir["id"],
            url=ir["url"],
            thumbnail_url=ir["thumbnail_url"],
            alt_text=ir["alt_text"],
            width=ir["width"],
            height=ir["height"],
            photographer=ir["photographer"],
            source=ir["source"],
            license=ir["license"],
        )
        for ir in img_rows
    ]

    # 用户收藏状态
    is_favorited = False
    device_id = request.headers.get("X-Device-Id")
    if device_id:
        fav = conn.execute(
            "SELECT 1 FROM user_favorites WHERE user_id = ? AND destination_id = ?",
            (device_id, did),
        ).fetchone()
        is_favorited = fav is not None

    detail = row_to_detail(
        row, images, cat_map.get(did, []), tag_map.get(did, []), is_favorited
    )

    return DestinationDetailResponse(data=detail)
