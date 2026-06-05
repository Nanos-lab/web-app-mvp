"""
用户交互路由 — 收藏 & 浏览记录。
"""

from __future__ import annotations

import math
from fastapi import APIRouter, HTTPException, Query, Request
from database import get_connection
from models import (
    PaginationMeta,
    FavoriteToggleResponse,
    FavoriteListResponse,
    FavoriteItemResponse,
    ViewRecordRequest,
    ViewRecordResponse,
    CategoryBrief,
    ErrorBody,
)

router = APIRouter(tags=["user"])


def _require_device_id(request: Request) -> str:
    """从请求头中提取 X-Device-Id，缺失时返回 401。"""
    device_id = request.headers.get("X-Device-Id")
    if not device_id:
        raise HTTPException(
            status_code=401,
            detail={
                "error": {
                    "code": "DEVICE_ID_REQUIRED",
                    "message": "请提供 X-Device-Id 请求头",
                }
            },
        )
    return device_id


def _get_destination_id(conn, slug: str) -> int:
    """通过 slug 查找目的地 ID，不存在时返回 404。"""
    row = conn.execute(
        "SELECT id FROM destinations WHERE slug = ? AND status = 'published'",
        (slug,),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "NOT_FOUND", "message": "未找到该目的地"}},
        )
    return row["id"]


@router.post(
    "/destinations/{slug}/favorite",
    response_model=FavoriteToggleResponse,
    responses={401: {"model": ErrorBody}, 404: {"model": ErrorBody}},
)
def toggle_favorite(slug: str, request: Request):
    """切换收藏 — POST 幂等（已收藏则取消，未收藏则添加）。"""
    device_id = _require_device_id(request)
    conn = get_connection()
    did = _get_destination_id(conn, slug)

    # 检查是否已收藏
    existing = conn.execute(
        "SELECT id FROM user_favorites WHERE user_id = ? AND destination_id = ?",
        (device_id, did),
    ).fetchone()

    if existing:
        # 已收藏 → 取消
        conn.execute("DELETE FROM user_favorites WHERE id = ?", (existing["id"],))
        conn.execute(
            "UPDATE destinations SET favorite_count = MAX(0, favorite_count - 1) WHERE id = ?",
            (did,),
        )
        conn.commit()
        new_count = conn.execute(
            "SELECT favorite_count FROM destinations WHERE id = ?", (did,)
        ).fetchone()["favorite_count"]
        return FavoriteToggleResponse(
            data={"slug": slug, "is_favorited": False, "favorite_count": new_count}
        )

    # 未收藏 → 添加
    conn.execute(
        "INSERT INTO user_favorites (user_id, destination_id) VALUES (?, ?)",
        (device_id, did),
    )
    conn.execute(
        "UPDATE destinations SET favorite_count = favorite_count + 1 WHERE id = ?",
        (did,),
    )
    conn.commit()
    new_count = conn.execute(
        "SELECT favorite_count FROM destinations WHERE id = ?", (did,)
    ).fetchone()["favorite_count"]
    return FavoriteToggleResponse(
        data={"slug": slug, "is_favorited": True, "favorite_count": new_count}
    )


@router.delete(
    "/destinations/{slug}/favorite",
    response_model=FavoriteToggleResponse,
    responses={401: {"model": ErrorBody}, 404: {"model": ErrorBody}},
)
def remove_favorite(slug: str, request: Request):
    """取消收藏。"""
    device_id = _require_device_id(request)
    conn = get_connection()
    did = _get_destination_id(conn, slug)

    existing = conn.execute(
        "SELECT id FROM user_favorites WHERE user_id = ? AND destination_id = ?",
        (device_id, did),
    ).fetchone()

    if existing:
        conn.execute("DELETE FROM user_favorites WHERE id = ?", (existing["id"],))
        conn.execute(
            "UPDATE destinations SET favorite_count = MAX(0, favorite_count - 1) WHERE id = ?",
            (did,),
        )
        conn.commit()

    new_count = conn.execute(
        "SELECT favorite_count FROM destinations WHERE id = ?", (did,)
    ).fetchone()["favorite_count"]
    return FavoriteToggleResponse(
        data={"slug": slug, "is_favorited": False, "favorite_count": new_count}
    )


@router.post(
    "/destinations/{slug}/view",
    response_model=ViewRecordResponse,
    responses={401: {"model": ErrorBody}, 404: {"model": ErrorBody}},
)
def record_view(slug: str, request: Request, body: ViewRecordRequest | None = None):
    """记录浏览 — 发送 X-Device-Id 标识用户，可选停留时长。"""
    device_id = _require_device_id(request)
    conn = get_connection()
    did = _get_destination_id(conn, slug)

    duration = body.duration_seconds if body else None

    conn.execute(
        "INSERT INTO user_views (user_id, destination_id, duration_seconds) VALUES (?, ?, ?)",
        (device_id, did, duration or 0),
    )
    conn.execute(
        "UPDATE destinations SET view_count = view_count + 1 WHERE id = ?", (did,)
    )
    conn.commit()

    new_count = conn.execute(
        "SELECT view_count FROM destinations WHERE id = ?", (did,)
    ).fetchone()["view_count"]
    return ViewRecordResponse(
        data={"slug": slug, "view_count": new_count}
    )


@router.get(
    "/user/favorites",
    response_model=FavoriteListResponse,
    responses={401: {"model": ErrorBody}},
)
def list_favorites(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """获取用户收藏列表 — 分页返回。"""
    device_id = _require_device_id(request)
    conn = get_connection()

    # COUNT
    total = conn.execute(
        "SELECT COUNT(*) AS cnt FROM user_favorites uf "
        "JOIN destinations d ON d.id = uf.destination_id AND d.status = 'published' "
        "WHERE uf.user_id = ?",
        (device_id,),
    ).fetchone()["cnt"]

    offset = (page - 1) * page_size
    rows = conn.execute(
        """
        SELECT d.id, d.title, d.slug, d.subtitle, d.country, d.continent,
               d.thumbnail_url, uf.created_at AS favorited_at
        FROM user_favorites uf
        JOIN destinations d ON d.id = uf.destination_id
        WHERE uf.user_id = ? AND d.status = 'published'
        ORDER BY uf.created_at DESC
        LIMIT ? OFFSET ?
        """,
        (device_id, page_size, offset),
    ).fetchall()

    # 批量获取分类
    dest_ids = [r["id"] for r in rows]
    cat_map: dict[int, list[CategoryBrief]] = {}
    if dest_ids:
        placeholders = ",".join("?" * len(dest_ids))
        cat_rows = conn.execute(
            f"""
            SELECT dc.destination_id, c.id, c.name, c.slug
            FROM destination_categories dc
            JOIN categories c ON c.id = dc.category_id
            WHERE dc.destination_id IN ({placeholders})
            ORDER BY c.sort_order
            """,
            dest_ids,
        ).fetchall()
        for cr in cat_rows:
            cat_map.setdefault(cr["destination_id"], []).append(
                CategoryBrief(id=cr["id"], name=cr["name"], slug=cr["slug"])
            )

    items = [
        FavoriteItemResponse(
            id=r["id"],
            title=r["title"],
            slug=r["slug"],
            subtitle=r["subtitle"],
            country=r["country"],
            continent=r["continent"],
            thumbnail_url=r["thumbnail_url"],
            categories=cat_map.get(r["id"], []),
            favorited_at=r["favorited_at"],
        )
        for r in rows
    ]

    total_pages = max(1, math.ceil(total / page_size))
    return FavoriteListResponse(
        data=items,
        meta=PaginationMeta(
            page=page, page_size=page_size, total=total, total_pages=total_pages
        ),
    )
